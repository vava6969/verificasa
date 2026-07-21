import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";
import { getCities, getZones } from "@/components/locations";

export default function SearchBar({ compact = false }) {
  const { country, t } = useCountry();
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [type, setType] = useState("all");

  const cities = useMemo(() => getCities(country), [country]);
  const zones = useMemo(() => getZones(country, city), [country, city]);

  const studioType = country === "UK" ? "Studio" : "Garsonieră";
  const TYPES = ["all", studioType, "2 Camere", "3 Camere", "4+ Camere", "Casă"];
  const typeLabel = (v) => {
    if (v === "all") return t("type_all");
    if (v === studioType) return country === "UK" ? t("type_studio_en") : t("type_studio");
    if (v === "2 Camere") return t("type_2");
    if (v === "3 Camere") return t("type_3");
    if (v === "4+ Camere") return t("type_4");
    if (v === "Casă") return t("type_house");
    return v;
  };

  // Reset zone when city changes
  const handleCity = (v) => { setCity(v); setZone(""); };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (zone) params.set("zone", zone);
    if (type && type !== "all") params.set("type", type);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full rounded-2xl border border-white/20 bg-white/95 p-2 shadow-2xl backdrop-blur md:p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-mint" />
          <select
            value={city}
            onChange={(e) => handleCity(e.target.value)}
            className="w-full cursor-pointer bg-transparent text-sm text-navy outline-none"
          >
            <option value="">{country === "UK" ? t("ph_city_uk") : t("ph_city_ro")}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="hidden h-8 w-px bg-border md:block" />

        <div className="flex flex-1 items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-mint" />
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            disabled={!city}
            className="w-full cursor-pointer bg-transparent text-sm text-navy outline-none disabled:opacity-50"
          >
            <option value="">{country === "UK" ? t("ph_zone_uk") : t("ph_zone_ro")}</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div className="hidden h-8 w-px bg-border md:block" />

        <div className="flex flex-1 items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5">
          <Home className="h-4 w-4 shrink-0 text-mint" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full cursor-pointer bg-transparent text-sm text-navy outline-none">
            {TYPES.map((tp) => <option key={tp} value={tp}>{typeLabel(tp)}</option>)}
          </select>
        </div>

        <Button type="submit" className="gradient-mint text-navy shadow-soft hover:opacity-90 md:px-7">
          <Search className="h-4 w-4" /> {t("btn_search")}
        </Button>
      </div>

      {!compact && (
        <div className="mt-2 flex items-center gap-2 px-2 pb-1">
          <span className="flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-semibold text-navy">
            <Sparkles className="h-3 w-3" /> {t("ai_included")}
          </span>
        </div>
      )}
    </form>
  );
}