import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";

const TYPES = ["Toate", "Garsonieră", "2 Camere", "3 Camere", "Studio", "Casă"];

export default function SearchBar({ compact = false }) {
  const { country } = useCountry();
  const navigate = useNavigate();
  const [city, setCity] = useState(country === "UK" ? "" : "");
  const [zone, setZone] = useState("");
  const [type, setType] = useState("Toate");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (zone) params.set("zone", zone);
    if (type && type !== "Toate") params.set("type", type);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`w-full rounded-2xl border border-white/20 bg-white p-2 shadow-2xl ${compact ? "" : "md:p-3"}`}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-mint" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={country === "UK" ? "Oraș (ex. London)" : "Oraș (ex. București)"}
            className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="hidden h-8 w-px bg-border md:block" />

        <div className="flex flex-1 items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-mint" />
          <input
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Zona / Metrou (ex. Aviatorilor)"
            className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="hidden h-8 w-px bg-border md:block" />

        <div className="flex flex-1 items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5">
          <Home className="h-4 w-4 shrink-0 text-mint" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-transparent text-sm text-navy outline-none"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <Button type="submit" className="gradient-mint text-navy shadow-soft hover:opacity-90 md:px-6">
          <Search className="h-4 w-4" /> Caută
        </Button>
      </div>

      {!compact && (
        <div className="mt-2 flex items-center gap-2 px-2 pb-1">
          <span className="flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-semibold text-navy">
            <Sparkles className="h-3 w-3" /> AI Tours Included
          </span>
        </div>
      )}
    </form>
  );
}