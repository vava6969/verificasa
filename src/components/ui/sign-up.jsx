import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, Lock, User, Loader2, ArrowRight, ArrowLeft, Check, Home, Sparkles, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

/**
 * AuthComponent — glassmorphism multi-step auth (sign-up / sign-in)
 * Adapted from the EaseMize "Sign Up" 21st.dev component, re-themed for VerifiCasa.
 *
 * Props:
 *  - logo: ReactNode (brand mark)
 *  - brandName: string
 */
export function AuthComponent({ logo, brandName = "VerifiCasa" }) {
  const lang = (typeof window !== "undefined" && localStorage.getItem("vc_lang")) || "ro";
  const en = lang === "en";
  const L = en
    ? {
        getStarted: "Get started with us",
        alreadyHave: "Already have an account?",
        signIn: "Sign in",
        signUp: "Sign up",
        newHere: "New here?",
        signUpCta: "Create one",
        continueWith: "Continue with",
        or: "OR",
        fullName: "Full name",
        email: "Email",
        password: "Password",
        confirm: "Confirm password",
        next: "Next",
        back: "Back",
        create: "Create account",
        login: "Log in",
        forgot: "Forgot password?",
        agree: "I agree to the Terms & Privacy Policy",
        step: "Step",
        of: "of",
        verifyTitle: "Verify your email",
        verifySub: (e) => `We sent a 6-digit code to ${e}`,
        verify: "Verify",
        verifying: "Verifying...",
        resend: "Resend code",
        success: "Account created!",
        successSub: "Welcome to " + brandName,
        loggingIn: "Logging in...",
        creating: "Creating...",
        pwMismatch: "Passwords do not match",
        agreeError: "Please accept the Terms & Privacy Policy",
        invalid: "Invalid email or password",
        regFailed: "Registration failed",
        invalidCode: "Invalid code",
        backHome: "Back to home",
      }
    : {
        getStarted: "Începe cu noi",
        alreadyHave: "Ai deja cont?",
        signIn: "Conectează-te",
        signUp: "Înregistrează-te",
        newHere: "Nou aici?",
        signUpCta: "Creează unul",
        continueWith: "Continuă cu",
        or: "SAU",
        fullName: "Nume complet",
        email: "Email",
        password: "Parolă",
        confirm: "Confirmă parola",
        next: "Următor",
        back: "Înapoi",
        create: "Creează cont",
        login: "Conectare",
        forgot: "Ai uitat parola?",
        agree: "Sunt de acord cu Termenii și Politica de Confidențialitate",
        step: "Pasul",
        of: "din",
        verifyTitle: "Verifică-ți emailul",
        verifySub: (e) => `Am trimis un cod din 6 cifre la ${e}`,
        verify: "Verifică",
        verifying: "Se verifică...",
        resend: "Retrimite cod",
        success: "Cont creat!",
        successSub: "Bun venit pe " + brandName,
        loggingIn: "Conectare...",
        creating: "Se creează...",
        pwMismatch: "Parolele nu se potrivesc",
        agreeError: "Te rugăm să accepți Termenii și Politica de Confidențialitate",
        invalid: "Email sau parolă invalidă",
        regFailed: "Înregistrare eșuată",
        invalidCode: "Cod invalid",
        backHome: "Înapoi acasă",
      };

  const [mode, setMode] = useState("signup"); // signup | signin
  const [step, setStep] = useState(0); // 0 name, 1 email, 2 password, 3 success
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");

  const isSignup = mode === "signup";
  const totalSteps = 3;

  const fireConfetti = () => {
    const colors = ["#1F7048", "#DE4E12", "#161C29", "#F8F6F1"];
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors }), 150);
    setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors }), 150);
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", safeReturnTo());
  const handleApple = () => base44.auth.loginWithProvider("apple", safeReturnTo());

  const next = (e) => {
    e.preventDefault();
    setError("");
    if (step === 0 && !fullName.trim()) return setError(en ? "Enter your name" : "Introdu numele");
    if (step === 1 && !email.trim()) return setError(en ? "Enter your email" : "Introdu emailul");
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError(L.pwMismatch);
    if (!agreed) return setError(L.agreeError);
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      if (fullName) {
        try { await base44.auth.updateMe({ full_name: fullName }); } catch {}
      }
      setShowOtp(true);
    } catch (err) {
      setError(err.message || L.regFailed);
    } finally {
      setLoading(false);
    }
  };

  const submitSignin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || L.invalid);
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
      fireConfetti();
      setStep(3);
      setTimeout(() => { window.location.href = safeReturnTo(); }, 1800);
    } catch (err) {
      setError(err.message || L.invalidCode);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    try { await base44.auth.resendOtp(email); toast({ title: en ? "Code sent" : "Cod trimis" }); }
    catch (err) { setError(err.message || (en ? "Failed to resend" : "Retrimitere eșuată")); }
  };

  const switchMode = (m) => { setError(""); setMode(m); setStep(0); };

  // ---- OTP verification screen ----
  if (showOtp) {
    return (
      <Shell logo={logo} brandName={brandName} L={L}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded bg-emerald mb-4 shadow-soft">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{L.verifyTitle}</h2>
          <p className="text-muted-foreground text-sm mt-1">{L.verifySub(email)}</p>
        </motion.div>
        {error && <ErrorBox>{error}</ErrorBox>}
        <div className="flex justify-center mb-5">
          <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} className="bg-secondary/70" />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <button onClick={verifyOtp} disabled={loading || otp.length < 6}
          className="w-full h-12 rounded font-semibold bg-emerald text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{L.verifying}</> : <>{L.verify}<ArrowRight className="w-4 h-4" /></>}
        </button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {en ? "Didn't get it?" : "Nu l-ai primit?"}{" "}
          <button onClick={resendOtp} className="text-emerald font-medium hover:underline">{L.resend}</button>
        </p>
      </Shell>
    );
  }

  // ---- Success screen ----
  if (step === 3) {
    return (
      <Shell logo={logo} brandName={brandName} L={L}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald mb-5 shadow-soft">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground">{L.success}</h2>
          <p className="text-muted-foreground mt-2">{L.successSub}</p>
          <Loader2 className="w-5 h-5 animate-spin text-emerald mx-auto mt-4" />
        </motion.div>
      </Shell>
    );
  }

  // ---- Main auth card ----
  return (
    <Shell logo={logo} brandName={brandName} L={L}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{isSignup ? L.getStarted : L.signIn}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isSignup ? L.newHere : L.alreadyHave}{" "}
          {isSignup ? null : null}
        </p>
      </div>

      {/* Continue with social */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <SocialBtn onClick={handleGoogle}>
          <GoogleSvg /><span className="text-sm font-medium">Google</span>
        </SocialBtn>
        <SocialBtn onClick={handleApple}>
          <AppleSvg /><span className="text-sm font-medium">Apple</span>
        </SocialBtn>
      </div>

      {/* OR divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground tracking-wider">{L.or}</span></div>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {isSignup ? (
        <form onSubmit={step < totalSteps - 1 ? next : submitSignup} className="space-y-4">
          {/* progress */}
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-emerald" : "bg-secondary")} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mb-1">{L.step} {step + 1} {L.of} {totalSteps}</p>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <Field icon={User} value={fullName} onChange={setFullName} placeholder={L.fullName} autoFocus />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <Field icon={Mail} value={email} onChange={setEmail} placeholder={L.email} type="email" autoFocus />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-4">
                <Field icon={Lock} value={password} onChange={setPassword} placeholder={L.password} type="password" autoFocus />
                <Field icon={Lock} value={confirm} onChange={setConfirm} placeholder={L.confirm} type="password" />
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-border accent-emerald" />
                  <span>{L.agree}</span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)}
                className="h-12 px-5 rounded border border-border text-foreground font-medium flex items-center gap-1.5 hover:bg-secondary transition">
                <ArrowLeft className="w-4 h-4" />{L.back}
              </button>
            )}
            <button type="submit" disabled={loading}
              className="flex-1 h-12 rounded font-semibold bg-emerald text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{L.creating}</> : (step < totalSteps - 1 ? <>{L.next}<ArrowRight className="w-4 h-4" /></> : <>{L.create}<ArrowRight className="w-4 h-4" /></>)}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={submitSignin} className="space-y-4">
          <Field icon={Mail} value={email} onChange={setEmail} placeholder={L.email} type="email" autoFocus />
          <Field icon={Lock} value={password} onChange={setPassword} placeholder={L.password} type="password" />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-emerald hover:underline">{L.forgot}</Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-12 rounded font-semibold bg-emerald text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{L.loggingIn}</> : <>{L.login}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}

      {/* toggle */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        {isSignup ? L.alreadyHave : L.newHere}{" "}
        <button onClick={() => switchMode(isSignup ? "signin" : "signup")} className="text-emerald font-semibold hover:underline">
          {isSignup ? L.signIn : L.signUpCta}
        </button>
      </p>
    </Shell>
  );
}

/* ---------- Shell (animated gradient bg + glass card) ---------- */
function Shell({ logo, brandName, L, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden bg-background">
      {/* animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-soft/50 via-background to-gold-soft/40" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* brand */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2.5">
            {logo}
            <span className="text-xl font-bold text-foreground tracking-tight">{brandName}</span>
          </Link>
        </div>
        {/* glass card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="glass-panel rounded p-7 sm:p-8">
          {children}
        </motion.div>
        <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-emerald transition">
          <Home className="h-4 w-4" />{L.backHome}
        </Link>
      </div>
    </div>
  );
}

/* ---------- small pieces ---------- */
function Field({ icon: Icon, value, onChange, placeholder, type = "text", autoFocus }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
        className="pl-10 h-12 bg-secondary/60 border-transparent focus-visible:bg-card focus-visible:border-emerald/40" />
    </div>
  );
}

function ErrorBox({ children }) {
  return <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{children}</div>;
}

function SocialBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center justify-center gap-2 h-11 rounded border border-border bg-card hover:border-emerald/50 hover:bg-secondary/40 transition">
      {children}
    </button>
  );
}

function GoogleSvg() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
  );
}

function AppleSvg() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.13.94-3.95.94-.82 0-2.07-.92-3.41-.89-1.75.03-3.38 1.02-4.28 2.59-1.83 3.17-.47 7.85 1.31 10.42.87 1.26 1.91 2.67 3.27 2.62 1.32-.05 1.82-.85 3.41-.85 1.59 0 2.04.85 3.43.82 1.42-.03 2.31-1.27 3.18-2.54 1-1.46 1.41-2.88 1.43-2.95-.03-.01-2.75-1.05-2.78-4.18zM14.6 4.59c.72-.87 1.21-2.08 1.08-3.29-1.04.04-2.31.69-3.06 1.56-.67.77-1.26 2-1.1 3.19 1.16.09 2.35-.59 3.08-1.46z"/></svg>
  );
}

export default AuthComponent;