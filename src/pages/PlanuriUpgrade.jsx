import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Sparkles, Building2, Check, Lock, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// ---------------------------------------------------------------------------
// Preț animat stil "odometru" — aceeași tehnică ca la HeroCountdown
// (inspirată din NumberFlow): fiecare caracter alunecă în sus/jos la schimbare,
// fără librărie externă nouă.
// ---------------------------------------------------------------------------
function RollingChar({ char }) {
  return (
    <span
      className="relative inline-grid overflow-hidden text-center align-top"
      style={{ width: char === "." ? "0.32em" : char === "," ? "0.28em" : "0.64em" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="tabular-nums"
          style={{ gridArea: "1 / 1" }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function RollingPrice({ value }) {
  const str = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return <span className="inline-flex">{str.split("").map((c, i) => <RollingChar key={i} char={c} />)}</span>;
}

// Badge roșu pulsant — folosit sub fiecare buton de plan, indică vizual că
// funcția de plată nu e încă live.
function ComingSoonBadge() {
  return (
    <motion.span
      animate={{ boxShadow: ["0 0 0px rgba(225,29,72,0.0)", "0 0 16px rgba(225,29,72,0.5)", "0 0 0px rgba(225,29,72,0.0)"] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/60 bg-rose-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-rose-500"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
      </span>
      Coming Soon
    </motion.span>
  );
}

const ACCENTS = {
  emerald: { iconBg: "bg-emerald-soft text-emerald", chip: "bg-emerald-soft text-emerald", btn: "bg-emerald hover:bg-emerald/90", ring: "ring-emerald/25", border: "border-emerald/30" },
  gold: { iconBg: "bg-gold-soft text-gold-deep", chip: "bg-gold-soft text-gold-deep", btn: "bg-gold-deep hover:bg-gold-deep/90", ring: "ring-gold/35", border: "border-gold" },
  navy: { iconBg: "bg-navy/10 text-navy dark:bg-white/10 dark:text-foreground", chip: "bg-navy/10 text-navy dark:bg-white/10 dark:text-foreground", btn: "bg-navy hover:bg-navy/90", ring: "ring-navy/15", border: "border-navy/25" },
};

const PLANS = [
  {
    id: "basic",
    name: "VerifiCasa Basic",
    monthly: 35,
    icon: Home,
    accent: "emerald",
    tagline: "Pentru proprietari care listează ocazional.",
    features: ["Publicare anunț standard", "Verificare de bază inclusă", "Suport prin email", "Vizibilitate în căutare"],
  },
  {
    id: "pro",
    name: "VerifiCasa Pro",
    monthly: 50,
    icon: Sparkles,
    accent: "gold",
    popular: true,
    tagline: "Pentru proprietari activi care vor vizibilitate maximă.",
    features: ["Tot ce include Basic", "Badge „Verificat Pro”", "Poziționare prioritară în căutare", "Statistici avansate ale anunțului", "Suport prioritar"],
  },
  {
    id: "agent",
    name: "VerifiCasa Agent",
    monthly: 89.99,
    icon: Building2,
    accent: "navy",
    tagline: "Pentru agenți și agenții cu portofolii extinse.",
    features: ["Tot ce include Pro", "Portofoliu multi-anunțuri", "Panou dedicat de agenție", "Manager de cont dedicat", "Acces API & integrări"],
  },
];

const ANNUAL_DISCOUNT = 0.2;

function PlanCard({ plan, annual, index }) {
  const { toast } = useToast();
  const a = ACCENTS[plan.accent];
  const Icon = plan.icon;
  const monthlyEquivalent = annual ? plan.monthly * (1 - ANNUAL_DISCOUNT) : plan.monthly;
  const annualTotal = plan.monthly * 12 * (1 - ANNUAL_DISCOUNT);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-[0_20px_60px_-24px_rgba(16,24,40,0.18)] dark:bg-card sm:p-7 ${
        plan.popular ? `${a.border} ring-2 ${a.ring} sm:-translate-y-3` : "border-border"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-deep px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-soft">
          Cel mai popular
        </span>
      )}

      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${a.iconBg}`}>
        <Icon className="h-6 w-6" />
      </span>

      <h3 className="mt-4 font-heading text-xl font-bold text-navy dark:text-foreground">{plan.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{plan.tagline}</p>

      <div className="mt-5 flex items-end gap-1.5">
        <span className="font-heading text-4xl font-extrabold text-navy dark:text-foreground">
          <RollingPrice value={Math.round(monthlyEquivalent * 100) / 100} />
        </span>
        <span className="pb-1.5 text-sm font-semibold text-muted-foreground">RON / lună</span>
      </div>
      <p className="mt-1 h-4 text-xs text-muted-foreground">
        {annual ? `Facturat anual: ${annualTotal.toFixed(2)} RON / an` : "Facturat lunar"}
      </p>

      <button
        type="button"
        onClick={() =>
          toast({
            title: "Disponibil în curând",
            description: "Planurile de plată sunt în pregătire — revenim cu toate detaliile în curând.",
          })
        }
        className={`mt-5 flex h-11 w-full items-center justify-center rounded-full text-sm font-bold text-white shadow-soft transition ${a.btn}`}
      >
        Alege planul
      </button>
      <div className="mt-3 flex justify-center">
        <ComingSoonBadge />
      </div>

      <div className="mt-6 space-y-2.5 border-t border-border/60 pt-5">
        <p className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${a.chip}`}>
          {plan.id === "basic" ? "Ce include" : "Tot ce e mai sus, plus"}
        </p>
        <ul className="space-y-2">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <Check className={`mt-0.5 h-4 w-4 shrink-0 ${a.iconBg.split(" ")[1]}`} />
              {/* Textul beneficiilor e blurat intenționat — planurile/prețurile
                  finale nu sunt încă stabilite; doar structura vizuală e gata. */}
              <span className="select-none blur-[5px]">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function PlanuriUpgrade() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="relative overflow-hidden bg-background pb-24 pt-16 sm:pt-20">
      {/* Glow-uri decorative în header, consistente cu restul site-ului */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald/10 blur-[100px]" />
      <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-gold/15 blur-[90px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Lock className="h-3 w-3" /> Planuri VerifiCasa
          </span>
          <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-navy dark:text-foreground sm:text-5xl">
            Planuri care cresc{" "}
            <span className="inline-block rotate-[-1deg] rounded-lg border-2 border-dashed border-gold px-3 py-0.5 text-gold-deep dark:text-gold">
              odată cu tine
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            Alege nivelul de vizibilitate potrivit pentru anunțurile tale. Verificarea de bază rămâne mereu gratuită, indiferent de plan.
          </p>
        </div>

        {/* Disclaimer — de ce e totul blurat / butoanele nu merg încă */}
        <div className="mx-auto mt-6 flex max-w-xl items-start gap-2.5 rounded-2xl border border-amber-300/50 bg-amber-50/70 p-4 text-left text-xs leading-relaxed text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/[0.07] dark:text-amber-200">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Planurile sunt în pregătire — prețurile de mai jos sunt orientative, iar beneficiile complete vor fi publicate în curând pe
            site și în aplicația mobilă.
          </span>
        </div>

        {/* Toggle lunar / anual */}
        <div className="mt-9 flex justify-center">
          <div className="relative inline-flex items-center rounded-full border border-border bg-secondary/50 p-1">
            {["Lunar", "Anual"].map((label, i) => {
              const isAnnual = i === 1;
              const active = annual === isAnnual;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setAnnual(isAnnual)}
                  className={`relative z-10 flex h-9 items-center gap-1.5 rounded-full px-5 text-sm font-bold transition-colors ${
                    active ? "text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="planToggleActive"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-full bg-emerald shadow-soft"
                    />
                  )}
                  {label}
                  {isAnnual && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${active ? "bg-white/25 text-white" : "bg-emerald-soft text-emerald"}`}>
                      -20%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Carduri */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-3 sm:gap-5 lg:gap-7">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} annual={annual} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
