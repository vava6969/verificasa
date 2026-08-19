import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

// Pagina de planuri în limbajul "registru": carduri pe hârtie, rigle, verde
// doar pe planul recomandat, prețuri cu NumberFlow. Logica de checkout
// (CreateCheckoutSession / VerifyCheckoutSession) rămâne neschimbată.

function PricingSwitch({ annual, onSwitch }) {
  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-md border border-border bg-card p-1">
        {[
          { key: false, label: "Lunar" },
          { key: true, label: "Anual" },
        ].map((opt) => (
          <button
            key={String(opt.key)}
            type="button"
            onClick={() => onSwitch(opt.key)}
            className={`relative z-10 h-10 flex-shrink-0 rounded-sm px-4 py-1 text-sm font-semibold transition-colors sm:px-6 ${
              annual === opt.key ? "text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {annual === opt.key && (
              <motion.span
                layoutId="planSwitchPill"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="absolute inset-0 rounded-sm bg-navy"
              />
            )}
            <span className="relative flex items-center gap-2">
              {opt.label}
              {opt.key && (
                <span className={`stamp-line rounded-sm px-1.5 py-0.5 ${annual ? "bg-white/15 text-white" : "bg-emerald-soft text-emerald"}`}>
                  −20%
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const PLANS = [
  {
    id: "basic",
    name: "VerifiCasa Basic",
    description: "Ideal pentru proprietarii care listează ocazional un singur imobil.",
    monthly: 35,
    yearly: 336, // 35 × 12 × 0.8
    popular: false,
    iconImg: "/images/generated/plan-icon-basic-v2.png",
    features: [
      "1 anunț activ pe platformă",
      "Galerie foto/video standard",
      "Verificare de bază inclusă",
    ],
    includesLabel: "Include gratuit:",
    includes: ["Suport prin email", "Vizibilitate în căutare", "Badge „Verificat”"],
  },
  {
    id: "pro",
    name: "VerifiCasa Pro",
    description: "Pentru proprietari activi care vor vizibilitate maximă.",
    monthly: 50,
    yearly: 480, // 50 × 12 × 0.8
    popular: true,
    iconImg: "/images/generated/plan-icon-pro-v2.png",
    features: [
      "Până la 5 anunțuri active",
      "Galerie extinsă, până la 250MB/fișier",
      "Poziționare prioritară în căutare",
    ],
    includesLabel: "Tot ce e în Basic, plus:",
    includes: ["Badge „Verificat Pro”", "Statistici avansate ale anunțului", "Suport prioritar"],
  },
  {
    id: "agent",
    name: "VerifiCasa Agent",
    description: "Pentru agenți și agenții cu portofolii extinse.",
    monthly: 89.99,
    yearly: 863.9, // 89.99 × 12 × 0.8
    decimals: true,
    popular: false,
    gold: true,
    iconImg: "/images/generated/plan-icon-agent-v2.png",
    features: [
      "Anunțuri nelimitate",
      "Stocare nelimitată",
      "Panou dedicat de agenție",
    ],
    includesLabel: "Tot ce e în Pro, plus:",
    includes: ["Manager de cont dedicat", "Acces API & integrări", "Permisiuni multi-utilizator"],
  },
];

function PlanCard({ plan, annual }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleSelectPlan = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setCheckingOut(true);
    try {
      const res = await base44.functions.invoke("CreateCheckoutSession", {
        plan_id: plan.id,
        interval: annual ? "yearly" : "monthly",
      });
      const url = res?.data?.url || res?.url;
      const errorMsg = res?.data?.error || res?.error;
      if (url) {
        window.location.href = url;
        return;
      }
      toast({
        title: "Nu am putut porni plata",
        description: errorMsg || "Încearcă din nou în câteva minute.",
        variant: "destructive",
      });
    } catch (e) {
      toast({
        title: "Nu am putut porni plata",
        description: "Încearcă din nou în câteva minute.",
        variant: "destructive",
      });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div
      className={`relative flex h-full flex-col rounded-lg border bg-card shadow-soft ${
        plan.popular ? "border-emerald" : plan.gold ? "border-gold/50" : "border-border"
      }`}
    >
      <div className={`h-[2px] rounded-t-lg ${plan.popular ? "bg-emerald" : plan.gold ? "bg-gold-deep" : "bg-border"}`} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {plan.iconImg && (
              <img src={plan.iconImg} alt="" aria-hidden="true" className="h-10 w-10 shrink-0 object-contain" />
            )}
            <h3 className="font-heading text-xl text-navy dark:text-foreground sm:text-2xl">{plan.name}</h3>
          </div>
          {plan.popular && (
            <span className="stamp-line shrink-0 rounded-sm bg-emerald px-2 py-1 text-white">Recomandat</span>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

        <div className="mt-4 flex items-baseline border-b border-border pb-4">
          <span className="font-heading text-4xl text-navy dark:text-foreground">
            <NumberFlow
              value={annual ? plan.yearly : plan.monthly}
              locales="ro-RO"
              format={plan.decimals ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 }}
            />
          </span>
          <span className="ml-1.5 font-mono text-sm text-muted-foreground">RON/{annual ? "an" : "lună"}</span>
        </div>

        <Button
          onClick={handleSelectPlan}
          disabled={checkingOut}
          variant={plan.popular ? "default" : "outline"}
          className="mt-4 w-full gap-2"
          size="lg"
        >
          {checkingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Se deschide plata...
            </>
          ) : (
            "Alege planul"
          )}
        </Button>

        <ul className="mt-5 divide-y divide-border border-y border-border">
          {plan.features.map((text, i) => (
            <li key={i} className="flex items-baseline gap-2.5 py-2 text-sm text-foreground/80">
              <span aria-hidden="true" className="font-mono text-emerald">✓</span>
              {text}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <p className="kicker">{plan.includesLabel}</p>
          <ul className="mt-2 space-y-1.5">
            {plan.includes.map((item, i) => (
              <li key={i} className="flex items-baseline gap-2.5 text-sm text-muted-foreground">
                <span aria-hidden="true" className="font-mono text-emerald/70">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PlanuriUpgrade() {
  const [annual, setAnnual] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");
    if (!checkout) return;
    if (checkout === "success") {
      toast({ title: "Plată reușită!", description: "Abonamentul tău a fost activat. Îți mulțumim!" });
      // Confirmă server-side sesiunea Stripe și salvează planul pe cont — fără
      // asta, plata trece prin Stripe dar utilizatorul rămâne fără plan activ
      // în aplicație (vezi VerifyCheckoutSession).
      if (sessionId) {
        base44.functions.invoke("VerifyCheckoutSession", { session_id: sessionId }).catch(() => {});
      }
    } else if (checkout === "cancelled") {
      toast({ title: "Plată anulată", description: "Nicio sumă nu a fost taxată." });
    }
    params.delete("checkout");
    params.delete("session_id");
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20 lg:px-8">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <Reveal>
          <p className="kicker text-emerald">Planuri</p>
          <h1 className="mt-2 font-heading text-3xl text-navy dark:text-foreground sm:text-4xl md:text-5xl">
            Planuri potrivite pentru tine
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Alege nivelul de vizibilitate potrivit pentru anunțurile tale. Verificarea de bază rămâne mereu gratuită,
            indiferent de plan.
          </p>
        </Reveal>
      </div>

      <Reveal>
        <PricingSwitch annual={annual} onSwitch={setAnnual} />
      </Reveal>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 py-8 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Reveal key={plan.id}>
            <PlanCard plan={plan} annual={annual} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
