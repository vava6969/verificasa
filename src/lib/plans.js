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
    description_en: "For owners who list a single property now and then.",
    monthly: 35,
    yearly: 336,
    iconImg: "/images/generated/plan-icon-basic-v2.png",
    badgeImg: "/images/generated/plan-badge-basic-v2.png",
    accent: "navy",
    tours3d: null,
    boostsIncluded: null,
    benefits: [
      "1 anunț activ pe platformă",
      "Galerie foto/video standard",
      "Verificare de bază inclusă",
      "Suport prin email",
      "Vizibilitate în căutare",
      "Badge „Verificat”",
    ],
    benefits_en: [
      "1 active listing",
      "Standard photo/video gallery",
      "Basic verification included",
      "Email support",
      "Search visibility",
      "'Verified' badge",
    ],
  },
  {
    id: "pro",
    rank: 2,
    name: "VerifiCasa Pro",
    shortName: "Pro",
    description: "Pentru proprietari activi care vor vizibilitate maximă.",
    description_en: "For active owners who want maximum visibility.",
    monthly: 50,
    yearly: 480,
    iconImg: "/images/generated/plan-icon-pro-v2.png",
    badgeImg: "/images/generated/plan-badge-pro-v2.png",
    accent: "emerald",
    tours3d: null,
    boostsIncluded: null,
    benefits: [
      "Până la 5 anunțuri active",
      "Galerie extinsă, până la 250MB/fișier",
      "Poziționare prioritară în căutare",
      "Badge „Verificat Pro”",
      "Statistici avansate ale anunțului",
      "Suport prioritar",
    ],
    benefits_en: [
      "Up to 5 active listings",
      "Extended gallery, up to 250MB/file",
      "Priority placement in search",
      "'Verified Pro' badge",
      "Advanced listing stats",
      "Priority support",
    ],
  },
  {
    id: "agent",
    rank: 3,
    name: "VerifiCasa Agent",
    shortName: "Agent",
    description: "Pentru agenți și agenții cu portofolii extinse.",
    description_en: "For agents and agencies with larger portfolios.",
    monthly: 89.99,
    yearly: 863.9,
    iconImg: "/images/generated/plan-icon-agent-v2.png",
    badgeImg: "/images/generated/plan-badge-agent-v2.png",
    accent: "gold",
    tours3d: null,
    boostsIncluded: null,
    benefits: [
      "Anunțuri nelimitate",
      "Stocare nelimitată",
      "Panou dedicat de agenție",
      "Manager de cont dedicat",
      "Acces API & integrări",
      "Permisiuni multi-utilizator",
    ],
    benefits_en: [
      "Unlimited listings",
      "Unlimited storage",
      "Dedicated agency panel",
      "Dedicated account manager",
      "API access & integrations",
      "Multi-user permissions",
    ],
  },
];

// Câte tururi 3D și câte boost-uri intră în fiecare plan. `null` înseamnă „nu
// s-a anunțat încă" — pagina /tur-3d scrie „în curând" în loc să inventeze o
// cifră. Când clientul dă numerele, se completează mai sus și apar peste tot.
//
// ATENȚIE: aceste câmpuri sunt deocamdată DOAR afișaj. Nimic nu numără tururi
// și nimic nu blochează la limită — ENTITLEMENTS de mai jos nu are noțiunea de
// tur, iar `boostsPerMonth` nu e citit nicăieri.
export const PLAN_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p]));

// ---------------------------------------------------------------------------
// LIMITE DE CONT (entitlements)
// Planurile vindeau „1 anunț activ" / „până la 5" / „nelimitate", dar nimic din
// cod nu impunea nimic — un cont Basic putea publica cincizeci. Aici e sursa
// unică de adevăr; verificarea reală se face server-side la publicare, cea din
// client e doar curtoazie de interfață.
// null = nelimitat.
// ---------------------------------------------------------------------------
export const ENTITLEMENTS = {
  none:  { activeListings: 1,    photosPerListing: 8,  boostsPerMonth: 0, priorityWeight: 0 },
  basic: { activeListings: 1,    photosPerListing: 15, boostsPerMonth: 0, priorityWeight: 1 },
  pro:   { activeListings: 5,    photosPerListing: 30, boostsPerMonth: 1, priorityWeight: 2 },
  agent: { activeListings: null, photosPerListing: null, boostsPerMonth: 3, priorityWeight: 3 },
};

export function getEntitlements(planId) {
  return ENTITLEMENTS[planId] || ENTITLEMENTS.none;
}

// ---------------------------------------------------------------------------
// PACHETE DE BOOST (client, 21.08 — prețuri provizorii, le schimbă Andrei)
// Un singur loc de editat: preț, număr de boost-uri, durata unui boost.
// ---------------------------------------------------------------------------
export const BOOST_DURATION_DAYS = 7;

// b1 e pachetul „cumperi unul și gata": clientul a cerut explicit ca un
// proprietar să poată promova un anunț fără să fie obligat să ia un pachet.
// Se poate cumpăra direct de pe anunț (vezi CreateBoostCheckout cu property_id),
// caz în care boost-ul se aplică singur la întoarcerea din plată.
export const BOOST_PACKS = [
  { id: "b1",  boosts: 1,  priceRon: 14.99, single: true },
  { id: "b3",  boosts: 3,  priceRon: 31.99 },
  { id: "b6",  boosts: 6,  priceRon: 58.99, popular: true },
  { id: "b12", boosts: 12, priceRon: 80.99 },
];

export const SINGLE_BOOST_PACK = BOOST_PACKS.find((p) => p.single);

export const BOOST_PACK_BY_ID = Object.fromEntries(BOOST_PACKS.map((b) => [b.id, b]));

// Preț per boost — folosit pentru a arăta cinstit ce economisești la pachetele
// mari, în loc de un procent inventat.
export function boostUnitPrice(pack) {
  return pack.priceRon / pack.boosts;
}

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
// întâi, apoi boost, apoi views_count descrescător. Planul postatorului decide
// rândul, boost-ul decide ordinea în interiorul rândului, vizualizările rup
// egalitatea. Boost-ul NU sare peste plan: un anunț promovat nu poate ascunde
// o potrivire mai bună dintr-o categorie superioară.
export function compareByPlanThenViews(planOf) {
  return (a, b) => {
    const rankDiff = planRank(planOf(b)) - planRank(planOf(a));
    if (rankDiff !== 0) return rankDiff;
    const boostDiff = (isBoosted(b) ? 1 : 0) - (isBoosted(a) ? 1 : 0);
    if (boostDiff !== 0) return boostDiff;
    return (b.views_count || 0) - (a.views_count || 0);
  };
}

// Un anunț e promovat doar dacă boost-ul e activ ȘI nu a expirat — nu ne bazăm
// exclusiv pe flag, ca un ExpireBoosts nerulat să nu lase anunțuri promovate
// la nesfârșit.
export function isBoosted(property) {
  if (!property?.boost_active) return false;
  if (!property.boost_ends_date) return true;
  return new Date(property.boost_ends_date).getTime() > Date.now();
}

// Ordonare în interiorul unei liste deja filtrate: promovatele primele, apoi
// vizualizările. Folosit acolo unde planul nu mai e criteriu (rânduri deja
// grupate pe plan, rezultate de căutare).
export function compareByBoostThenViews(a, b) {
  const boostDiff = (isBoosted(b) ? 1 : 0) - (isBoosted(a) ? 1 : 0);
  if (boostDiff !== 0) return boostDiff;
  return (b.views_count || 0) - (a.views_count || 0);
}

// Opțiuni gata de folosit pentru filtrul „Plan” din SearchFiltersDrawer —
// Agent primul (cel mai important), apoi Pro, apoi Basic — fiecare cu
// iconița mică de badge folosită și pe carduri, pentru recunoaștere vizuală
// instantă în filtrele de căutare/hartă.
export const PLAN_FILTER_OPTIONS = PLANS.slice()
  .reverse()
  .map((p) => ({ id: p.id, label: p.shortName || p.name, icon: p.badgeImg }));
