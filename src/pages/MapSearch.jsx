import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer, TileLayer, Marker, Tooltip, Polygon, CircleMarker,
  useMap, useMapEvents,
} from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import PropertyCard from "@/components/PropertyCard";
import MapPropertySheet from "@/components/MapPropertySheet";
import MapInfoCards from "@/components/MapInfoCards";
import SearchFiltersDrawer from "@/components/SearchFiltersDrawer";
import { getCounty } from "@/components/locations";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, Heart, X, ArrowLeft, Plus, Minus, PenLine, Trash2, Check, Loader2,
  Search, Home, Sparkles, ShieldCheck, PawPrint, BadgePercent, RotateCcw,
} from "lucide-react";
import { ROMANIA_COUNTIES, ROMANIA_CENTER, ROMANIA_MAX_BOUNDS } from "@/lib/romaniaCounties";
import { resolvePropertyPlan, PLAN_FILTER_OPTIONS } from "@/lib/plans";
import { fetchActivePlanMap } from "@/lib/subscriptions";

// Aceleași filtre ca pe /search — reutilizate 1:1 aici ca lista și harta
// să răspundă la exact aceleași criterii, indiferent de unde intri.
const VERIF_FILTERS = [
  { key: "ai", labelKey: "tg_ai", icon: Sparkles, test: (p) => !!p.tour_3d_url || !!p.ai_video_url || !!p.ai_tour_verified },
  { key: "field", labelKey: "tg_field", icon: ShieldCheck, test: (p) => p.owner_verified || p.verification_level === "field_certified" || p.ai_tour_verified },
  { key: "pet", labelKey: "tg_pet", icon: PawPrint, test: (p) => !!p.pet_friendly },
  { key: "nofee", labelKey: "tg_nofee", icon: BadgePercent, test: (p) => !!p.commission_free },
  { key: "studio", labelKey: "type_studio_vc", icon: Home, test: (p) => ["Garsonieră", "Studio"].includes(p.property_type) },
  { key: "2camere", labelKey: "type_2_vc", icon: Home, test: (p) => p.property_type === "2 Camere" },
  { key: "parking", labelKey: "sr_parking", icon: Home, test: (p) => !!p.parking },
];
const makeFairness = (t) => [
  { value: "", label: t("sr_fairness_all") },
  { value: "sub_piata", label: t("sr_fairness_below") },
  { value: "corect", label: t("sr_fairness_fair") },
  { value: "peste_medie", label: t("sr_fairness_above") },
];
const makeSort = (t) => [
  { value: "", label: t("sr_sort") },
  { value: "newest", label: t("sr_sort_newest") },
  { value: "price_asc", label: t("sr_sort_asc") },
  { value: "price_desc", label: t("sr_sort_desc") },
];
const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const PAGE_SIZE = 5;

function formatCount(n) {
  if (n >= 1000) {
    const k = (n / 1000).toFixed(1);
    return (k.endsWith(".0") ? k.slice(0, -2) : k) + "K";
  }
  return String(n);
}

// Preț scurt pentru ștampila de pe hartă: 1.250 € / 89 K € — cifre tabulare,
// fără zecimale, ca ștampilele să aibă lățimi comparabile între ele.
function stampPrice(p) {
  const n = Number(p.price_monthly) || 0;
  const sym = p.currency === "RON" ? "lei" : p.currency === "GBP" ? "£" : "€";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(".0", "")}M ${sym}`;
  if (n >= 10000) return `${Math.round(n / 1000)}K ${sym}`;
  return `${n.toLocaleString("ro-RO")} ${sym}`;
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Leaflet path options iau culori concrete, nu variabile CSS — citim tokenul
// temei o dată, ca poligonul desenat să rămână verde în ambele teme.
function tokenColor(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `hsl(${v})` : fallback;
}

// Grup de anunțuri = marcă de fascicul: pătrat, cu un al doilea contur, cifre
// tabulare. Nu cerc, nu gradient — vezi .vc-bundle în index.css.
function clusterIcon(count, isActive) {
  const w = count >= 1000 ? 48 : count >= 100 ? 42 : 36;
  return L.divIcon({
    className: "vc-bundle-wrap",
    html: `<span class="vc-bundle${isActive ? " vc-bundle--active" : ""}">${formatCount(count)}</span>`,
    iconSize: [w, 26],
    iconAnchor: [w / 2, 13],
  });
}

// Anunț = ștampilă de preț. Bifa verde marchează verificarea, crestătura
// marcaj marchează promovarea (plata e declarată, nu ascunsă), starea activă
// se inversează pe verde. Toate culorile vin din tokenii temei.
function propertyIcon(property, { isActive = false, isVisited = false } = {}) {
  const verified =
    property.owner_verified ||
    property.verification_level === "field_certified" ||
    property.ai_tour_verified;
  const boosted = property.boost_active || property.featured;
  const cls = [
    "vc-pin",
    isActive ? "vc-pin--active" : "",
    !isActive && isVisited ? "vc-pin--visited" : "",
    boosted ? "vc-pin--boosted" : "",
  ].filter(Boolean).join(" ");
  const label = stampPrice(property);
  const w = 24 + label.length * 7.2 + (verified ? 10 : 0);
  return L.divIcon({
    className: "vc-pin-wrap",
    html: `<span class="${cls}">${esc(label)}${verified ? '<span class="vc-pin-tick">✓</span>' : ""}</span>`,
    iconSize: [w, 24],
    iconAnchor: [w / 2, 30],
  });
}

function countyLabelIcon(name) {
  return L.divIcon({
    className: "vc-county-label",
    html: `<span class="vc-maplabel">${esc(name)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function pointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function MapController({ onBoundsChange, onZoomChange, flyTarget, onFlyDone, onReady }) {
  const map = useMap();

  useEffect(() => {
    onReady?.(map);
    const b = map.getBounds();
    const c = map.getCenter();
    onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest(), lat: c.lat, lng: c.lng });
    onZoomChange(map.getZoom());
     
  }, [map]);

  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], flyTarget.zoom || 10, { duration: 0.8 });
      onFlyDone();
    }
     
  }, [flyTarget, map]);

  useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      const c = map.getCenter();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest(), lat: c.lat, lng: c.lng });
    },
    zoomend: () => {
      onZoomChange(map.getZoom());
      const b = map.getBounds();
      const c = map.getCenter();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest(), lat: c.lat, lng: c.lng });
    },
  });

  return null;
}

function DrawController({ drawMode, onAddPoint }) {
  useMapEvents({
    click: (e) => {
      if (drawMode) onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function MapSearch() {
  const { country, lang, t } = useCountry();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const en = lang === "en";

  // Filtre unificate — aceleași ca pe /search, sincronizate cu URL-ul, astfel
  // încât harta și lista de rezultate răspund la exact aceleași criterii.
  const [params, setParams] = useSearchParams();
  const cityParam = params.get("city") || "";
  const zoneParam = params.get("zone") || "";
  const countyParam = params.get("county") || "";
  const typeParam = params.get("type") || "";
  const qParam = params.get("q") || "";
  const [budget, setBudget] = useState("");
  const [roomsMin, setRoomsMin] = useState("");
  const [surfaceMin, setSurfaceMin] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [swap, setSwap] = useState(false);
  const [fairness, setFairness] = useState("");
  const [sort, setSort] = useState("");
  const [activeFilters, setActiveFilters] = useState(() => {
    const s = new Set();
    VERIF_FILTERS.forEach((f) => { if (params.get(f.key) === "1") s.add(f.key); });
    return s;
  });
  const [planFilters, setPlanFilters] = useState(() => {
    const raw = params.get("plan");
    return new Set(raw ? raw.split(",").filter(Boolean) : []);
  });

  const updateLocation = ({ county, city, zone }) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    if (city) next.set("city", city); else next.delete("city");
    if (zone) next.set("zone", zone); else next.delete("zone");
    if (!city && county) next.set("county", county); else next.delete("county");
    return next;
  }, { replace: true });
  const setQ = (v) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    if (v) next.set("q", v); else next.delete("q");
    return next;
  }, { replace: true });
  const toggleFilter = (key) => {
    setActiveFilters((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      const next = new URLSearchParams(params);
      if (n.has(key)) next.set(key, "1"); else next.delete(key);
      setParams(next, { replace: true });
      return n;
    });
  };
  const togglePlan = (id) => {
    setPlanFilters((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      const next = new URLSearchParams(params);
      if (n.size > 0) next.set("plan", Array.from(n).join(",")); else next.delete("plan");
      setParams(next, { replace: true });
      return n;
    });
  };
  const resetFilters = () => {
    setBudget(""); setRoomsMin(""); setSurfaceMin("");
    setFurnished(false); setSwap(false); setFairness(""); setSort("");
    setActiveFilters(new Set());
    setPlanFilters(new Set());
    setParams(new URLSearchParams(), { replace: true });
  };

  const [properties, setProperties] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(6);
  const [flyTarget, setFlyTarget] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [showListMobile, setShowListMobile] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [drawMode, setDrawMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [planMap, setPlanMap] = useState(null);
  // Fișa de teren: fundal PLAN / SATELIT, colțuri cu coordonatele vii, scară.
  const [basemap, setBasemap] = useState("plan");
  // Anunțurile deja deschise se sting pe hartă — vezi .vc-pin--visited.
  const [visitedIds, setVisitedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("vc_visited_props") || "[]")); }
    catch { return new Set(); }
  });
  const drawColor = tokenColor("--primary", "#1F7048");

  const markVisited = useCallback((id) => {
    if (!id) return;
    setVisitedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem("vc_visited_props", JSON.stringify([...next].slice(-300))); } catch { /* noop */ }
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [all, map] = await Promise.all([
          base44.entities.Property.filter(
            { approval_status: "APPROVED", status: "Activ", country: "RO" },
            "-views_count",
            500
          ),
          fetchActivePlanMap(),
        ]);
        if (!cancelled) { setProperties(all); setPlanMap(map); }
      } catch (e) {
        if (!cancelled) { setProperties([]); setPlanMap(new Map()); }
      }
    })();

    // Realtime: new/updated/deleted properties appear on the map instantly
    const unsubscribe = base44.entities.Property.subscribe((event) => {
      const p = event.data;
      setProperties((prev) => {
        if (!prev) return prev;
        if (event.type === "delete") return prev.filter((x) => x.id !== event.id);
        if (!p) return prev;
        const matches = p.approval_status === "APPROVED" && p.status === "Activ" && p.country === "RO";
        if (!matches) return prev.filter((x) => x.id !== p.id);
        const idx = prev.findIndex((x) => x.id === p.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = p;
          return next;
        }
        return [p, ...prev];
      });
    });

    return () => { cancelled = true; unsubscribe(); };
  }, []);

  const geoProps = useMemo(
    () => (properties || []).filter((p) => p.latitude && p.longitude),
    [properties]
  );

  // Aceleași criterii ca pe /search, aplicate înainte de filtrarea geografică
  // (bounds/poligon) — harta și lista arată mereu aceleași rezultate.
  const filteredGeoProps = useMemo(() => {
    return geoProps.filter((p) => {
      if (cityParam && !norm(p.city).includes(norm(cityParam))) return false;
      if (zoneParam && !norm(`${p.zone || ""} ${p.landmark || ""}`).includes(norm(zoneParam))) return false;
      if (countyParam && norm(getCounty(p.city)) !== norm(countyParam)) return false;
      if (typeParam && p.property_type !== typeParam) return false;
      if (qParam) {
        const hay = norm([p.title, p.zone, p.city, p.landmark, p.description, p.property_type, p.property_code].join(" "));
        if (!hay.includes(norm(qParam))) return false;
      }
      for (const f of VERIF_FILTERS) {
        if (activeFilters.has(f.key) && !f.test(p)) return false;
      }
      if (planFilters.size > 0) {
        const plan = resolvePropertyPlan(p, planMap) || "none";
        if (!planFilters.has(plan)) return false;
      }
      if (budget) { const max = parseInt(budget, 10); if (!isNaN(max) && p.price_monthly > max) return false; }
      if (roomsMin) { const r = parseInt(roomsMin, 10); if (!isNaN(r) && (p.rooms == null || p.rooms < r)) return false; }
      if (surfaceMin) { const s = parseFloat(surfaceMin); if (!isNaN(s) && (p.surface_sqm == null || p.surface_sqm < s)) return false; }
      if (furnished && !p.furnished) return false;
      if (swap && !p.is_swap_available) return false;
      if (fairness && p.price_fairness !== fairness) return false;
      return true;
    });
  }, [geoProps, cityParam, zoneParam, countyParam, typeParam, qParam, activeFilters, planFilters, planMap, budget, roomsMin, surfaceMin, furnished, swap, fairness]);

  const clusters = useMemo(() => {
    if (!filteredGeoProps.length) return [];
    if (zoom < 8) {
      const byCounty = {};
      filteredGeoProps.forEach((p) => {
        const county = p.county || "Altele";
        if (!byCounty[county]) byCounty[county] = { count: 0, lat: 0, lng: 0, n: 0, county, type: "county" };
        byCounty[county].count++;
        const center = ROMANIA_COUNTIES.find((c) => c.name === county);
        if (center) {
          byCounty[county].lat = center.lat;
          byCounty[county].lng = center.lng;
        } else {
          byCounty[county].lat += p.latitude;
          byCounty[county].lng += p.longitude;
          byCounty[county].n++;
        }
      });
      return Object.values(byCounty)
        .map((c) => {
          if (c.n > 0 && (!c.lat || c.lat === 0)) {
            c.lat = c.lat / c.n;
            c.lng = c.lng / c.n;
          }
          return c;
        })
        .filter((c) => c.lat && c.lng);
    } else if (zoom < 12) {
      const byCity = {};
      filteredGeoProps.forEach((p) => {
        const city = p.city || "Altele";
        if (!byCity[city]) byCity[city] = { count: 0, lat: 0, lng: 0, n: 0, city, county: p.county, type: "city" };
        byCity[city].count++;
        byCity[city].lat += p.latitude;
        byCity[city].lng += p.longitude;
        byCity[city].n++;
      });
      return Object.values(byCity)
        .map((c) => ({ ...c, lat: c.n > 0 ? c.lat / c.n : 0, lng: c.n > 0 ? c.lng / c.n : 0 }))
        .filter((c) => c.lat && c.lng);
    }
    return filteredGeoProps.map((p) => ({
      ...p,
      lat: p.latitude,
      lng: p.longitude,
      count: 1,
      type: "property",
    }));
  }, [filteredGeoProps, zoom]);

  const visibleProperties = useMemo(() => {
    let result = filteredGeoProps;
    if (bounds) {
      result = result.filter(
        (p) =>
          p.latitude >= bounds.south &&
          p.latitude <= bounds.north &&
          p.longitude >= bounds.west &&
          p.longitude <= bounds.east
      );
    }
    if (polygonPoints.length >= 3) {
      result = result.filter((p) => pointInPolygon(p.latitude, p.longitude, polygonPoints));
    }
    if (sort === "price_asc") result = [...result].sort((a, b) => (a.price_monthly || 0) - (b.price_monthly || 0));
    else if (sort === "price_desc") result = [...result].sort((a, b) => (b.price_monthly || 0) - (a.price_monthly || 0));
    else if (sort === "newest") result = [...result].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    return result;
  }, [filteredGeoProps, bounds, polygonPoints, sort]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [bounds, polygonPoints, cityParam, zoneParam, countyParam, typeParam, qParam, activeFilters, planFilters, budget, roomsMin, surfaceMin, furnished, swap, fairness, sort]);

  const displayedProperties = visibleProperties.slice(0, displayCount);
  const hasMore = displayedProperties.length < visibleProperties.length;

  // 99+ format for badge
  const badgeCount = visibleProperties.length > 99 ? "99+" : String(visibleProperties.length);

  const handleClusterClick = useCallback(
    (cluster) => {
      if (cluster.type === "county") {
        setFlyTarget({ lat: cluster.lat, lng: cluster.lng, zoom: 9 });
      } else if (cluster.type === "city") {
        setFlyTarget({ lat: cluster.lat, lng: cluster.lng, zoom: 12 });
      } else if (cluster.type === "property") {
        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        if (isMobile) {
          setSelectedProperty(cluster);
        } else {
          navigate(`/property/${cluster.id}`);
        }
      }
    },
    [navigate]
  );

  const saveSearch = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!bounds) return;
    try {
      const qs = `?map=${bounds.south.toFixed(4)},${bounds.west.toFixed(4)},${bounds.north.toFixed(4)},${bounds.east.toFixed(4)}`;
      await base44.entities.SavedSearch.create({
        user_id: user.id,
        label: en ? "Map search" : "Căutare pe hartă",
        query_string: qs,
      });
      toast({ title: en ? "Search saved" : "Căutare salvată", description: en ? "You'll find it in Saved Searches." : "O găsești în Căutări salvate." });
    } catch (e) {
      toast({ title: en ? "Error" : "Eroare", description: e.message, variant: "destructive" });
    }
  };

  const finishDraw = () => {
    if (polygonPoints.length < 3) {
      toast({ title: en ? "Need 3+ points" : "Necesari 3+ puncte", variant: "destructive" });
      return;
    }
    setDrawMode(false);
  };

  const cancelDraw = () => {
    setDrawMode(false);
    setPolygonPoints([]);
  };

  const clearPolygon = () => setPolygonPoints([]);

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100dvh-3.5rem)]">
      {/* MAP PANE — z-0 contains all inner z-indexes below the header/dropdown */}
      <div className="relative z-0 h-[55vh] md:h-full md:flex-1">
        <MapContainer
          center={ROMANIA_CENTER}
          zoom={6}
          minZoom={6}
          maxZoom={18}
          maxBounds={ROMANIA_MAX_BOUNDS}
          maxBoundsViscosity={0.8}
          zoomControl={false}
          scrollWheelZoom
          className="h-full w-full"
          style={{ background: "hsl(var(--secondary))" }}
        >
          {/* Fundal. PLAN e gradat spre paleta hârtiei prin filtru CSS
              (.vc-tiles-plan), cu variantă inversată pentru noapte — soluția
              provizorie până intră cheia MapTiler a clientului, moment în care
              url-ul se schimbă pe stilul Dataviz recolorat, iar filtrul cade. */}
          {basemap === "plan" ? (
            <TileLayer
              key="plan"
              className="vc-tiles-plan"
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />
          ) : (
            <TileLayer
              key="satelit"
              className="vc-tiles-none"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri, Maxar, Earthstar Geographics'
            />
          )}

          {/* County labels at low zoom */}
          {zoom < 8 &&
            ROMANIA_COUNTIES.map((c) => (
              <Marker
                key={`label-${c.name}`}
                position={[c.lat, c.lng]}
                icon={countyLabelIcon(c.name)}
                interactive={false}
                zIndexOffset={-500}
              />
            ))}

          {/* Drawn polygon */}
          {polygonPoints.length >= 2 && (
            <Polygon
              positions={polygonPoints}
              pathOptions={{ color: drawColor, weight: 2, fillColor: drawColor, fillOpacity: 0.1, dashArray: drawMode ? "6 4" : undefined }}
            />
          )}
          {polygonPoints.map((pt, i) => (
            <CircleMarker
              key={`pt-${i}`}
              center={pt}
              radius={5}
              pathOptions={{ color: drawColor, fillColor: drawColor, fillOpacity: 1 }}
            />
          ))}

          {/* Cluster / property markers */}
          {clusters.map((c, i) => {
            const key = `${c.type}-${c.county || c.city || c.id}-${i}`;
            const isActive = hoveredKey === key;
            return (
              <Marker
                key={key}
                position={[c.lat, c.lng]}
                icon={
                  c.type === "property"
                    ? propertyIcon(c, { isActive: isActive || hoveredKey === c.id, isVisited: visitedIds.has(c.id) })
                    : clusterIcon(c.count, isActive)
                }
                zIndexOffset={c.type === "property" && (isActive || hoveredKey === c.id) ? 400 : 0}
                eventHandlers={{
                  click: () => handleClusterClick(c),
                  mouseover: () => setHoveredKey(c.type === "property" ? c.id : key),
                  mouseout: () => setHoveredKey(null),
                }}
              >
                <Tooltip direction="top" offset={[0, -12]}>
                  {c.type === "county"
                    ? `Județul ${c.county}`
                    : c.type === "city"
                    ? c.city
                    : c.title}
                </Tooltip>
              </Marker>
            );
          })}

          <MapController
            onBoundsChange={setBounds}
            onZoomChange={setZoom}
            flyTarget={flyTarget}
            onFlyDone={() => setFlyTarget(null)}
            onReady={setMapInstance}
          />
          <DrawController drawMode={drawMode} onAddPoint={(pt) => setPolygonPoints((prev) => [...prev, pt])} />
        </MapContainer>

        {/* ——— RAMA FIȘEI DE TEREN ———
            Colțurile tipăresc coordonatele vii (se schimbă la fiecare pan),
            marginea poartă scara și nordul. E interfață reală, nu decor: asta
            transformă „pagina cu hartă" în fișa de teren a registrului. */}
        <div className="pointer-events-none absolute inset-0 z-[900] border-[6px] border-background/85">
          <span className="vc-sheet-coord absolute left-2 top-2">
            {bounds ? `${bounds.north.toFixed(4)} N · ${bounds.west.toFixed(4)} E` : "—"}
          </span>
          <span className="vc-sheet-coord absolute right-2 top-2">N ↑</span>
          <span className="vc-sheet-coord absolute bottom-2 left-2">
            {bounds ? `${bounds.south.toFixed(4)} N · ${bounds.east.toFixed(4)} E` : "—"}
          </span>
          <span className="vc-sheet-coord absolute bottom-2 right-2">
            ZOOM {String(zoom).padStart(2, "0")} · {visibleProperties.length} ÎNREG.
          </span>
        </div>

        {/* Înapoi */}
        <button
          onClick={() => navigate("/")}
          className="absolute left-3 top-8 z-[1000] flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-emerald"
        >
          <ArrowLeft className="h-4 w-4" /> {en ? "Back" : "Înapoi"}
        </button>

        {/* Zoom */}
        <div className="absolute left-3 top-20 z-[1000] flex flex-col divide-y divide-border overflow-hidden rounded border border-border bg-background">
          <button
            onClick={() => mapInstance?.zoomIn()}
            className="flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:bg-secondary"
            aria-label={en ? "Zoom in" : "Apropie"}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => mapInstance?.zoomOut()}
            className="flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:bg-secondary"
            aria-label={en ? "Zoom out" : "Depărtează"}
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        {/* PLAN / SATELIT — file ștampilate */}
        <div className="absolute right-3 top-8 z-[1000] flex divide-x divide-border overflow-hidden rounded border border-border bg-background">
          {[
            { id: "plan", label: "PLAN" },
            { id: "satelit", label: "SATELIT" },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setBasemap(b.id)}
              aria-pressed={basemap === b.id}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                basemap === b.id ? "bg-emerald text-primary-foreground" : "text-foreground hover:bg-secondary"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Salvează căutarea + desenare zonă */}
        <div className="absolute right-3 top-20 z-[1000] flex flex-col items-end gap-1.5">
          <button
            onClick={saveSearch}
            className="flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-emerald"
          >
            <Heart className="h-4 w-4" /> <span className="hidden sm:inline">{en ? "Save" : "Salvează"}</span>
          </button>

          {drawMode ? (
            <>
              <button
                onClick={finishDraw}
                className="flex items-center gap-1.5 rounded bg-emerald px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90"
              >
                <Check className="h-4 w-4" /> {en ? "Finish" : "Finalizează"}
              </button>
              <button
                onClick={cancelDraw}
                className="flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-emerald"
              >
                <X className="h-4 w-4" /> {en ? "Cancel" : "Anulează"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setDrawMode(true)}
              className="flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-emerald"
            >
              <PenLine className="h-4 w-4" /> {en ? "Mark a parcel" : "Marchează o parcelă"}
            </button>
          )}
          {polygonPoints.length >= 3 && !drawMode && (
            <button
              onClick={clearPolygon}
              className="flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-sm font-semibold text-destructive transition-colors hover:border-destructive"
            >
              <Trash2 className="h-4 w-4" /> {en ? "Clear parcel" : "Șterge parcela"}
            </button>
          )}
        </div>

        {/* Instrucțiune desenare */}
        {drawMode && (
          <div className="absolute left-1/2 top-32 z-[1000] -translate-x-1/2 border border-border bg-background px-4 py-1.5 text-xs font-semibold text-foreground">
            {en ? "Tap the map to add points" : "Apasă pe hartă pentru a adăuga puncte"}
          </div>
        )}

        {/* Mobil: numărul de înregistrări → deschide lista */}
        <button
          onClick={() => setShowListMobile(true)}
          className="absolute bottom-6 left-1/2 z-[1000] flex min-h-[44px] -translate-x-1/2 items-center gap-2 rounded bg-foreground px-4 py-2 text-sm font-semibold text-background md:hidden"
        >
          <MapPin className="h-4 w-4" /> {badgeCount} {en ? "properties" : "proprietăți"}
        </button>

        {/* Mobile bottom sheet */}
        <MapPropertySheet property={selectedProperty} onClose={() => setSelectedProperty(null)} lang={lang} />
      </div>

      {/* INFO CARDS (mobile only — fill space below map) */}
      <div className="space-y-3 p-4 pb-24 md:hidden">
        {properties === null ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald" />
          </div>
        ) : (
          <MapInfoCards properties={properties} lang={lang} />
        )}
      </div>

      {/* LIST PANE */}
      <div
        className={`${
          showListMobile ? "fixed inset-0 z-[1100] block" : "hidden"
        } md:relative md:z-auto md:block md:w-[400px] md:shrink-0 md:h-full overflow-y-auto border-t md:border-t-0 md:border-l border-border bg-background`}
      >
        <div className="sticky top-0 z-10 border-b border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground tnum">
                {visibleProperties.length} {en ? "properties in this frame" : "proprietăți în cadru"}
              </p>
              <p className="text-xs text-muted-foreground">
                {polygonPoints.length >= 3
                  ? en ? "Filtered by the marked parcel" : "Filtrat după parcela marcată"
                  : en ? "Move the map to update results" : "Mută harta pentru a actualiza"}
              </p>
            </div>
            <button
              onClick={() => setShowListMobile(false)}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary md:hidden"
              aria-label={en ? "Close list" : "Închide lista"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filtre unificate — aceleași ca pe fostul /search, acum direct lângă hartă */}
          <div className="mt-3 space-y-2">
            <div className="rounded border border-border bg-background px-2.5 py-2 dark:bg-card">
              <LocationAutocomplete
                country={country}
                value={{ county: countyParam, city: cityParam, zone: zoneParam }}
                onSelect={updateLocation}
                placeholder={en ? "City, county or area" : "Oraș, județ sau zonă"}
                inputClassName="text-xs font-medium"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                defaultValue={qParam}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("sr_search_placeholder")}
                className="w-full rounded border border-border bg-background py-2 pl-8 pr-3 text-xs text-foreground outline-none focus:border-emerald dark:bg-card"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SearchFiltersDrawer
                t={t}
                filters={VERIF_FILTERS}
                activeFilters={activeFilters}
                onToggle={toggleFilter}
                planOptions={PLAN_FILTER_OPTIONS}
                planFilters={planFilters}
                onTogglePlan={togglePlan}
                budget={budget} setBudget={setBudget}
                roomsMin={roomsMin} setRoomsMin={setRoomsMin}
                surfaceMin={surfaceMin} setSurfaceMin={setSurfaceMin}
                fairness={fairness} setFairness={setFairness}
                fairnessOptions={makeFairness(t)}
                furnished={furnished} setFurnished={setFurnished}
                swap={swap} setSwap={setSwap}
                sort={sort} setSort={setSort}
                sortOptions={makeSort(t)}
                onReset={resetFilters}
              />
              <button
                type="button"
                onClick={resetFilters}
                className="flex min-h-[36px] items-center gap-1.5 rounded border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground/70 transition-colors hover:border-emerald dark:bg-card"
              >
                <RotateCcw className="h-3.5 w-3.5" /> {t("sr_reset_filters")}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-3">
          {properties === null ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-sm" />)
          ) : visibleProperties.length === 0 ? (
            <div className="border border-dashed border-border px-4 py-16 text-center">
              <p className="text-sm font-semibold text-foreground">
                {en ? "No properties in this frame" : "Nicio proprietate în acest cadru"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {en ? "Pan the map or zoom out to widen the search." : "Mută harta sau depărtează pentru a lărgi căutarea."}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-sm font-bold text-emerald transition-colors hover:text-foreground"
              >
                {t("sr_reset_filters")} <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <>
              {/* Sincronizare listă ↔ hartă: cardul peste care treci ridică
                  ștampila corespunzătoare, și invers. */}
              {displayedProperties.map((p) => (
                <div
                  key={p.id}
                  onMouseEnter={() => setHoveredKey(p.id)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => markVisited(p.id)}
                  className={hoveredKey === p.id ? "ring-1 ring-emerald" : undefined}
                >
                  <PropertyCard property={p} />
                </div>
              ))}
              {hasMore && (
                <button
                  onClick={() => setDisplayCount((c) => c + PAGE_SIZE)}
                  className="flex w-full items-center justify-center gap-2 rounded border border-border py-3 text-sm font-semibold text-emerald transition-colors hover:border-emerald hover:bg-secondary"
                >
                  {en ? "Load more" : "Încarcă mai multe"} <span aria-hidden="true">→</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}