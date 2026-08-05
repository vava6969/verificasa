import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Heart, X, ArrowLeft } from "lucide-react";
import { ROMANIA_COUNTIES, ROMANIA_CENTER, ROMANIA_MAX_BOUNDS } from "@/lib/romaniaCounties";

function formatCount(n) {
  if (n >= 1000) {
    const k = (n / 1000).toFixed(1);
    return (k.endsWith(".0") ? k.slice(0, -2) : k) + "K";
  }
  return String(n);
}

function clusterIcon(count, isActive) {
  const size = count >= 1000 ? 52 : count >= 100 ? 46 : count >= 10 ? 40 : 36;
  const bg = isActive ? "#00A859" : "#3a6c76";
  return L.divIcon({
    className: "vc-cluster",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:12px;font-family:Inter,system-ui,sans-serif;
      box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 0 4px ${bg}33;
      border:2.5px solid #fff;transition:transform .15s ease;
    ">${formatCount(count)}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function propertyIcon() {
  return L.divIcon({
    className: "vc-property-pin",
    html: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 7 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8z" fill="#00A859" stroke="#fff" stroke-width="2"/>
      <circle cx="12" cy="10" r="3" fill="#fff"/>
    </svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

// Tracks map viewport changes and handles flyTo commands.
function MapController({ onBoundsChange, onZoomChange, flyTarget, onFlyDone }) {
  const map = useMap();

  // Set initial bounds/zoom once the map is ready
  useEffect(() => {
    const b = map.getBounds();
    onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    onZoomChange(map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Fly to target when requested
  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], flyTarget.zoom || 10, { duration: 0.8 });
      onFlyDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTarget, map]);

  useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    },
    zoomend: () => {
      onZoomChange(map.getZoom());
      const b = map.getBounds();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    },
  });

  return null;
}

export default function MapSearch() {
  const { lang } = useCountry();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const en = lang === "en";

  const [properties, setProperties] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(6);
  const [flyTarget, setFlyTarget] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [showListMobile, setShowListMobile] = useState(false);

  // Fetch all approved, active properties
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.Property.filter(
          { approval_status: "APPROVED", status: "Activ", country: "RO" },
          "-views_count",
          500
        );
        if (!cancelled) setProperties(all);
      } catch (e) {
        if (!cancelled) setProperties([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const geoProps = useMemo(
    () => (properties || []).filter((p) => p.latitude && p.longitude),
    [properties]
  );

  // Dynamic clustering based on zoom level
  const clusters = useMemo(() => {
    if (!geoProps.length) return [];
    if (zoom < 8) {
      // National: group by county
      const byCounty = {};
      geoProps.forEach((p) => {
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
      // City level: group by city
      const byCity = {};
      geoProps.forEach((p) => {
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
    // Street level: individual properties
    return geoProps.map((p) => ({
      ...p,
      lat: p.latitude,
      lng: p.longitude,
      count: 1,
      type: "property",
    }));
  }, [geoProps, zoom]);

  // Properties visible in the current map bounds (right pane)
  const visibleProperties = useMemo(() => {
    if (!bounds) return geoProps;
    return geoProps.filter(
      (p) =>
        p.latitude >= bounds.south &&
        p.latitude <= bounds.north &&
        p.longitude >= bounds.west &&
        p.longitude <= bounds.east
    );
  }, [geoProps, bounds]);

  const handleClusterClick = useCallback(
    (cluster) => {
      if (cluster.type === "county") {
        setFlyTarget({ lat: cluster.lat, lng: cluster.lng, zoom: 9 });
      } else if (cluster.type === "city") {
        setFlyTarget({ lat: cluster.lat, lng: cluster.lng, zoom: 12 });
      } else if (cluster.type === "property") {
        navigate(`/property/${cluster.id}`);
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

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-3.5rem)]">
      {/* MAP PANE */}
      <div className="relative h-[50%] md:h-full md:flex-1">
        <MapContainer
          center={ROMANIA_CENTER}
          zoom={6}
          minZoom={6}
          maxZoom={18}
          maxBounds={ROMANIA_MAX_BOUNDS}
          maxBoundsViscosity={0.8}
          scrollWheelZoom
          className="h-full w-full"
          style={{ background: "#d4e8f5" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />
          {clusters.map((c, i) => {
            const key = `${c.type}-${c.county || c.city || c.id}-${i}`;
            const isActive = hoveredKey === key;
            return (
              <Marker
                key={key}
                position={[c.lat, c.lng]}
                icon={c.type === "property" ? propertyIcon() : clusterIcon(c.count, isActive)}
                eventHandlers={{
                  click: () => handleClusterClick(c),
                  mouseover: () => setHoveredKey(key),
                  mouseout: () => setHoveredKey(null),
                }}
              >
                <Tooltip>
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
          />
        </MapContainer>

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute left-3 top-3 z-[1000] flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-navy shadow-soft backdrop-blur-md hover:bg-white dark:bg-card/90 dark:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {en ? "Back" : "Înapoi"}
        </button>

        {/* Save search */}
        <button
          onClick={saveSearch}
          className="absolute right-3 top-3 z-[1000] flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow-soft hover:bg-rose-600"
        >
          <Heart className="h-4 w-4" /> {en ? "Save search" : "Salvează căutarea"}
        </button>

        {/* Mobile: show list toggle */}
        <button
          onClick={() => setShowListMobile(true)}
          className="absolute bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy-deep px-4 py-2 text-sm font-semibold text-white shadow-glow md:hidden"
        >
          <MapPin className="h-4 w-4" /> {visibleProperties.length} {en ? "properties" : "proprietăți"}
        </button>
      </div>

      {/* LIST PANE */}
      <div
        className={`${
          showListMobile ? "absolute inset-0 z-[1100] block" : "hidden"
        } h-full md:relative md:z-auto md:block md:w-[400px] md:shrink-0 overflow-y-auto border-t md:border-t-0 md:border-l border-border bg-background`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 p-3 backdrop-blur">
          <div>
            <p className="text-sm font-bold text-navy dark:text-foreground">
              {visibleProperties.length} {en ? "properties in this area" : "proprietăți în zonă"}
            </p>
            <p className="text-xs text-muted-foreground">
              {en ? "Move the map to update results" : "Mută harta pentru a actualiza"}
            </p>
          </div>
          <button
            onClick={() => setShowListMobile(false)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Property list */}
        <div className="space-y-3 p-3">
          {properties === null ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
          ) : visibleProperties.length === 0 ? (
            <div className="py-20 text-center">
              <MapPin className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold text-navy dark:text-foreground">
                {en ? "No properties here" : "Nicio proprietate aici"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {en ? "Pan or zoom out to see more." : "Mută sau micșorează harta."}
              </p>
            </div>
          ) : (
            visibleProperties.map((p) => <PropertyCard key={p.id} property={p} />)
          )}
        </div>
      </div>
    </div>
  );
}