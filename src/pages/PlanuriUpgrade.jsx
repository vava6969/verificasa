import React, { useState } from "react";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { Briefcase, Database, Server, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// ---------------------------------------------------------------------------
// Clonă 1:1 a componentei de referință (21st.dev — @uilayout.contact/pricing-section):
// aceleași culori, același toggle, aceeași animație de reveal (blur + slide),
// același NumberFlow pentru preț. Singurul lucru schimbat e conținutul:
// numele planurilor, prețurile (RON) și textele — exact cum s-a cerut.
// ---------------------------------------------------------------------------

function Reveal({ as = "div", index = 0, className, children }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.4, duration: 0.5 }}
    >
      {children}
    </MotionTag>
  );
}

// Badge roșu pulsant — funcția de plată nu e încă live (adăugat peste designul
// clonat, așa cum am discutat separat de referința 21st.dev).
function ComingSoonBadge() {
  return (
    <motion.span
      animate={{
        boxShadow: [
          "0 0 0px rgba(225,29,72,0.0)",
          "0 0 16px rgba(225,29,72,0.55)",
          "0 0 0px rgba(225,29,72,0.0)",
        ],
      }}
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

// Toggle Lunar / Anual — pill gradient albastru cu layoutId spring, identic cu
// referința (border-4 border-blue-600, gradient from-blue-500 via-blue-400 to-blue-600,
// shadow-sm shadow-blue-600).
function PricingSwitch({ annual, onSwitch }) {
  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full border border-gray-200 bg-neutral-50 p-1 dark:border-white/10 dark:bg-white/5">
        <button
          type="button"
          onClick={() => onSwitch(false)}
          className={`relative z-10 h-10 flex-shrink-0 rounded-full px-3 py-1 font-medium transition-colors sm:h-12 sm:px-6 sm:py-2 ${
            !annual ? "text-white" : "text-muted-foreground hover:text-black dark:hover:text-white"
          }`}
        >
          {!annual && (
            <motion.span
              layoutId="planSwitchPill"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute left-0 top-0 h-10 w-full rounded-full border-4 border-blue-600 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-600 shadow-sm shadow-blue-600 sm:h-12"
            />
          )}
          <span className="relative">Lunar</span>
        </button>
        <button
          type="button"
          onClick={() => onSwitch(true)}
          className={`relative z-10 h-10 flex-shrink-0 rounded-full px-3 py-1 font-medium transition-colors sm:h-12 sm:px-6 sm:py-2 ${
            annual ? "text-white" : "text-muted-foreground hover:text-black dark:hover:text-white"
          }`}
        >
          {annual && (
            <motion.span
              layoutId="planSwitchPill"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute left-0 top-0 h-10 w-full rounded-full border-4 border-blue-600 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-600 shadow-sm shadow-blue-600 sm:h-12"
            />
          )}
          <span className="relative flex items-center gap-2">
            Anual
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-black">
              Economisești 20%
            </span>
          </span>
        </button>
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
    badgeImg: "/images/generated/plan-badge-basic-v2.png",
    features: [
      { icon: <Briefcase size={20} />, text: "1 anunț activ pe platformă" },
      { icon: <Database size={20} />, text: "Galerie foto/video standard" },
      { icon: <Server size={20} />, text: "Verificare de bază inclusă" },
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
    badgeImg: "/images/generated/plan-badge-pro-v2.png",
    features: [
      { icon: <Briefcase size={20} />, text: "Până la 5 anunțuri active" },
      { icon: <Database size={20} />, text: "Galerie extinsă, până la 250MB/fișier" },
      { icon: <Server size={20} />, text: "Poziționare prioritară în căutare" },
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
    iconImg: "/images/generated/plan-icon-agent-v2.png",
    badgeImg: "/images/generated/plan-badge-agent-v2.png",
    features: [
      { icon: <Briefcase size={20} />, text: "Anunțuri nelimitate" },
      { icon: <Database size={20} />, text: "Stocare nelimitată" },
      { icon: <Server size={20} />, text: "Panou dedicat de agenție" },
    ],
    includesLabel: "Tot ce e în Pro, plus:",
    includes: ["Manager de cont dedicat", "Acces API & integrări", "Permisiuni multi-utilizator"],
  },
];

function PlanCard({ plan, annual }) {
  const { toast } = useToast();

  const handleSelectPlan = () => {
    // TODO (Stripe): la conectarea plăților, înlocuiește toast-ul de mai jos cu
    // un redirect spre checkout, folosind plan.id + intervalul (lunar/anual).
    toast({
      title: "Disponibil în curând",
      description: "Planurile de plată sunt în pregătire — revenim cu toate detaliile în curând.",
    });
  };

  return (
    <Card
      className={`relative overflow-visible border-neutral-200 dark:border-white/10 ${
        plan.popular ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-950/30" : "bg-white dark:bg-neutral-900"
      }`}
    >
      {plan.badgeImg && (
        <img
          src={plan.badgeImg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-3 -top-3 z-20 h-16 w-16 object-contain drop-shadow-lg sm:-right-4 sm:-top-4 sm:h-20 sm:w-20"
        />
      )}
      <CardHeader className="text-left">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {plan.iconImg && (
              <img
                src={plan.iconImg}
                alt=""
                aria-hidden="true"
                className="h-11 w-11 shrink-0 object-contain drop-shadow sm:h-12 sm:w-12"
              />
            )}
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">{plan.name}</h3>
          </div>
          {plan.popular && (
            <span className="shrink-0 rounded-full bg-blue-500 px-3 py-1 text-sm font-medium text-white">
              Popular
            </span>
          )}
        </div>
        <p className="mb-4 text-sm text-gray-600 dark:text-neutral-400">{plan.description}</p>
        <div className="flex items-baseline">
          <span className="text-4xl font-semibold text-gray-900 dark:text-white">
            <NumberFlow
              value={annual ? plan.yearly : plan.monthly}
              locales="ro-RO"
              format={plan.decimals ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 }}
              className="text-4xl font-semibold"
            />
            <span className="ml-1 align-top text-xl">RON</span>
          </span>
          <span className="ml-1 text-gray-600 dark:text-neutral-400">/{annual ? "an" : "lună"}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <button
          type="button"
          onClick={handleSelectPlan}
          className={`mb-4 w-full rounded-xl p-4 text-lg font-semibold transition active:scale-[0.98] ${
            plan.popular
              ? "border border-blue-400 bg-gradient-to-t from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500"
              : "border border-neutral-700 bg-gradient-to-t from-neutral-900 to-neutral-600 text-white shadow-lg shadow-neutral-900"
          }`}
        >
          Alege planul
        </button>
        <div className="mb-2 flex justify-center">
          <ComingSoonBadge />
        </div>

        <ul className="space-y-2 py-5 font-semibold">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center">
              <span className="mr-3 mt-0.5 grid place-content-center text-neutral-800 dark:text-neutral-300">
                {feature.icon}
              </span>
              {/* Beneficiile sunt blurate intenționat — pachetele finale nu sunt
                  încă stabilite; doar structura vizuală (identică referinței) e gata. */}
              <span className="select-none text-sm text-gray-600 blur-[4px] dark:text-neutral-400">
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-3 border-t border-neutral-200 pt-4 dark:border-white/10">
          <h4 className="mb-3 text-base font-medium text-gray-900 dark:text-white">{plan.includesLabel}</h4>
          <ul className="space-y-2 font-semibold">
            {plan.includes.map((item, i) => (
              <li key={i} className="flex items-center">
                <span className="mr-3 mt-0.5 grid h-6 w-6 place-content-center rounded-full border border-blue-500 bg-green-50">
                  <CheckCheck className="h-4 w-4 text-blue-500" />
                </span>
                <span className="select-none text-sm text-gray-600 blur-[4px] dark:text-neutral-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlanuriUpgrade() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="relative mx-auto min-h-screen overflow-hidden bg-neutral-100 px-4 pb-24 pt-16 dark:bg-neutral-950 sm:pt-20">
      {/* Glow radial albastru — identic referinței (mix-blend multiply peste bg-neutral-100) */}
      <div
        className="pointer-events-none absolute left-[10%] right-[10%] top-0 z-0 h-full w-[80%]"
        style={{
          backgroundImage: "radial-gradient(circle at center, #206ce8 0%, transparent 70%)",
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative z-10">
        <div className="mx-auto mb-6 max-w-3xl text-center">
          <Reveal as="h2" index={0} className="mb-4 text-3xl font-medium text-gray-900 dark:text-white sm:text-4xl md:text-6xl">
            Planuri potrivite{" "}
            <span className="inline-block rounded-xl border border-dashed border-blue-500 bg-blue-100 px-2 py-1 capitalize dark:bg-blue-500/10">
              pentru tine
            </span>
          </Reveal>
          <Reveal as="p" index={1} className="mx-auto w-[85%] text-sm text-gray-600 dark:text-neutral-400 sm:w-[70%] sm:text-base">
            Alege nivelul de vizibilitate potrivit pentru anunțurile tale. Verificarea de bază rămâne mereu gratuită,
            indiferent de plan.
          </Reveal>
        </div>

        <Reveal as="div" index={2}>
          <PricingSwitch annual={annual} onSwitch={setAnnual} />
        </Reveal>

        <p className="mx-auto mt-4 max-w-md text-center text-xs text-gray-500 dark:text-neutral-500">
          Planurile sunt în pregătire — prețurile sunt orientative, iar beneficiile complete vor fi publicate în
          curând.
        </p>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 py-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} as="div" index={3 + i}>
              <PlanCard plan={plan} annual={annual} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
