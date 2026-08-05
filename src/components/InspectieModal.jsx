import React, { useEffect, useState } from "react";
import { X, ShieldCheck, Send, ArrowLeft, ArrowRight, User, Home, MessageSquare, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";
import { inputCls, Field, ChoiceCard } from "@/components/postproperty/wizardUi";

const STEPS = [
  { id: 0, icon: User,          title: "Rol & Contact",   sub: "Cine ești și cum te contactăm" },
  { id: 1, icon: Home,          title: "Proprietate",     sub: "Despre ce locuim vorbim" },
  { id: 2, icon: MessageSquare, title: "Mesaj",          sub: "Detalii și trimite" },
];

const ROLES = [
  { value: "Proprietar",          emoji: "🏠", labelKey: "ins_role_owner" },
  { value: "Chiriaș/Cumpărător",  emoji: "🔑", labelKey: "ins_role_tenant" },
  { value: "Agent",               emoji: "🤝", labelKey: "ins_role_agent" },
];

const PACKAGES = [
  { value: "Verificare Standard",   emoji: "✅" },
  { value: "Tur 3D + Foto",         emoji: "📸" },
  { value: "Inspecție Completă",    emoji: "🛡️" },
  { value: "Audit Premium",         emoji: "🏆" },
];

export default function InspectieModal({ open, onClose }) {
  const { t } = useCountry();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Proprietar", address_or_url: "", package_interest: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onEsc); document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

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
        {/* Header */}
        <div className="gradient-navy shrink-0 p-6 text-white">
          <button onClick={onClose} aria-label={t("ins_close")} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald/20 text-emerald"><ShieldCheck className="h-6 w-6" /></span>
            <div>
              <h3 className="font-heading text-xl font-bold">{t("ins_title")}</h3>
              <p className="text-sm text-white/70">{t("ins_sub")}</p>
            </div>
          </div>
        </div>

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
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
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
                        emoji={r.emoji}
                        title={t(r.labelKey)}
                      />
                    ))}
                  </div>
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nume" required>
                    <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder={t("ins_ph_name")} className={inputCls} required />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder={t("ins_ph_email")} className={inputCls} required />
                  </Field>
                </div>
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
                          <span className="text-lg leading-none">{p.emoji}</span> {p.value}
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
      </div>
    </div>
  );
}