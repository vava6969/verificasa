import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Home } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthSwitch from "@/components/ui/auth-switch";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

const HERO_HOUSE_URL =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80";

const AuthBackground = () => (
  <>
    <motion.img
      src={HERO_HOUSE_URL}
      alt=""
      className="h-full w-full object-cover opacity-15 dark:opacity-10"
      initial={{ scale: 1 }}
      animate={{ scale: 1.08 }}
      transition={{ duration: 14, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
  </>
);

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState(initialMode);

  const lang = (typeof window !== "undefined" && localStorage.getItem("vc_lang")) || "ro";
  const en = lang === "en";
  const L = en
    ? {
        loginTitle: "Welcome back",
        loginSub: "Log in to your VerifiCasa account",
        registerTitle: "Create your account",
        registerSub: "Join VerifiCasa to list and rent with trust",
        email: "Email",
        password: "Password",
        confirm: "Confirm password",
        forgot: "Forgot password?",
        loginBtn: "Log in",
        registerBtn: "Create account",
        loggingIn: "Logging in...",
        creating: "Creating account...",
        or: "or",
        google: "Continue with Google",
        apple: "Continue with Apple",
        agreeError: "You must accept the Terms & Conditions and Privacy Policy",
        agreePrefix: "I agree to",
        terms: "Terms & Conditions",
        and: "and",
        privacy: "Privacy Policy",
        verifyTitle: "Verify your email",
        verifySub: (email) => `We sent a code to ${email}`,
        verifyBtn: "Verify",
        verifying: "Verifying...",
        resend: "Resend",
        noCode: "Didn't receive the code?",
        pwMismatch: "Passwords do not match",
      }
    : {
        loginTitle: "Bine ai revenit",
        loginSub: "Conectează-te la contul VerifiCasa",
        registerTitle: "Creează cont nou",
        registerSub: "Alătură-te VerifiCasa pentru anunțuri sigure",
        email: "Email",
        password: "Parolă",
        confirm: "Confirmă parola",
        forgot: "Ai uitat parola?",
        loginBtn: "Autentificare",
        registerBtn: "Creează cont",
        loggingIn: "Conectare...",
        creating: "Se creează contul...",
        or: "sau",
        google: "Continuă cu Google",
        apple: "Continuă cu Apple",
        agreeError: "Trebuie să accepți Termenii și Condițiile și Politica de Confidențialitate",
        agreePrefix: "Sunt de acord cu",
        terms: "Termenii și Condițiile",
        and: "și",
        privacy: "Politica de Confidențialitate",
        verifyTitle: "Verifică-ți emailul",
        verifySub: (email) => `Am trimis un cod la ${email}`,
        verifyBtn: "Verifică",
        verifying: "Se verifică...",
        resend: "Retrimite",
        noCode: "Nu ai primit codul?",
        pwMismatch: "Parolele nu se potrivesc",
      };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [agreed, setAgreed] = useState(false);

  const switchMode = (m) => {
    setError("");
    setMode(m);
    setSearchParams(m === "register" ? { mode: "register" } : {}, { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || (en ? "Invalid email or password" : "Email sau parolă invalidă"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError(L.pwMismatch);
      return;
    }
    if (!agreed) {
      setError(L.agreeError);
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || (en ? "Registration failed" : "Înregistrare eșuată"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = "/";
    } catch (err) {
      setError(err.message || (en ? "Invalid verification code" : "Cod de verificare invalid"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: en ? "Code sent" : "Cod trimis", description: en ? "Check your email for the new code." : "Verifică emailul pentru noul cod." });
    } catch (err) {
      setError(err.message || (en ? "Failed to resend code" : "Retrimitere eșuată"));
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/");
  const handleApple = () => base44.auth.loginWithProvider("apple", "/");

  // OTP verification step (register flow)
  if (showOtp) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"><AuthBackground /></div>
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <VerifiCasaLogo size={40} tagline={false} />
            </Link>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald mb-4 shadow-glow">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{L.verifyTitle}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{L.verifySub(email)}</p>
          </div>
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-soft border border-border p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
            )}
            <div className="flex justify-center mb-6">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                <InputOTPGroup>
                  <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                  <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button className="w-full h-12 font-medium bg-emerald hover:bg-emerald/90" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{L.verifying}</>) : L.verifyBtn}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {L.noCode}{" "}
              <button onClick={handleResend} className="text-emerald font-medium hover:underline">{L.resend}</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isLogin = mode === "login";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"><AuthBackground /></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-5">
            <VerifiCasaLogo size={40} tagline={false} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isLogin ? L.loginTitle : L.registerTitle}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {isLogin ? L.loginSub : L.registerSub}
          </p>
        </div>

        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-soft border border-border p-6 sm:p-8">
          {/* Toggle switch */}
          <div className="mb-6">
            <AuthSwitch
              mode={mode}
              onChange={switchMode}
              labels={{ login: en ? "Login" : "Autentificare", register: en ? "Register" : "Înregistrare" }}
            />
          </div>

          {/* Social login */}
          <Button variant="outline" className="w-full h-11 text-sm font-medium mb-2.5" onClick={handleGoogle}>
            <GoogleIcon className="w-5 h-5 mr-2" />
            {L.google}
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium mb-5 bg-black text-white border-black hover:bg-black/90"
            onClick={handleApple}
          >
            <AppleIcon className="w-5 h-5 mr-2" />
            {L.apple}
          </Button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">{L.or}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          {/* Forms */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">{L.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">{L.password}</Label>
                  <Link to="/forgot-password" className="text-xs text-emerald hover:underline">{L.forgot}</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11" required />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 font-medium bg-emerald hover:bg-emerald/90" disabled={loading}>
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{L.loggingIn}</>) : L.loginBtn}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">{L.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">{L.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-sm">{L.confirm}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-11" required />
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border accent-emerald" />
                <label htmlFor="agree" className="text-muted-foreground leading-relaxed">
                  {L.agreePrefix}{" "}
                  <Link to="/terms" className="text-emerald font-medium hover:underline">{L.terms}</Link>{" "}
                  {L.and}{" "}
                  <Link to="/privacy" className="text-emerald font-medium hover:underline">{L.privacy}</Link>.
                </label>
              </div>
              <Button type="submit" className="w-full h-11 font-medium bg-emerald hover:bg-emerald/90" disabled={loading}>
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{L.creating}</>) : L.registerBtn}
              </Button>
            </form>
          )}
        </div>

        <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-emerald transition">
          <Home className="h-4 w-4" />
          {en ? "Back to home" : "Înapoi la pagina principală"}
        </Link>
      </div>
    </div>
  );
}