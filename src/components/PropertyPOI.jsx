import React, { useEffect, useState } from "react";
import { Bus, GraduationCap, TreePine, Loader2 } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { base44 } from "@/api/base44Client";

// Puncte de interes reale, calculate din Google Maps în funcție de
// locația proprietății (lat/lng sau adresa geocodată), pe o rază de 5 km.
// Dacă Google Places nu răspunde, cădem pe setul static de cartier.

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
function staticPOI(zone, city) {
  if (POI_BY_ZONE[zone]) return POI_BY_ZONE[zone];
  return CITY_FALLBACK[city] || CITY_FALLBACK["Iași"];
}
function staticItems(zone, city) {
  const st = staticPOI(zone, city);
  const wrap = (arr) => arr.map((name) => ({ name, dist: null }));
  return { transport: wrap(st.transport), education: wrap(st.education), recreation: wrap(st.recreation) };
}

let keyPromise = null;
let scriptPromise = null;
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
function loadScript(key) {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("maps load failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

const CATS_CONFIG = [
  { key: "transport",  icon: Bus,           label: "poi_transport",  types: ["transit_station", "bus_station", "train_station", "subway_station", "light_rail_station"], color: "text-blue-700 bg-blue-50" },
  { key: "education",  icon: GraduationCap, label: "poi_education", types: ["school", "primary_school", "secondary_school", "university"], color: "text-emerald bg-emerald-soft" },
  { key: "recreation", icon: TreePine,      label: "poi_recreation", types: ["park", "tourist_attraction", "stadium"], color: "text-gold-deep bg-gold-soft" },
];

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

export default function PropertyPOI({ lat, lng, landmark, zone, city }) {
  const { t } = useCountry();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const address = [landmark, zone, city, "România"].filter(Boolean).join(", ");

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const fallback = () => {
      if (alive) { setItems(staticItems(zone, city)); setLoading(false); }
    };

    (async () => {
      try {
        const key = await getKey();
        if (!key || !key.startsWith("AIza")) return fallback();
        await loadScript(key);
        if (!alive) return;
        const g = window.google.maps;
        const gmap = g;

        // Locația sursă: prioritate adresei geocodate (coerent cu harta),
        // apoi lat/lng salvate, apoi geocode pe zona+oraș.
        let myLoc = null;
        let myLocPromise = null;
        if (landmark) myLocPromise = locByGeocode(gmap, address).catch(() => null);
        if (!myLocPromise) myLocPromise = (lat != null && lng != null) ? Promise.resolve({ lat: +lat, lng: +lng }) : locByGeocode(gmap, address);
        myLoc = await myLocPromise;
        if (!myLoc) return fallback();

        const service = new g.places.PlacesService(document.createElement("div"));
        const perCat = await Promise.all(
          CATS_CONFIG.map(async (c) => {
            const perType = await Promise.all(c.types.map((ty) => nearby(service, myLoc, ty, 5000)));
            const merged = perType.flat();
            const seen = new Set();
            const dedup = [];
            for (const r of merged) {
              if (!r || !r.place_id) continue;
              if (seen.has(r.place_id)) continue;
              seen.add(r.place_id);
              const loc = r.geometry?.location;
              if (!loc) continue;
              dedup.push({ name: r.name, dist: haversineKm(myLoc, { lat: loc.lat(), lng: loc.lng() }) });
            }
            dedup.sort((a, b) => a.dist - b.dist);
            return [c.key, dedup.slice(0, 3)];
          })
        );

        // Dacă o categorie e goală, cădem fără să blocăm restul.
        const out = {};
        for (const [k, list] of perCat) out[k] = list.length ? list : null;
        if (!out.transport && !out.education && !out.recreation) return fallback();

        // Completăm categoriile lipsă cu setul static.
        const st = staticItems(zone, city);
        ["transport", "education", "recreation"].forEach((k) => {
          if (!out[k]) out[k] = st[k];
        });

        if (alive) { setItems(out); setLoading(false); }
      } catch {
        fallback();
      }
    })();

    // Timeout: dacă Google întârzie >9s, arată fallback-ul.
    const to = setTimeout(fallback, 9000);
    return () => { alive = false; clearTimeout(to); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, landmark, zone, city]);

  const CATS = CATS_CONFIG.map((c) => ({
    ...c,
    label: t(c.label),
  }));

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
              {loading || !list ? (
                <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> {t("map_load")}
                </li>
              ) : (
                list.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-1.5 text-xs text-foreground/70">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald/60" />
                      <span className="truncate">{item.name}</span>
                    </span>
                    {fmtDist(item.dist) && (
                      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{fmtDist(item.dist)}</span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function nearby(service, location, type, radius) {
  return new Promise((resolve) => {
    service.nearbySearch({ location, radius, type }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) resolve(results || []);
      else resolve([]);
    });
  });
}

function locByGeocode(gmap, address) {
  return new Promise((resolve, reject) => {
    new gmap.Geocoder().geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else reject(new Error("geocode failed"));
    });
  });
}