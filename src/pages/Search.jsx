import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { getCities, getZones } from "@/components/locations";
import PropertyCard from "@/components/PropertyCard";
import { Search as SearchIcon, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const { country, t } = useCountry();
  const [params] = useSearchParams();
  const [properties, setProperties] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [budget, setBudget] = useState("");
  const [furnishedOnly, setFurnishedOnly] = useState(false);

  const cityParam = params.get("city");
  const zoneParam = params.get("zone");
  const typeParam = params.get("type");

  const cities = useMemo(() => getCities(country), [country]);
  const [cityFilter, setCityFilter] = useState(cityParam || "");
  const zones = useMemo(() => getZones(country, cityFilter), [country, cityFilter]);
  const [zoneFilter, setZoneFilter] = useState(zoneParam || "");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.Property.list("-created_date", 100);
        if (cancelled) return;
        setProperties(all);
      } catch (e) {
        if (!cancelled) setProperties([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const studioType = country === "UK" ? "Studio" : "Garsonieră";
  const QUICK_FILTERS = [
    { key: studioType, label: t("f_studio") },
    { key: "2 Camere", label: t("f_2") },
    { key: "pet_friendly", label: t("f_pet"), bool: true },
    { key: "parking", label: t("f_parking"), bool: true },
  ];

  const filtered = (properties || []).filter((p) => {
    if (country === "UK" && p.country !== "UK") return false;
    if (country === "RO" && p.country !== "RO") return false;
    if (cityParam && !p.city?.toLowerCase().includes(cityParam.toLowerCase())) return false;
    if (zoneParam && !p.zone?.toLowerCase().includes(zoneParam.toLowerCase())) return false;
    if (cityFilter && !p.city?.toLowerCase().includes(cityFilter.toLowerCase())) return false;
    if (zoneFilter && !p.zone?.toLowerCase().includes(zoneFilter.toLowerCase())) return false;
    if (typeParam && p.property_type !== typeParam) return false;
    if (activeFilter) {
      if (activeFilter.bool) { if (!p[activeFilter.key]) return false; }
      else if (p.property_type !== activeFilter.key) return false;
    }
    if (furnishedOnly && !p.furnished) return false;
    if (budget) { const max = parseInt(budget, 10); if (!isNaN(max) && p.price_monthly > max) return false; }
    return true;
  });

  const foundLabel = filtered.length === 1
    ? t("sr_found_one", { n: filtered.length })
    : t("sr_found", { n: filtered.length });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-navy">
          {cityParam || zoneParam || typeParam ? t("sr_results") : t("sr_all")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {cityParam && `${t("sr_city")} ${cityParam} · `}
          {zoneParam && `${t("sr_zone")} ${zoneParam} · `}
          {typeParam && `${t("sr_type")} ${typeParam} · `}
          {foundLabel}
        </p>
      </div>

      {/* City / zone selectors */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={cityFilter}
          onChange={(e) => { setCityFilter(e.target.value); setZoneFilter(""); }}
          className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium outline-none focus:border-mint"
        >
          <option value="">{t("sr_city")}</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          disabled={!cityFilter}
          className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium outline-none focus:border-mint disabled:opacity-50"
        >
          <option value="">{t("sr_zone")}</option>
          {zones.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      {/* Quick filters + budget */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter((cur) => (cur?.key === f.key ? null : f))}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeFilter?.key === f.key ? "border-navy bg-navy text-white" : "border-border bg-white text-foreground/70 hover:border-navy/40"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder={t("ph_budget")}
            className="w-40 rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-mint"
          />
          <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium">
            <input type="checkbox" checked={furnishedOnly} onChange={(e) => setFurnishedOnly(e.target.checked)} className="accent-[hsl(var(--mint))]" />
            {t("furnished")}
          </label>
        </div>
      </div>

      {properties === null ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <Home className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 font-heading text-lg font-semibold text-navy">{t("empty_title")}</p>
          <p className="text-sm text-muted-foreground">{t("empty_sub")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}