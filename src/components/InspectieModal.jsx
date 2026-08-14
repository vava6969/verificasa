import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, ShieldCheck, Send, ArrowLeft, ArrowRight, User, Home, MessageSquare, CheckCircle2, LogIn, Lock, KeyRound, Handshake, FileText, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { inputCls, Field, ChoiceCard } from "@/components/postproperty/wizardUi";

const STEPS = [
  { id: 0, icon: User,          title: "Rol & Contact",   sub: "Cine ești și cum te contactăm" },
  { id: 1, icon: Home,          title: "Proprietate",     sub: "Despre ce locuim vorbim" },
  { id: 2, icon: MessageSquare, title: "Mesaj",          sub: "Detalii și trimite" },
];

const ROLES = [
  { value: "Proprietar",          icon: Home,      labelKey: "ins_role_owner" },
  { value: "Chiriaș/Cumpărător",  icon: KeyRound,  labelKey: "ins_role_tenant" },
  { value: "Agent",               icon: Handshake, labelKey: "ins_role_agent" },
];

const PACKAGES = [
  { value: "Verificare Standard",   icon: CheckCircle2 },
  { value: "Verificare Acte",       icon: FileText },
  { value: "Verificare Completă",   icon: ShieldCheck },
  { value: "Plan Pro",              icon: Trophy },
];

export default function InspectieModal({ open, onClose }) {
  const { t } = useCountry();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Proprietar", address_or_url: "", package_interest: "", message: "" });
  const [sending, setSending] = useState(false);

  // Reset/lifecycle: rulează STRICT la deschidere/închidere, nu la orice
  // schimbare de referință a obiectului `user` din context (altfel un refresh
  // silențios al auth-ului în timp ce modalul e deschis reseta wizard-ul înapoi
  // la pasul 1 și părea că "se închide").
  useEffect(() => {
    if (!open) return;
    setStep(0);
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onEsc); document.body.style.overflow = ""; };
  }, [open]);

  // Preia automat numele și emailul din contul utilizatorului autentificat —
  // separat de efectul de mai sus, ca să nu resetețe pasul curent.
  useEffect(() => {
    if (!open || !isAuthenticated || !user) return;
    setForm((f) => ({ ...f, name: user.full_name || f.name, email: user.email || f.email }));
  }, [open, isAuthenticated, user?.full_name, user?.email]);

  if (!open) return null;

  const needsAuth = !isLoadingAuth && !isAuthenticated;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const validateStep = (s) => {
    if (s === 0) {
      if (!form.name.trim()) return "Completează numele tău.";
      if (!form.email.trim()) return "Completează emailul.";
    }
    if (s === 1 && !form.address_or_url.trim()) return "Adaugă adresa sau link-ul anunțului.";
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) { toast({ title: err, variant: "destructive" }); return; }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => {
    if (step === 0) { onClose(); return; }
    setStep((s) => s - 1);
  };

  const submit = async (e) => {
    e.preventDefault();
    for (let s = 0; s <= 1; s++) {
      const err = validateStep(s);
      if (err) { setStep(s); toast({ title: err, variant: "destructive" }); return; }
    }
    setSending(true);
    try {
      await base44.entities.InspectionRequest.create({ ...form, status: "Nou" });
      try {
        base44.functions.invoke("NotifyOnInspectionRequest", { request: { ...form } }).catch(() => {});
      } catch (_) {}
      toast({ title: t("ins_sent_t"), description: t("ins_sent_d") });
      setForm({ name: "", email: "", phone: "", role: "Proprietar", address_or_url: "", package_interest: "", message: "" });
      onClose();
    } catch (err) {
      toast({ title: t("ins_err"), variant: "destructive" });
    } finally { setSending(false); }
  };

  const Current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl dark:bg-card">
        {/* Header — poză de fundal generată cu Higgsfield + scrim, text jos-stânga */}
        <div className="relative shrink-0 overflow-hidden">
          <img src="/images/generated/inspectie-header-v1.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/92 via-navy-deep/55 to-navy-deep/15" />
          <button onClick={onClose} aria-label={t("ins_close")} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30">
            <X className="h-5 w-5" />
          </button>
          <div className="relative flex min-h-[136px] flex-col justify-end p-6 text-white">
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald/25 text-emerald backdrop-blur-sm"><ShieldCheck className="h-5 w-5" /></span>
            <h3 className="font-heading text-xl font-bold">{t("ins_title")}</h3>
            <p className="text-sm text-white/80">{t("ins_sub")}</p>
          </div>
        </div>

        {needsAuth ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-soft text-emerald"><Lock className="h-7 w-7" /></span>
            <div>
              <h3 className="font-heading text-lg font-bold text-navy dark:text-foreground">Autentificare necesară</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Pentru a solicita o verificare, trebuie să fii autentificat. Datele tale de contact se preiau automat din cont, iar cererea este mai ușor de procesată.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              <Button asChild className="gap-1.5 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
                <Link to="/login"><LogIn className="h-4 w-4" /> Intră în cont</Link>
              </Button>
              <Button asChild variant="outline" className="gap-1.5 rounded-full">
                <Link to="/register">Creează cont</Link>
              </Button>
            </div>
            <button onClick={onClose} className="mt-1 text-xs text-muted-foreground hover:underline">Anulează</button>
          </div>
        ) : (
        <>
        {/* Stepper header */}
        <div className="shrink-0 border-b border-border/60 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-emerald">
                <Current.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald">
                  Pasul {step + 1} din {STEPS.length}
                </p>
                <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">{Current.title}</h2>
              </div>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">{Current.sub}</p>
          </div>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full gradient-emerald transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="rounded-full bg-navy px-2.5 py-1 text-white">{Current.title}</span>
            {STEPS[step + 1] && (
              <span className="flex items-center gap-1 text-muted-foreground/70">
                <ArrowRight className="h-3 w-3" /> Urmează: {STEPS[step + 1].title}
              </span>
            )}
          </div>
        </div>

        {/* Step body */}
        <form
          onSubmit={submit}
          onKeyDown={(e) => {
            // Enter într-un câmp de tip input NU trebuie să trimită formularul
            // înainte de pasul final — altfel cererea pleacă fără mesaj și modalul
            // se închide direct din pasul 1 sau 2, sărind peste pasul "Mesaj".
            if (e.key === "Enter" && step < STEPS.length - 1) {
              e.preventDefault();
              next();
            }
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {/* Step 0 — Rol & Contact */}
            {step === 0 && (
              <div className="space-y-4">
                <Field label="Rolul tău" required>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {ROLES.map((r) => (
                      <ChoiceCard
                        key={r.value}
                        active={form.role === r.value}
                        onClick={() => set({ role: r.value })}
                        icon={r.icon}
                        title={t(r.labelKey)}
                      />
                    ))}
                  </div>
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nume" required>
                    <input value={form.name} readOnly={isAuthenticated} onChange={(e) => set({ name: e.target.value })} placeholder={t("ins_ph_name")} className={inputCls + (isAuthenticated ? " cursor-not-allowed bg-secondary/50" : "")} required />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" value={form.email} readOnly={isAuthenticated} onChange={(e) => set({ email: e.target.value })} placeholder={t("ins_ph_email")} className={inputCls + (isAuthenticated ? " cursor-not-allowed bg-secondary/50" : "")} required />
                  </Field>
                </div>
                {isAuthenticated && (
                  <p className="text-[11px] text-emerald">✓ Date de contact preluate automat din contul tău.</p>
                )}
                <Field label="Telefon">
                  <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder={t("ins_ph_phone")} className={inputCls} />
                </Field>
              </div>
            )}

            {/* Step 1 — Proprietate */}
            {step === 1 && (
              <div className="space-y-4">
                <Field label="Adresă / Link anunț" required hint="Adresa fizică a proprietății sau link-ul anunțului VerifiCasa">
                  <input value={form.address_or_url} onChange={(e) => set({ address_or_url: e.target.value })} placeholder={t("ins_ph_addr")} className={inputCls} required />
                </Field>
                <Field label="Pachet de interes" hint="Alege serviciul dorit">
                  <div className="grid grid-cols-2 gap-2.5">
                    {PACKAGES.map((p) => {
                      const active = form.package_interest === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => set({ package_interest: p.value })}
                          className={
                            "flex items-center gap-2 rounded-2xl border px-3.5 py-3 text-left text-sm font-semibold transition " +
                            (active
                              ? "border-emerald bg-emerald-soft text-emerald shadow-soft ring-1 ring-emerald/30"
                              : "border-border bg-white text-foreground/70 hover:border-emerald/40 dark:bg-card")
                          }
                        >
                          <p.icon className={"h-4 w-4 shrink-0 " + (active ? "text-emerald" : "text-muted-foreground")} /> {p.value}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
            )}

            {/* Step 2 — Mesaj */}
            {step === 2 && (
              <div className="space-y-4">
                <Field label="Mesaj" hint="Spune-ne ce vrei să verificăm, momentul preferat sau orice detaliu relevant">
                  <textarea value={form.message} onChange={(e) => set({ message: e.target.value })} rows={5} placeholder={t("ins_ph_msg")} className={inputCls} />
                </Field>
                {/* Summary */}
                <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rezumat cerere</p>
                  <ul className="space-y-1.5 text-sm text-foreground/80">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald" /> {form.role}</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald" /> {form.name || "—"}</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald" /> {form.email || "—"}</li>
                    {form.package_interest && <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald" /> {form.package_interest}</li>}
                  </ul>
                </div>
                <p className="text-center text-[11px] text-muted-foreground">{t("ins_footer")}</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="flex shrink-0 items-center gap-3 border-t border-border/60 bg-background/90 px-5 py-3 backdrop-blur-xl">
            <Button type="button" variant="outline" onClick={back} className="gap-1.5 rounded-full">
              <ArrowLeft className="h-4 w-4" /> {step === 0 ? t("ins_close") : "Înapoi"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} className="flex-1 gap-1.5 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
                Continuă <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={sending} className="flex-1 gap-2 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90 disabled:opacity-60">
                <Send className="h-4 w-4" /> {sending ? t("ins_sending") : t("ins_btn")}
              </Button>
            )}
          </div>
        </form>
        </>
        )}
      </div>
    </div>
  );
}