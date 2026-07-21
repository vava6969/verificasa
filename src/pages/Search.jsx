import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import PropertyCard from "@/components/PropertyCard";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const QUICK_FILTERS = [
  { key: "Garsonieră", label: "Garsoniere" },
  { key: "2 Camere", label: "2 Camere" },
  { key: "pet_friendly", label: "Pet Friendly", bool: true },
  { key: "parking", label: "Cu Parcare", bool: true },
];

export default function SearchPage() {
  const { country } = useCountry();
  const [params] = useSearchParams();
  const [properties, setProperties] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [budget, setBudget] = useState("");
  const [furnishedOnly, setFurnishedOnly] = useState(false);

  const city = params.get("city");
  const zone = params.get("zone");
  const type = params.get("type");

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

  let filtered = (properties || []).filter((p) => {
    if (country === "UK" && p.country !== "UK") return false;
    if (country === "RO" && p.country !== "RO") return false;
    if (city && !p.city?.toLowerCase().includes(city.toLowerCase())) return false;
    if (zone && !p.zone?.toLowerCase().includes(zone.toLowerCase())) return false;
    if (type && p.property_type !== type) return false;
    if (activeFilter) {
      if (activeFilter.bool) {
        if (!p[activeFilter.key]) return false;
      } else if (p.property_type !== activeFilter.key) return false;
    }
    if (furnishedOnly && !p.furnished) return false;
    if (budget) {
      const max = parseInt(budget, 10);
      if (!isNaN(max) && p.price_monthly > max) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-navy">
          {city || zone || type ? "Rezultate căutare" : "Toate proprietățile"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {city && `Oraș: ${city} · `}
          {zone && `Zona: ${zone} · `}
          {type && `Tip: ${type} · `}
          {filtered.length} proprietăți găsite
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter((cur) => (cur?.key === f.key ? null : f))}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeFilter?.key === f.key
                ? "border-navy bg-navy text-white"
                : "border-border bg-white text-foreground/70 hover:border-navy/40"
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
            placeholder="Buget max /lună"
            className="w-40 rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-mint"
          />
          <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium">
            <input type="checkbox" checked={furnishedOnly} onChange={(e) => setFurnishedOnly(e.target.checked)} className="accent-[hsl(var(--mint))]" />
            Mobilat
          </label>
        </div>
      </div>

      {properties === null ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 font-heading text-lg font-semibold text-navy">Nicio proprietate găsită</p>
          <p className="text-sm text-muted-foreground">Încearcă alte filtre sau schimbă țara.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}