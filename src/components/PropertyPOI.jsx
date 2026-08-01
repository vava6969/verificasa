import React from "react";
import { Bus, GraduationCap, TreePine } from "lucide-react";
import { useCountry } from "@/components/CountryContext";

// Auto-generated Points of Interest based on the property's zone/neighborhood.
// In a production build this would come from a Maps API; here we use a curated
// dataset keyed by zone so listings always show relevant nearby amenities.

const POI_BY_ZONE = {
  "Copou": { transport: ["Stație autobuz Copou", "Tramvai 1 (Tg. Copou)"], education: ["UAIC - Corp A", "Liceul Național", "Universitatea „Al. I. Cuza”"], recreation: ["Parcul Copou", "Obeliscul cu Lupoaică", "Grădina Botanică"] },
  "Centru": { transport: ["Stație taxi Piața Unirii", "Autobuz 28"], education: ["Universitatea de Arte", "Colegiul Național"], recreation: ["Palas Mall", "Parcul Școlii Settings", "Piața Unirii"] },
  "Palas": { transport: ["Tramvai 13", "Stație Palas"], education: ["Universitatea „Al. I. Cuza” - extension"], recreation: ["Palas Mall", "Casa de Cultură", "Parcul Expoziției"] },
  "Tudor Vladimirescu": { transport: ["Autobuz 41", "Stație Tudor"], education: ["Liceul Sportiv", "Grădiniță"], recreation: ["Parcul Tudor Vladimirescu", "Teren de fotbal"] },
  "Galata": { transport: ["Autobuz 17"], education: ["Școala Galata"], recreation: ["Mănăstirea Galata", "Zona forestieră"] },
  "Dric 1": { transport: ["Stație Dric 1"], education: ["Școala Dric"], recreation: ["Parcul Dobrina"] },
};

const CITY_FALLBACK = {
  "Iași": { transport: ["Stație autobuz locală", "Taxi municipal"], education: ["Școală de cartier", "Grădiniță"], recreation: ["Parc de cartier", "Teren de joacă"] },
  "Huși": { transport: ["Stație autobuz Huși", "Gara Huși"], education: ["Școală de cartier", "Grădiniță"], recreation: ["Parcul Central Huși", "Zona Podgorie"] },
};

function getPOI(zone, city) {
  if (POI_BY_ZONE[zone]) return POI_BY_ZONE[zone];
  return CITY_FALLBACK[city] || CITY_FALLBACK["Iași"];
}

export default function PropertyPOI({ zone, city }) {
  const { t, lang } = useCountry();
  const poi = getPOI(zone, city);
  const CATS = [
    { key: "transport",  icon: Bus,          label: t("poi_transport"),   color: "text-blue-700 bg-blue-50" },
    { key: "education",  icon: GraduationCap,label: t("poi_education"),   color: "text-emerald bg-emerald-soft" },
    { key: "recreation", icon: TreePine,     label: t("poi_recreation"),  color: "text-gold-deep bg-gold-soft" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CATS.map((c) => (
        <div key={c.key} className="rounded-2xl border border-border bg-white p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.color}`}>
              <c.icon className="h-4 w-4" />
            </span>
            <h4 className="font-heading text-sm font-bold text-navy dark:text-foreground">{c.label}</h4>
          </div>
          <ul className="mt-3 space-y-1.5">
            {poi[c.key].map((item, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-foreground/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald/60" /> {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}