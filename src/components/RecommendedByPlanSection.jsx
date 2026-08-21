import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { PLANS, resolvePropertyPlan, compareByBoostThenViews } from "@/lib/plans";
import { fetchActivePlanMap } from "@/lib/subscriptions";
import RecommendedPropertyCard from "@/components/RecommendedPropertyCard";
import { buildCoverMap } from "@/lib/covers";
import { Skeleton } from "@/components/ui/skeleton";

// Homepage — „Anunțuri recomandate", pe 4 rânduri distincte, delimitate strict
// de planul celui care a postat (Agent > Pro > Basic > fără plan), fiecare
// rând ordonat descrescător după vizualizări. Regula exactă: planul postatorului
// decide RÂNDUL, vizualizările decid doar ordinea în interiorul aceluiași rând
// — un anunț Agent cu puține vizualizări tot apare înaintea unui anunț Pro cu
// mai multe. Vezi src/lib/plans.js pentru sursa de adevăr a planurilor.
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
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded" />)}
        </div>
      </section>
    );
  }

  if (properties.length === 0) return null;

  // Harta de coperți se calculează pe TOATE anunțurile, nu pe rând, ca
  // acelasi duplicat sa nu reapara in doua randuri diferite.
  const coverMap = buildCoverMap(properties);

  const grouped = { agent: [], pro: [], basic: [], none: [] };
  for (const p of properties) {
    const plan = resolvePropertyPlan(p, planMap) || "none";
    (grouped[plan] || grouped.none).push(p);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort(compareByBoostThenViews);
  }

  const rows = [
    ...PLANS.slice().reverse().map((plan) => ({ ...plan, items: grouped[plan.id] || [] })),
    { id: "none", name: en ? "Other listings" : "Alte anunțuri", accent: "navy", items: grouped.none },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-16 lg:px-8">
      {rows.map((row) => (
        <PlanRow key={row.id} row={row} en={en} coverMap={coverMap} />
      ))}
    </section>
  );
}

function PlanRow({ row, en, coverMap }) {
  const isPaidTier = row.id !== "none";
  if (row.items.length === 0 && !isPaidTier) return null;

  const tagline = ROW_TAGLINE[row.id] || ROW_TAGLINE.none;
  const visible = row.items.slice(0, 5);

  return (
    <div className="mb-8 last:mb-0 sm:mb-10">
      <div className="mb-4 border-b border-border pb-2 sm:mb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
            {row.shortName || row.name}
          </h2>
          <p className="tnum text-xs text-muted-foreground">
            {row.items.length} {en ? (row.items.length === 1 ? "listing" : "listings") : "anunțuri"}
          </p>
        </div>
        <p className="mt-0.5 max-w-[70ch] text-xs text-muted-foreground">{en ? tagline.en : tagline.ro}</p>
      </div>

      {row.items.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-card px-5 py-8 text-center">
          <p className="font-heading text-sm font-semibold text-foreground">
            {en ? "No listings yet — be the first to post in this section!" : "Niciun anunț postat.. Fii primul care postează în această secțiune!"}
          </p>
          <Link to="/upgrade" className="mt-3 inline-flex rounded bg-emerald px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-emerald/90">
            {en ? "View plans" : "Vezi planuri"}
          </Link>
        </div>
      ) : (
        <div className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-4 sm:px-0">
          {visible.map((p) => (
            <div key={p.id} className="w-[168px] shrink-0 sm:w-[196px]">
              <RecommendedPropertyCard property={p} planId={row.id === "none" ? null : row.id} coverMap={coverMap} />
            </div>
          ))}
          <Link
            to="/anunturi-recomandate"
            className="flex w-[100px] shrink-0 flex-col items-center justify-center gap-1 rounded border border-dashed border-border bg-secondary p-3 text-center transition-colors hover:border-foreground sm:w-[120px]"
          >
            <span className="text-[11px] font-bold leading-tight text-emerald">{en ? "View more" : "Vezi mai multe"}</span>
            <span className="text-sm text-emerald" aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
