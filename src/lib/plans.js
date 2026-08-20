// Sursă unică de adevăr pentru planurile VerifiCasa (Basic/Pro/Agent) — folosită
// de pagina de upgrade, de secțiunea „Planul meu" din Account, și de logica de
// ordonare a anunțurilor pe planuri de pe homepage/căutare. Rank mai mare =
// plan mai important (folosit direct la sortare: Agent > Pro > Basic > fără plan).
export const PLANS = [
  {
    id: "basic",
    rank: 1,
    name: "VerifiCasa Basic",
    shortName: "Basic",
    description: "Ideal pentru proprietarii care listează ocazional un singur imobil.",
    monthly: 35,
    yearly: 336,
    iconImg: "/images/generated/plan-icon-basic-v2.png",
    badgeImg: "/images/generated/plan-badge-basic-v2.png",
    accent: "navy",
    benefits: [
      "1 anunț activ pe platformă",
      "Galerie foto/video standard",
      "Verificare de bază inclusă",
      "Suport prin email",
      "Vizibilitate în căutare",
      "Badge „Verificat”",
    ],
  },
  {
    id: "pro",
    rank: 2,
    name: "VerifiCasa Pro",
    shortName: "Pro",
    description: "Pentru proprietari activi care vor vizibilitate maximă.",
    monthly: 50,
    yearly: 480,
    iconImg: "/images/generated/plan-icon-pro-v2.png",
    badgeImg: "/images/generated/plan-badge-pro-v2.png",
    accent: "emerald",
    benefits: [
      "Până la 5 anunțuri active",
      "Galerie extinsă, până la 250MB/fișier",
      "Poziționare prioritară în căutare",
      "Badge „Verificat Pro”",
      "Statistici avansate ale anunțului",
      "Suport prioritar",
    ],
  },
  {
    id: "agent",
    rank: 3,
    name: "VerifiCasa Agent",
    shortName: "Agent",
    description: "Pentru agenți și agenții cu portofolii extinse.",
    monthly: 89.99,
    yearly: 863.9,
    iconImg: "/images/generated/plan-icon-agent-v2.png",
    badgeImg: "/images/generated/plan-badge-agent-v2.png",
    accent: "gold",
    benefits: [
      "Anunțuri nelimitate",
      "Stocare nelimitată",
      "Panou dedicat de agenție",
      "Manager de cont dedicat",
      "Acces API & integrări",
      "Permisiuni multi-utilizator",
    ],
  },
];

export const PLAN_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p]));

// Plan curent al unui anunț/utilizator — 0 înseamnă „fără plan activ", ceea ce
// îl trimite mereu după Basic/Pro/Agent în orice sortare descrescătoare după rank.
export function planRank(planId) {
  return PLAN_BY_ID[planId]?.rank || 0;
}

export function getPlanMeta(planId) {
  return PLAN_BY_ID[planId] || null;
}

// Planul „efectiv” al unui anunț. Ordinea:
//   1. poster_plan_override — override manual de admin (date demo);
//   2. poster_plan — câmp denormalizat pe anunț, scris DOAR server-side
//      (VerifyCheckoutSession la plată, SyncPosterPlans la backfill). Sursa
//      principală de acum: Subscription.read e blocat la owner/admin, deci
//      browserul nu mai poate citi abonamentele altora.
//   3. planMap — fallback istoric (fetchActivePlanMap), care după blocarea
//      RLS mai întoarce cel mult abonamentul propriu; inofensiv, dar util
//      înainte de rularea SyncPosterPlans.
export function resolvePropertyPlan(property, planMap) {
  return (
    property?.poster_plan_override ||
    property?.poster_plan ||
    planMap?.get(property?.created_by_id) ||
    null
  );
}

// Comparator gata de folosit cu Array.prototype.sort — plan mai important
// întâi, apoi views_count descrescător, exact regula cerută pentru
// „Anunțuri recomandate": planul postatorului decide rândul, vizualizările
// decid ordinea în interiorul aceluiași rând/plan.
export function compareByPlanThenViews(planOf) {
  return (a, b) => {
    const rankDiff = planRank(planOf(b)) - planRank(planOf(a));
    if (rankDiff !== 0) return rankDiff;
    return (b.views_count || 0) - (a.views_count || 0);
  };
}

// Opțiuni gata de folosit pentru filtrul „Plan” din SearchFiltersDrawer —
// Agent primul (cel mai important), apoi Pro, apoi Basic — fiecare cu
// iconița mică de badge folosită și pe carduri, pentru recunoaștere vizuală
// instantă în filtrele de căutare/hartă.
export const PLAN_FILTER_OPTIONS = PLANS.slice()
  .reverse()
  .map((p) => ({ id: p.id, label: p.shortName || p.name, icon: p.badgeImg }));
