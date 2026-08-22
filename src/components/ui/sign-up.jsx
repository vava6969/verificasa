import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import AuthSwitch from "@/components/ui/auth-switch";
import { useCountry } from "@/components/CountryContext";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

/**
 * AuthComponent — sign in and sign up on one card.
 *
 * Sized for a phone first: 40px fields, 44px actions, 10px gaps, so sign in
 * fits a 375x812 screen without scrolling and sign up only just reaches the
 * fold. The sm: step is the one that gets the roomier version, not the phone.
 *
 * Copy lives in src/i18n.js under the `au_` keys, the shell is AuthLayout, and
 * the mode toggle is AuthSwitch. Nothing here re-implements a system the app
 * already has.
 *
 * DO NOT reorder the Base44 auth calls: register -> OTP -> verifyOtp ->
 * setToken -> hard redirect via window.location.href. navigate() does not work
 * for that last step, the session is only picked up on a full document load.
 */
export function AuthComponent() {
  const { t } = useCountry();
  const [searchParams] = useSearchParams();

  // /register redirects here as /login?mode=register. Returning users arriving
  // at /login land on sign in, which is what the header button promises.
  const [mode, setMode] = useState(() =>
    searchParams.get("mode") === "register" ? "signup" : "signin"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [done, setDone] = useState(false);

  const isSignup = mode === "signup";

  const switchMode = (next) => {
    setError("");
    setMode(next);
  };

  const submitSignin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError(t("au_err_email"));
    if (!password) return setError(t("au_err_password"));
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = safeReturnTo();
    } catch {
      // A failed sign in only ever means bad credentials, and the platform
      // returns that message in English. Use ours — this app is Romanian first.
      // Sign up keeps the server text, because Base44 does not expose its
      // password complexity rules anywhere except in that validation message.
      setError(t("au_err_invalid"));
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError(t("au_err_email"));
    if (password.length < 8) return setError(t("au_err_pw_short"));
    if (password !== confirm) return setError(t("au_err_pw_mismatch"));
    if (!fullName.trim()) return setError(t("au_err_name"));
    if (!agreed) return setError(t("au_err_agree"));
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      if (fullName) {
        try { await base44.auth.updateMe({ full_name: fullName }); } catch {}
      }
      setShowOtp(true);
    } catch (err) {
      setError(err.message || t("au_err_register"));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode: otp });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      setDone(true);
      setTimeout(() => { window.location.href = safeReturnTo(); }, 1400);
    } catch (err) {
      setError(err.message || t("au_err_code"));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: t("au_otp_sent") });
    } catch (err) {
      setError(err.message || t("au_otp_resend_failed"));
    }
  };

  // ---- Account created ----
  if (done) {
    return (
      <AuthLayout title={t("au_done_title")} subtitle={t("au_done_sub")}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
          {t("au_signing_in")}
        </div>
      </AuthLayout>
    );
  }

  // ---- Email verification ----
  if (showOtp) {
    return (
      <AuthLayout title={t("au_otp_title")} subtitle={t("au_otp_sub", { email })}>
        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="flex justify-center py-1">
          <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="bg-secondary/70" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <SubmitButton onClick={verifyOtp} disabled={loading || otp.length < 6} loading={loading}
          loadingLabel={t("au_otp_verifying")} className="mt-4">
          {t("au_otp_verify")}
        </SubmitButton>

        <p className="mt-3.5 text-center text-[13px] text-muted-foreground sm:text-sm">
          {t("au_otp_missing")}{" "}
          <button type="button" onClick={resendOtp} className="font-semibold text-primary hover:underline">
            {t("au_otp_resend")}
          </button>
        </p>
      </AuthLayout>
    );
  }

  // ---- Sign in / sign up ----
  return (
    <AuthLayout title={isSignup ? t("au_title_signup") : t("au_title_signin")}>
      <AuthSwitch
        mode={mode}
        onChange={switchMode}
        labels={{ signin: t("au_tab_signin"), signup: t("au_tab_signup") }}
      />

      {error && <ErrorNote className="mt-3.5">{error}</ErrorNote>}

      <form onSubmit={isSignup ? submitSignup : submitSignin} className="mt-3 space-y-1.5 sm:mt-5 sm:space-y-3.5">
        <Field
          id="email"
          name="email"
          type="email"
          label={t("au_email")}
          value={email}
          onChange={setEmail}
          autoComplete="email"
          autoFocus
        />

        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="text-[13px] font-semibold text-foreground sm:text-sm">
              {t("au_password")}
            </label>
            {isSignup ? (
              <span className="text-[11px] leading-none text-muted-foreground">{t("au_pw_hint")}</span>
            ) : (
              <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                {t("au_forgot")}
              </Link>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="h-10 border-white/15 bg-white/[0.06] sm:h-11"
          />
        </div>

        {isSignup && (
          <>
            <Field
              id="confirm"
              name="confirm-password"
              type="password"
              label={t("au_confirm")}
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
            <Field
              id="full-name"
              name="name"
              label={t("au_name")}
              hint={t("au_name_hint")}
              value={fullName}
              onChange={setFullName}
              autoComplete="name"
            />
            <label className="flex items-start gap-2 text-[12px] leading-snug text-muted-foreground sm:text-sm">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
              />
              <span>
                {t("au_agree_pre")}{" "}
                <Link to="/terms" className="font-medium text-primary hover:underline">{t("au_agree_terms")}</Link>{" "}
                {t("au_agree_and")}{" "}
                <Link to="/privacy" className="font-medium text-primary hover:underline">{t("au_agree_privacy")}</Link>
              </span>
            </label>
          </>
        )}

        <SubmitButton
          type="submit"
          disabled={loading}
          loading={loading}
          loadingLabel={isSignup ? t("au_creating") : t("au_signing_in")}
        >
          {isSignup ? t("au_submit_signup") : t("au_submit_signin")}
        </SubmitButton>
      </form>

      {/* Social comes after the form: the email path is the real one. */}
      <div className="my-2.5 flex items-center gap-3 sm:my-5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] text-muted-foreground sm:text-xs">{t("au_or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <SocialButton onClick={() => base44.auth.loginWithProvider("google", safeReturnTo())}>
          <GoogleSvg />Google
        </SocialButton>
        <SocialButton onClick={() => base44.auth.loginWithProvider("apple", safeReturnTo())}>
          <AppleSvg />Apple
        </SocialButton>
      </div>
    </AuthLayout>
  );
}

/* ---------- pieces ---------- */

function Field({ id, name, label, hint, type = "text", value, onChange, autoComplete, autoFocus }) {
  return (
    <div className="space-y-1 sm:space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-foreground sm:text-sm">{label}</label>
        {hint && <span className="truncate text-[11px] leading-none text-muted-foreground">{hint}</span>}
      </div>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="h-10 border-white/15 bg-white/[0.06] sm:h-11"
      />
    </div>
  );
}

function SubmitButton({ children, loading, loadingLabel, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded bg-primary text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:h-12 sm:text-base ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function SocialButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap-44 flex h-9 items-center justify-center gap-2 rounded border border-white/15 bg-white/[0.06] text-[13px] font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-white/[0.12] sm:h-11 sm:text-sm"
    >
      {children}
    </button>
  );
}

function ErrorNote({ children, className = "" }) {
  return (
    <p role="alert" className={`border-l-2 border-destructive bg-destructive/5 py-2 pl-3 text-sm text-destructive ${className}`}>
      {children}
    </p>
  );
}

function GoogleSvg() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
  );
}

function AppleSvg() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.13.94-3.95.94-.82 0-2.07-.92-3.41-.89-1.75.03-3.38 1.02-4.28 2.59-1.83 3.17-.47 7.85 1.31 10.42.87 1.26 1.91 2.67 3.27 2.62 1.32-.05 1.82-.85 3.41-.85 1.59 0 2.04.85 3.43.82 1.42-.03 2.31-1.27 3.18-2.54 1-1.46 1.41-2.88 1.43-2.95-.03-.01-2.75-1.05-2.78-4.18zM14.6 4.59c.72-.87 1.21-2.08 1.08-3.29-1.04.04-2.31.69-3.06 1.56-.67.77-1.26 2-1.1 3.19 1.16.09 2.35-.59 3.08-1.46z"/></svg>
  );
}

export default AuthComponent;
