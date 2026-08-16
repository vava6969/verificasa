import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { PLANS, resolvePropertyPlan } from "@/lib/plans";
import { fetchActivePlanMap } from "@/lib/subscriptions";
import RecommendedPropertyCard from "@/components/RecommendedPropertyCard";
import { Skeleton } from "@/components/ui/skeleton";

// Homepage — „Anunțuri recomandate", pe 4 rânduri distincte, delimitate strict
// de planul celui care a postat (Agent > Pro > Basic > fără plan), fiecare
// rând ordonat descrescător după vizualizări. Regula exactă: planul postatorului
// decide RÂNDUL, vizualizările decid doar ordinea în interiorul aceluiași rând
// — un anunț Agent cu puține vizualizări tot apare înaintea unui anunț Pro cu
// mai multe. Vezi src/lib/plans.js pentru sursa de adevăr a planurilor.
const ACCENT = {
  gold: { text: "text-gold-deep", soft: "bg-gold-soft", ring: "border-gold/40", rule: "from-gold/70" },
  emerald: { text: "text-emerald", soft: "bg-emerald-soft", ring: "border-emerald/35", rule: "from-emerald/70" },
  navy: { text: "text-navy dark:text-foreground", soft: "bg-secondary", ring: "border-border", rule: "from-navy/40" },
};

const ROW_TAGLINE = {
  agent: { ro: "Cele mai vizibile anunțuri — agenții și profesioniști verificați", en: "Most visible listings — verified agents and professionals" },
  pro: { ro: "Proprietari activi, cu vizibilitate extinsă", en: "Active owners with extended visibility" },
  basic: { ro: "Anunțuri verificate, listate cu un plan activ", en: "Verified listings with an active plan" },
  none: { ro: "Anunțuri fără abonament activ", en: "Listings without an active plan" },
};

export default function RecommendedByPlanSection() {
  const { lang } = useCountry();
  const en = lang === "en";
  const [properties, setProperties] = useState(null);
  const [planMap, setPlanMap] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [props, map] = await Promise.all([
          base44.entities.Property.list("-views_count", 200),
          fetchActivePlanMap(),
        ]);
        if (cancelled) return;
        setProperties(props.filter((p) => p.approval_status === "APPROVED" && p.country === "RO"));
        setPlanMap(map);
      } catch (e) {
        if (!cancelled) { setProperties([]); setPlanMap(new Map()); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (properties === null || planMap === null) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-16 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </section>
    );
  }

  if (properties.length === 0) return null;

  const grouped = { agent: [], pro: [], basic: [], none: [] };
  for (const p of properties) {
    const plan = resolvePropertyPlan(p, planMap) || "none";
    (grouped[plan] || grouped.none).push(p);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
  }

  const rows = [
    ...PLANS.slice().reverse().map((plan) => ({ ...plan, items: grouped[plan.id] || [] })),
    { id: "none", name: en ? "Other listings" : "Alte anunțuri", accent: "navy", items: grouped.none },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-16 lg:px-8">
      {rows.map((row) => (
        <PlanRow key={row.id} row={row} en={en} />
      ))}
    </section>
  );
}

function PlanRow({ row, en }) {
  const isPaidTier = row.id !== "none";
  if (row.items.length === 0 && !isPaidTier) return null;

  const accent = ACCENT[row.accent] || ACCENT.navy;
  const tagline = ROW_TAGLINE[row.id] || ROW_TAGLINE.none;
  const visible = row.items.slice(0, 5);

  return (
    <div className="mb-8 last:mb-0 sm:mb-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${accent.soft} ${accent.ring}`}>
            {row.iconImg ? <img src={row.iconImg} alt="" className="h-5 w-5 object-contain" /> : <Sparkles className={`h-4.5 w-4.5 ${accent.text}`} />}
          </span>
          <div>
            <h2 className="font-heading text-base font-bold text-navy dark:text-foreground sm:text-lg">
              {en ? "Recommended · " : "Recomandate · "}<span className={accent.text}>{row.name}</span>
            </h2>
            <p className="text-xs text-muted-foreground">{en ? tagline.en : tagline.ro} · {row.items.length}</p>
          </div>
        </div>
        {row.items.length > 0 && (
          <Link to="/anunturi-recomandate" className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition hover:opacity-80 ${accent.ring} ${accent.text}`}>
            {en ? "View more" : "Vezi mai multe"}
          </Link>
        )}
      </div>
      <div className={`mb-4 h-[2px] rounded-full bg-gradient-to-r ${accent.rule} to-transparent sm:mb-5`} />

      {row.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-center">
          <p className="font-heading text-sm font-bold text-navy dark:text-foreground">
            {en ? "No listings yet — be the first to post in this section!" : "Niciun anunț postat.. Fii primul care postează în această secțiune!"}
          </p>
          <Link to="/upgrade" className="mt-3 inline-flex rounded-full bg-emerald px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-emerald/90">
            {en ? "View plans" : "Vezi planuri"}
          </Link>
        </div>
      ) : (
        <div className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-4 sm:px-0">
          {visible.map((p) => (
            <RecommendedPropertyCard key={p.id} property={p} planId={row.id === "none" ? null : row.id} />
          ))}
          <Link
            to="/anunturi-recomandate"
            className={`flex w-[100px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-3 text-center transition hover:opacity-80 sm:w-[120px] ${accent.ring} ${accent.soft}`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-soft dark:bg-navy-deep">
              <ChevronRight className={`h-4 w-4 ${accent.text}`} />
            </span>
            <span className={`text-[11px] font-bold leading-tight ${accent.text}`}>{en ? "View more" : "Vezi mai multe"}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
