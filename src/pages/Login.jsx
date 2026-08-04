import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Home, User, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState(initialMode);

  const lang = (typeof window !== "undefined" && localStorage.getItem("vc_lang")) || "ro";
  const en = lang === "en";
  const L = en
    ? {
        signInTitle: "Sign in",
        signInSub: "Log in to continue your journey",
        signUpTitle: "Create account",
        signUpSub: "Join VerifiCasa to list & rent with trust",
        email: "Email",
        password: "Password",
        confirm: "Confirm password",
        username: "Full name",
        forgot: "Forgot password?",
        loginBtn: "LOGIN",
        registerBtn: "SIGN UP",
        loggingIn: "Logging in...",
        creating: "Creating...",
        orSignIn: "Or sign in with",
        orSignUp: "Or sign up with",
        google: "Google",
        apple: "Apple",
        agreeError: "Please accept the Terms & Privacy Policy",
        agreePrefix: "I agree to the",
        terms: "Terms",
        privacy: "Privacy Policy",
        verifyTitle: "Verify your email",
        verifySub: (email) => `We sent a code to ${email}`,
        verifyBtn: "Verify",
        verifying: "Verifying...",
        resend: "Resend",
        noCode: "Didn't get the code?",
        pwMismatch: "Passwords do not match",
        // overlay panels
        welcomeBack: "One of us?",
        welcomeBackSub: "Welcome back! Sign in to continue your journey with VerifiCasa.",
        signInCta: "SIGN IN",
        newHere: "New here?",
        newHereSub: "Join us today and discover verified properties. Create your account in seconds!",
        signUpCta: "SIGN UP",
        backHome: "Back to home",
      }
    : {
        signInTitle: "Autentificare",
        signInSub: "Conectează-te pentru a continua",
        signUpTitle: "Creează cont",
        signUpSub: "Alătură-te VerifiCasa pentru anunțuri sigure",
        email: "Email",
        password: "Parolă",
        confirm: "Confirmă parola",
        username: "Nume complet",
        forgot: "Ai uitat parola?",
        loginBtn: "AUTENTIFICARE",
        registerBtn: "ÎNREGISTRARE",
        loggingIn: "Conectare...",
        creating: "Se creează...",
        orSignIn: "Sau conectează-te cu",
        orSignUp: "Sau înregistrează-te cu",
        google: "Google",
        apple: "Apple",
        agreeError: "Te rugăm să accepți Termenii și Politica de Confidențialitate",
        agreePrefix: "Sunt de acord cu",
        terms: "Termenii",
        privacy: "Politica de Confidențialitate",
        verifyTitle: "Verifică-ți emailul",
        verifySub: (email) => `Am trimis un cod la ${email}`,
        verifyBtn: "Verifică",
        verifying: "Se verifică...",
        resend: "Retrimite",
        noCode: "Nu ai primit codul?",
        pwMismatch: "Parolele nu se potrivesc",
        welcomeBack: "Unul dintre noi?",
        welcomeBackSub: "Bine ai revenit! Conectează-te pentru a continua călătoria pe VerifiCasa.",
        signInCta: "AUTENTIFICARE",
        newHere: "Nou aici?",
        newHereSub: "Alătură-te astăzi și descoperă proprietăți verificate. Creează cont în câteva secunde!",
        signUpCta: "ÎNREGISTRARE",
        backHome: "Înapoi acasă",
      };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [agreed, setAgreed] = useState(false);

  const isLogin = mode === "login";
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
    if (password !== confirmPassword) return setError(L.pwMismatch);
    if (!agreed) return setError(L.agreeError);
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
      if (result?.access_token) base44.auth.setToken(result.access_token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || (en ? "Invalid code" : "Cod invalid"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: en ? "Code sent" : "Cod trimis" });
    } catch (err) {
      setError(err.message || (en ? "Failed to resend" : "Retrimitere eșuată"));
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/");
  const handleApple = () => base44.auth.loginWithProvider("apple", "/");

  // OTP verification step
  if (showOtp) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-10 overflow-hidden">
        <div className="absolute inset-0 gradient-navy opacity-95" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gold/20 blur-3xl animate-blob" />
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <VerifiCasaLogo size={44} tagline={false} />
            </Link>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald mb-4 shadow-glow">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{L.verifyTitle}</h1>
            <p className="text-white/70 mt-2 text-sm">{L.verifySub(email)}</p>
          </div>
          <div className="glass-panel rounded-2xl p-8">
            {error && <div className="mb-4 p-3 rounded-lg bg-destructive/15 text-destructive-foreground text-sm text-center">{error}</div>}
            <div className="flex justify-center mb-6">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-white/90" /><InputOTPSlot index={1} className="bg-white/90" /><InputOTPSlot index={2} className="bg-white/90" />
                  <InputOTPSlot index={3} className="bg-white/90" /><InputOTPSlot index={4} className="bg-white/90" /><InputOTPSlot index={5} className="bg-white/90" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button className="w-full h-12 font-semibold gradient-emerald text-navy" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{L.verifying}</>) : L.verifyBtn}
            </Button>
            <p className="text-center text-sm text-white/70 mt-4">
              {L.noCode}{" "}
              <button onClick={handleResend} className="text-gold font-medium hover:underline">{L.resend}</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-soft/40 via-background to-gold-soft/30" />
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-emerald/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-gold/10 blur-3xl animate-blob" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Desktop split card */}
        <div className="hidden md:block relative bg-card rounded-3xl shadow-soft border border-border overflow-hidden" style={{ minHeight: 600 }}>
          <div className="grid grid-cols-2">
            {/* Sign In form (left) */}
            <div className={cn("p-10 lg:p-12 flex flex-col justify-center transition-opacity duration-500", isLogin ? "opacity-100" : "opacity-0 pointer-events-none")}>
              <AuthForm
                isLogin
                L={L}
                email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                fullName={fullName} setFullName={setFullName}
                agreed={agreed} setAgreed={setAgreed}
                error={error} loading={loading}
                onSubmit={handleLogin}
                onGoogle={handleGoogle} onApple={handleApple}
              />
            </div>
            {/* Sign Up form (right) */}
            <div className={cn("p-10 lg:p-12 flex flex-col justify-center transition-opacity duration-500", !isLogin ? "opacity-100" : "opacity-0 pointer-events-none")}>
              <AuthForm
                isLogin={false}
                L={L}
                email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                fullName={fullName} setFullName={setFullName}
                agreed={agreed} setAgreed={setAgreed}
                error={error} loading={loading}
                onSubmit={handleRegister}
                onGoogle={handleGoogle} onApple={handleApple}
              />
            </div>
          </div>

          {/* Sliding overlay */}
          <motion.div
            className="absolute top-0 h-full w-1/2 overflow-hidden gradient-emerald"
            animate={{ left: isLogin ? "50%" : "0%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="relative h-full w-[200%] flex">
              {/* Panel shown when in sign-up mode (overlay on left) → "One of us?" */}
              <div className="w-1/2 h-full flex flex-col items-center justify-center text-center px-10 text-white">
                <VerifiCasaLogo size={56} tagline={false} className="mb-6 brightness-0 invert" />
                <h2 className="text-3xl font-bold mb-3">{L.welcomeBack}</h2>
                <p className="text-white/85 text-sm mb-8 max-w-xs">{L.welcomeBackSub}</p>
                <button
                  onClick={() => switchMode("login")}
                  className="px-10 py-3 rounded-full border-2 border-white text-white font-semibold tracking-wide hover:bg-white hover:text-emerald transition-colors"
                >
                  {L.signInCta}
                </button>
              </div>
              {/* Panel shown when in login mode (overlay on right) → "New here?" */}
              <div className="w-1/2 h-full flex flex-col items-center justify-center text-center px-10 text-white">
                <VerifiCasaLogo size={56} tagline={false} className="mb-6 brightness-0 invert" />
                <h2 className="text-3xl font-bold mb-3">{L.newHere}</h2>
                <p className="text-white/85 text-sm mb-8 max-w-xs">{L.newHereSub}</p>
                <button
                  onClick={() => switchMode("register")}
                  className="px-10 py-3 rounded-full border-2 border-white text-white font-semibold tracking-wide hover:bg-white hover:text-emerald transition-colors"
                >
                  {L.signUpCta}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile stacked layout */}
        <div className="md:hidden">
          <div className="bg-card rounded-3xl shadow-soft border border-border overflow-hidden">
            {/* Brand header */}
            <div className="gradient-emerald px-6 py-8 text-center text-white">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <VerifiCasaLogo size={40} tagline={false} className="brightness-0 invert" />
              </Link>
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="text-2xl font-bold">{isLogin ? L.signInTitle : L.signUpTitle}</h1>
                  <p className="text-white/80 text-sm mt-1">{isLogin ? L.signInSub : L.signUpSub}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Toggle pills */}
            <div className="px-6 pt-5">
              <div className="relative flex rounded-full bg-secondary p-1">
                <motion.div
                  className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full gradient-emerald"
                  animate={{ x: isLogin ? "0%" : "calc(100% + 4px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button onClick={() => switchMode("login")} className={cn("relative z-10 flex-1 py-2.5 text-sm font-semibold transition-colors", isLogin ? "text-white" : "text-muted-foreground")}>
                  {en ? "Sign in" : "Intră"}
                </button>
                <button onClick={() => switchMode("register")} className={cn("relative z-10 flex-1 py-2.5 text-sm font-semibold transition-colors", !isLogin ? "text-white" : "text-muted-foreground")}>
                  {en ? "Sign up" : "Cont nou"}
                </button>
              </div>
            </div>
            {/* Form */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 16 : -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <AuthForm
                    isLogin={isLogin}
                    L={L}
                    email={email} setEmail={setEmail}
                    password={password} setPassword={setPassword}
                    confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                    fullName={fullName} setFullName={setFullName}
                    agreed={agreed} setAgreed={setAgreed}
                    error={error} loading={loading}
                    onSubmit={isLogin ? handleLogin : handleRegister}
                    onGoogle={handleGoogle} onApple={handleApple}
                    compact
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-emerald transition">
          <Home className="h-4 w-4" />
          {L.backHome}
        </Link>
      </div>
    </div>
  );
}

/* ---------- Form sub-component ---------- */
function AuthForm({ isLogin, L, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, fullName, setFullName, agreed, setAgreed, error, loading, onSubmit, onGoogle, onApple, compact }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-foreground">{isLogin ? L.signInTitle : L.signUpTitle}</h2>
        <p className="text-muted-foreground text-sm mt-1">{isLogin ? L.signInSub : L.signUpSub}</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      {!isLogin && (
        <Field icon={User} label={L.username} value={fullName} onChange={setFullName} type="text" autoComplete="name" />
      )}
      <Field icon={Mail} label={L.email} value={email} onChange={setEmail} type="email" autoComplete="email" autoFocus={isLogin} />
      <Field icon={Lock} label={L.password} value={password} onChange={setPassword} type="password" autoComplete={isLogin ? "current-password" : "new-password"} />
      {!isLogin && <Field icon={Lock} label={L.confirm} value={confirmPassword} onChange={setConfirmPassword} type="password" autoComplete="new-password" />}

      {isLogin && (
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-emerald hover:underline">{L.forgot}</Link>
        </div>
      )}

      {!isLogin && (
        <div className="flex items-start gap-2 text-sm">
          <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-border accent-emerald" />
          <label htmlFor="agree" className="text-muted-foreground leading-relaxed">
            {L.agreePrefix}{" "}
            <Link to="/terms" className="text-emerald font-medium hover:underline">{L.terms}</Link>{" "}
            {L.and}{" "}
            <Link to="/privacy" className="text-emerald font-medium hover:underline">{L.privacy}</Link>.
          </label>
        </div>
      )}

      <Button type="submit" className="w-full h-12 font-semibold gradient-emerald text-navy hover:opacity-90" disabled={loading}>
        {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isLogin ? L.loggingIn : L.creating}</>) : (isLogin ? L.loginBtn : L.registerBtn)}
      </Button>

      {/* Divider */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">{isLogin ? L.orSignIn : L.orSignUp}</span></div>
      </div>

      {/* Social */}
      <div className="flex gap-3 justify-center">
        <SocialBtn onClick={onGoogle} label={L.google}><GoogleIcon className="w-5 h-5" /></SocialBtn>
        <SocialBtn onClick={onApple} label={L.apple} dark><AppleIcon className="w-5 h-5" /></SocialBtn>
      </div>
    </form>
  );
}

function Field({ icon: Icon, label, value, onChange, type, autoComplete, autoFocus }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          placeholder="••••••••"
          className="pl-10 h-11 bg-secondary/60 border-transparent focus-visible:bg-card"
        />
      </div>
    </div>
  );
}

function SocialBtn({ children, onClick, label, dark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full border transition-all hover:scale-105",
        dark ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:border-emerald"
      )}
    >
      {children}
    </button>
  );
}