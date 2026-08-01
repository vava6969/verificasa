import React, { useEffect, useState } from "react";
import { Bus, GraduationCap, TreePine, Loader2 } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { base44 } from "@/api/base44Client";

// Puncte de interes REALE de la Google Maps Places API, pe o rază de 5 km
// în jurul locației proprietății. Fallback fals/din cartier nu mai afișăm —
// dacă Google nu găsește, afișăm un mesaj de loc gol.

const CATS_CONFIG = [
  { key: "transport",  icon: Bus,           label: "poi_transport",  types: ["transit_station", "train_station", "subway_station", "bus_station", "light_rail_station"], color: "text-blue-700 bg-blue-50" },
  { key: "education",  icon: GraduationCap, label: "poi_education", types: ["school", "university"], color: "text-emerald bg-emerald-soft" },
  { key: "recreation", icon: TreePine,      label: "poi_recreation", types: ["park", "tourist_attraction", "stadium"], color: "text-gold-deep bg-gold-soft" },
];

const RADIUS_M = 5000;

let keyPromise = null;
function getKey() {
  if (!keyPromise) {
    keyPromise = (async () => {
      try {
        const res = await base44.functions.invoke("GetGoogleMapsKey", {});
        return res?.data?.key || res?.key || null;
      } catch { return null; }
    })();
  }
  return keyPromise;
}

function haversineKm(a, b) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function fmtDist(km) {
  if (km == null) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
// Fără diacritice, lowercase — pentru potrivire oraș în `vicinity`.
function norm(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
const RADII = [5000, 10000, 20000];

async function geocode(key, address) {
  const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`);
  const j = await r.json();
  if (j.status === "OK" && j.results?.[0]) {
    const loc = j.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  }
  return null;
}

async function nearbyR(key, loc, type, radius) {
  const r = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${loc.lat},${loc.lng}&radius=${radius}&type=${type}&key=${key}`);
  const j = await r.json();
  if (j.status === "OK") return j.results || [];
  return [];
}

export default function PropertyPOI({ lat, lng, landmark, zone, city }) {
  const { t } = useCountry();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const address = [landmark, zone, city, "România"].filter(Boolean).join(", ");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setItems(null);

    (async () => {
      try {
        const key = await getKey();
        if (!key || !key.startsWith("AIza")) { if (alive) { setItems({}); setLoading(false); } return; }

        // Prioritate adresei geocodate (coerent cu harta), apoi lat/lng, apoi zone+city.
        let myLoc = null;
        if (landmark) myLoc = await geocode(key, address);
        if (!myLoc && lat != null && lng != null) myLoc = { lat: +lat, lng: +lng };
        if (!myLoc) myLoc = await geocode(key, [zone, city, "România"].filter(Boolean).join(", "));
        if (!myLoc) { if (alive) { setItems({}); setLoading(false); } return; }

        const out = {};
        await Promise.all(CATS_CONFIG.map(async (c) => {
          const seen = new Set();
          const collected = [];
          // Lărgim raza progresiv (max 20km) ca să acoperim tot orașul.
          for (const radius of RADII) {
            const perType = await Promise.all(c.types.map((ty) => nearbyR(key, myLoc, ty, radius)));
            for (const r of perType.flat()) {
              const loc = r.geometry?.location;
              if (!loc || !r.place_id || seen.has(r.place_id)) continue;
              seen.add(r.place_id);
              collected.push({ name: r.name, dist: haversineKm(myLoc, { lat: loc.lat, lng: loc.lng }) });
            }
            collected.sort((a, b) => a.dist - b.dist);
            if (collected.length >= 3) break;
          }
          out[c.key] = collected.slice(0, 3);
        }));

        if (alive) { setItems(out); setLoading(false); }
      } catch {
        if (alive) { setItems({}); setLoading(false); }
      }
    })();

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, landmark, zone, city]);

  const CATS = CATS_CONFIG.map((c) => ({ ...c, label: t(c.label) }));

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CATS.map((c) => {
        const list = items?.[c.key];
        return (
          <div key={c.key} className="rounded-2xl border border-border bg-white p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-4 w-4" />
              </span>
              <h4 className="font-heading text-sm font-bold text-navy dark:text-foreground">{c.label}</h4>
            </div>
            <ul className="mt-3 space-y-1.5">
              {loading ? (
                <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> {t("map_load")}
                </li>
              ) : list && list.length > 0 ? (
                list.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-1.5 text-xs text-foreground/70">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald/60" />
                      <span className="truncate">{item.name}</span>
                    </span>
                    {fmtDist(item.dist) && (
                      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{fmtDist(item.dist)}</span>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground/70">—</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}