import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Home, Sparkles, ShieldCheck, PawPrint, BadgePercent, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";
import { getCities, getZones } from "@/components/locations";

const TYPES = [
  { value: "all", label: "Toate tipurile" },
  { value: "Garsonieră", label: "Garsonieră" },
  { value: "2 Camere", label: "2 Camere" },
  { value: "3 Camere", label: "3 Camere" },
  { value: "4+ Camere", label: "4+ Camere" },
  { value: "Casă", label: "Casă" },
];

const TOGGLES = [
  { key: "ai", label: "Tur AI Inclus", icon: Sparkles },
  { key: "field", label: "Verificat pe Teren", icon: ShieldCheck },
  { key: "pet", label: "Pet Friendly", icon: PawPrint },
  { key: "nofee", label: "Fără Comision", icon: BadgePercent },
  { key: "garant0", label: "Garanție 0", icon: Lock },
];

export default function SearchBar({ compact = false }) {
  const { country } = useCountry();
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [type, setType] = useState("all");
  const [toggles, setToggles] = useState({});

  const cities = useMemo(() => getCities(country), [country]);
  const zones = useMemo(() => getZones(country, city), [country, city]);

  const handleCity = (v) => { setCity(v); setZone(""); };
  const toggle = (key) => setToggles((cur) => ({ ...cur, [key]: !cur[key] }));

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (zone) params.set("zone", zone);
    if (type && type !== "all") params.set("type", type);
    TOGGLES.forEach((t) => { if (toggles[t.key]) params.set(t.key, "1"); });
    navigate(`/search?${params.toString()}`);
  };

  const inputCls =
    "flex flex-1 items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5";

  return (
    <form onSubmit={handleSearch} className="w-full rounded-2xl border border-white/20 bg-white/95 p-2 shadow-2xl backdrop-blur md:p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className={inputCls}>
          <MapPin className="h-4 w-4 shrink-0 text-emerald" />
          <select value={city} onChange={(e) => handleCity(e.target.value)} className="w-full cursor-pointer bg-transparent text-sm text-navy outline-none">
            <option value="">Oraș</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="hidden h-8 w-px bg-border md:block" />

        <div className={inputCls}>
          <Search className="h-4 w-4 shrink-0 text-emerald" />
          <select value={zone} onChange={(e) => setZone(e.target.value)} disabled={!city} className="w-full cursor-pointer bg-transparent text-sm text-navy outline-none disabled:opacity-50">
            <option value="">Zonă / Cartier / Metrou</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div className="hidden h-8 w-px bg-border md:block" />

        <div className={inputCls}>
          <Home className="h-4 w-4 shrink-0 text-emerald" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full cursor-pointer bg-transparent text-sm text-navy outline-none">
            {TYPES.map((tp) => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
          </select>
        </div>

        <Button type="submit" className="gradient-emerald text-white shadow-soft hover:opacity-90 md:px-7">
          <Search className="h-4 w-4" /> Caută
        </Button>
      </div>

      {/* Quick filter toggles */}
      <div className="mt-2 flex flex-wrap items-center gap-2 px-1 pb-1">
        {TOGGLES.map((t) => {
          const active = !!toggles[t.key];
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => toggle(t.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-emerald bg-emerald text-white shadow-soft"
                  : "border-border bg-white text-foreground/70 hover:border-emerald/50"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>
    </form>
  );
}