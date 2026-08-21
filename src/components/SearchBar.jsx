import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Home, Sparkles, ShieldCheck, PawPrint, BadgePercent, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";
import LocationAutocomplete from "@/components/LocationAutocomplete";

export default function SearchBar({ compact = false, onSubmitted }) {
  const { country, t } = useCountry();
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [type, setType] = useState("all");
  const [toggles, setToggles] = useState({});

  const types = [
    { value: "all", label: t("type_all_vc") },
    { value: "Garsonieră", label: t("type_studio_vc") },
    { value: "2 Camere", label: t("type_2_vc") },
    { value: "3 Camere", label: t("type_3_vc") },
    { value: "4+ Camere", label: t("type_4_vc") },
    { value: "Casă", label: t("type_house_vc") },
  ];
  const TOGGLES = [
    { key: "ai", label: t("tg_ai"), icon: Sparkles },
    { key: "field", label: t("tg_field"), icon: ShieldCheck },
    { key: "pet", label: t("tg_pet"), icon: PawPrint },
    { key: "nofee", label: t("tg_nofee"), icon: BadgePercent },
    { key: "garant0", label: t("tg_garant0"), icon: Lock },
  ];

  const toggle = (key) => setToggles((cur) => ({ ...cur, [key]: !cur[key] }));

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (zone) params.set("zone", zone);
    if (type && type !== "all") params.set("type", type);
    TOGGLES.forEach((tg) => { if (toggles[tg.key]) params.set(tg.key, "1"); });
    navigate(`/search?${params.toString()}`);
    onSubmitted?.();
  };

  const inputCls = "flex flex-1 items-center gap-2 rounded-lg border border-border bg-white/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/5";

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className={inputCls}>
          <LocationAutocomplete
            country={country}
            value={{ city, zone }}
            onSelect={({ city: c, zone: z }) => { setCity(c); setZone(z); }}
            placeholder={t("sb_city")}
            includeCounties={false}
            icon={MapPin}
            inputClassName="cursor-pointer"
          />
        </div>

        <div className="hidden h-8 w-px bg-border md:block" />

        <div className={inputCls}>
          <Home className="h-4 w-4 shrink-0 text-emerald" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full cursor-pointer bg-transparent text-sm text-foreground outline-none">
            {types.map((tp) => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
          </select>
        </div>

        <Button type="submit" className="bg-emerald text-white shadow-soft hover:opacity-90 md:px-7">
          <Search className="h-4 w-4" /> {t("sb_btn")}
        </Button>
      </div>

      {/* Quick filter toggles */}
      <div className="mt-2 flex flex-wrap items-center gap-2 px-1 pb-1">
        {TOGGLES.map((tg) => {
          const active = !!toggles[tg.key];
          return (
            <button
              key={tg.key}
              type="button"
              onClick={() => toggle(tg.key)}
              className={`flex min-h-[36px] items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-emerald bg-emerald text-white shadow-soft"
                  : "border-border bg-white/70 text-foreground/70 hover:border-emerald/50 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              <tg.icon className="h-3.5 w-3.5" /> {tg.label}
            </button>
          );
        })}
      </div>
    </form>
  );
}