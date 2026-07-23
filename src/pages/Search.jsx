import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { getCities, getZones } from "@/components/locations";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Home, Sparkles, ShieldCheck, PawPrint, BadgePercent, Lock, SlidersHorizontal, ArrowDownUp, BookmarkPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// VerifiCasa verification filters — each applies a real-property predicate.
const VERIF_FILTERS = [
  { key: "ai", label: "Tur AI Inclus", icon: Sparkles, test: (p) => !!p.ai_video_url },
  { key: "field", label: "Verificat pe Teren", icon: ShieldCheck, test: (p) => p.verification_level === "field_certified" },
  { key: "pet", label: "Pet Friendly", icon: PawPrint, test: (p) => !!p.pet_friendly },
  { key: "nofee", label: "Fără Comision", icon: BadgePercent, test: (p) => !!p.commission_free },
  { key: "garant0", label: "Garanție 0", icon: Lock, test: (p) => p.deposit_option === "verificasa_guarantee" },
  { key: "studio", label: "Garsonieră", icon: Home, test: (p) => ["Garsonieră", "Studio"].includes(p.property_type) },
  { key: "2camere", label: "2 Camere", icon: Home, test: (p) => p.property_type === "2 Camere" },
  { key: "parking", label: "Parcare", icon: Home, test: (p) => !!p.parking },
];

const FAIRNESS_OPTIONS = [
  { value: "", label: "Preț corectitate (toate)" },
  { value: "sub_piata", label: "Sub prețul pieței" },
  { value: "corect", label: "Preț corect" },
  { value: "peste_medie", label: "Peste media pieței" },
];

const SORT_OPTIONS = [
  { value: "", label: "Sortează după" },
  { value: "newest", label: "Cele mai noi" },
  { value: "price_asc", label: "Preț crescător" },
  { value: "price_desc", label: "Preț descrescător" },
];

export default function SearchPage() {
  const { country } = useCountry();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [properties, setProperties] = useState(null);
  const [budget, setBudget] = useState("");
  const [roomsMin, setRoomsMin] = useState("");
  const [surfaceMin, setSurfaceMin] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [swap, setSwap] = useState(false);
  const [fairness, setFairness] = useState("");
  const [sort, setSort] = useState("");

  const cityParam = params.get("city");
  const zoneParam = params.get("zone");
  const typeParam = params.get("type");

  const cities = useMemo(() => getCities(country), [country]);
  const [cityFilter, setCityFilter] = useState(cityParam || "");
  const zones = useMemo(() => getZones(country, cityFilter), [country, cityFilter]);
  const [zoneFilter, setZoneFilter] = useState(zoneParam || "");

  const [activeFilters, setActiveFilters] = useState(() => {
    const s = new Set();
    VERIF_FILTERS.forEach((f) => { if (params.get(f.key) === "1") s.add(f.key); });
    return s;
  });

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

  const toggle = (key) => {
    setActiveFilters((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      // sync to URL
      const next = new URLSearchParams(params);
      if (n.has(key)) next.set(key, "1"); else next.delete(key);
      setParams(next, { replace: true });
      return n;
    });
  };

  let filtered = (properties || []).filter((p) => {
    if (p.country !== "RO") return false;
    if (cityParam && !p.city?.toLowerCase().includes(cityParam.toLowerCase())) return false;
    if (zoneParam && !p.zone?.toLowerCase().includes(zoneParam.toLowerCase())) return false;
    if (cityFilter && !p.city?.toLowerCase().includes(cityFilter.toLowerCase())) return false;
    if (zoneFilter && !p.zone?.toLowerCase().includes(zoneFilter.toLowerCase())) return false;
    if (typeParam && p.property_type !== typeParam) return false;
    for (const f of VERIF_FILTERS) {
      if (activeFilters.has(f.key) && !f.test(p)) return false;
    }
    if (budget) { const max = parseInt(budget, 10); if (!isNaN(max) && p.price_monthly > max) return false; }
    if (roomsMin) { const r = parseInt(roomsMin, 10); if (!isNaN(r) && (p.rooms == null || p.rooms < r)) return false; }
    if (surfaceMin) { const s = parseFloat(surfaceMin); if (!isNaN(s) && (p.surface_sqm == null || p.surface_sqm < s)) return false; }
    if (furnished && !p.furnished) return false;
    if (swap && !p.is_swap_available) return false;
    if (fairness && p.price_fairness !== fairness) return false;
    return true;
  });

  if (sort === "price_asc") filtered = [...filtered].sort((a, b) => (a.price_monthly || 0) - (b.price_monthly || 0));
  else if (sort === "price_desc") filtered = [...filtered].sort((a, b) => (b.price_monthly || 0) - (a.price_monthly || 0));
  else if (sort === "newest") filtered = [...filtered].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const found = filtered.length;

  const saveSearch = async () => {
    if (!isAuthenticated) { toast({ title: "Conectează-te pentru a salva căutarea", variant: "destructive" }); return; }
    const qs = params.toString();
    if (!qs) { toast({ title: "Aplică niște filtre mai întâi", variant: "destructive" }); return; }
    const parts = [];
    if (cityParam) parts.push(cityParam);
    if (zoneParam) parts.push(zoneParam);
    if (typeParam) parts.push(typeParam);
    const label = parts.length ? parts.join(" · ") : "Toate proprietățile";
    try {
      await base44.entities.SavedSearch.create({ user_id: user.id, label, query_string: qs });
      toast({ title: "Căutare salvată", description: "O găsești în meniul tău → Căutări salvate" });
    } catch (e) { toast({ title: "Eroare la salvare", variant: "destructive" }); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            {cityParam || zoneParam || typeParam ? "Rezultate căutare" : "Toate proprietățile"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cityParam && `Oraș: ${cityParam} · `}
            {zoneParam && `Zona: ${zoneParam} · `}
            {typeParam && `Tip: ${typeParam} · `}
            {found} {found === 1 ? "proprietate găsită" : "proprietăți găsite"}
          </p>
        </div>
        <Button onClick={saveSearch} variant="outline" className="gap-1.5 border-emerald/40 text-emerald hover:bg-emerald-soft">
          <BookmarkPlus className="h-4 w-4" /> Salvează căutarea
        </Button>
      </div>

      {/* City / zone selectors */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={cityFilter}
          onChange={(e) => { setCityFilter(e.target.value); setZoneFilter(""); }}
          className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium outline-none focus:border-emerald"
        >
          <option value="">Oraș</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          disabled={!cityFilter}
          className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium outline-none focus:border-emerald disabled:opacity-50"
        >
          <option value="">Zona</option>
          {zones.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      {/* Verification quick filters + budget */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {VERIF_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => toggle(f.key)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
              activeFilters.has(f.key)
                ? "border-emerald bg-emerald text-white shadow-soft"
                : "border-border bg-white text-foreground/70 hover:border-emerald/50"
            }`}
          >
            <f.icon className="h-3.5 w-3.5" /> {f.label}
          </button>
        ))}
        <div className="ml-auto">
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Buget max /lună (€)"
            className="w-48 rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-emerald"
          />
        </div>
      </div>

      {/* Advanced filters */}
      <div className="mb-6 rounded-2xl border border-border bg-secondary/30 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-foreground/60">
          <SlidersHorizontal className="h-4 w-4 text-emerald" /> Filtre avansate
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roomsMin}
            onChange={(e) => setRoomsMin(e.target.value)}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium outline-none focus:border-emerald"
          >
            <option value="">Camere (min)</option>
            <option value="1">1+ camere</option>
            <option value="2">2+ camere</option>
            <option value="3">3+ camere</option>
            <option value="4">4+ camere</option>
          </select>

          <input
            type="number"
            value={surfaceMin}
            onChange={(e) => setSurfaceMin(e.target.value)}
            placeholder="Suprafață min (mp)"
            className="w-44 rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-emerald"
          />

          <select
            value={fairness}
            onChange={(e) => setFairness(e.target.value)}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium outline-none focus:border-emerald"
          >
            {FAIRNESS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            type="button"
            onClick={() => setFurnished((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              furnished ? "border-emerald bg-emerald text-white shadow-soft" : "border-border bg-white text-foreground/70 hover:border-emerald/50"
            }`}
          >
            Mobilat
          </button>

          <button
            type="button"
            onClick={() => setSwap((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              swap ? "border-emerald bg-emerald text-white shadow-soft" : "border-border bg-white text-foreground/70 hover:border-emerald/50"
            }`}
          >
            Schimb de chirie
          </button>

          <div className="ml-auto flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4 text-foreground/50" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium outline-none focus:border-emerald"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {properties === null ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : found === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <Home className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 font-heading text-lg font-semibold text-navy">Nicio proprietate găsită</p>
          <p className="text-sm text-muted-foreground">Încearcă alte filtre sau schimbă orașul.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}