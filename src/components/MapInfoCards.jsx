import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { BarChart3, MapPin, Clock, TrendingUp } from "lucide-react";
import { useCountry } from "@/components/CountryContext";

// Compact info cards shown below the map on mobile to fill empty space.
export default function MapInfoCards({ properties, lang }) {
  const { formatPrice } = useCountry();
  const en = lang === "en";

  const stats = useMemo(() => {
    const geo = (properties || []).filter((p) => p.latitude && p.longitude);
    const counties = {};
    const cities = new Set();
    geo.forEach((p) => {
      const c = p.county || "Altele";
      counties[c] = (counties[c] || 0) + 1;
      if (p.city) cities.add(p.city);
    });
    const topCounties = Object.entries(counties)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    const featured = geo
      .filter((p) => p.featured || p.verification_level === "field_certified")
      .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
      .slice(0, 3);
    const featuredIds = new Set(featured.map((p) => p.id));
    const nonFeatured = geo
      .filter((p) => !featuredIds.has(p.id))
      .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
    const recent = [...featured, ...nonFeatured].slice(0, 5);
    return { total: geo.length, countyCount: Object.keys(counties).length, cityCount: cities.size, topCounties, recent, featuredIds };
  }, [properties]);

  return (
    <>
      {/* Quick stats */}
      <div className="border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald" />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald">
            {en ? "Quick stats" : "Statistici rapide"}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-emerald-soft p-2.5 text-center dark:bg-emerald/10">
            <p className="text-xl font-bold text-navy dark:text-foreground">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">{en ? "properties" : "proprietăți"}</p>
          </div>
          <div className="rounded-xl bg-gold-soft p-2.5 text-center dark:bg-gold/10">
            <p className="text-xl font-bold text-navy dark:text-foreground">{stats.countyCount}</p>
            <p className="text-[10px] text-muted-foreground">{en ? "counties" : "județe"}</p>
          </div>
          <div className="rounded-xl bg-secondary p-2.5 text-center dark:bg-white/5">
            <p className="text-xl font-bold text-navy dark:text-foreground">{stats.cityCount}</p>
            <p className="text-[10px] text-muted-foreground">{en ? "cities" : "orașe"}</p>
          </div>
        </div>
      </div>

      {/* Top counties */}
      <div className="border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald" />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald">
            {en ? "Top counties" : "Cele mai căutate județe"}
          </p>
        </div>
        <div className="mt-3 space-y-2">
          {stats.topCounties.map(([county, count], i) => (
            <div key={county} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-border text-[10px] font-bold text-foreground tnum">
                  {i + 1}
                </span>
                {county}
              </span>
              <span className="text-xs font-bold text-emerald tnum">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recently added */}
      <div className="border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald" />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald">
            {en ? "Recently added" : "Adăugate recent"}
          </p>
        </div>
        <div className="mt-3 space-y-2">
          {stats.recent.map((p) => {
            const isPromoted = stats.featuredIds.has(p.id);
            return (
              <Link
                key={p.id}
                to={`/property/${p.id}`}
                className={`flex items-center justify-between rounded-lg p-1.5 transition hover:bg-secondary dark:hover:bg-white/5 ${
                  isPromoted ? "border border-gold/40 bg-gold-soft/50 dark:bg-gold/10" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                    {isPromoted && (
                      <span className="vc-stamp vc-stamp--gold shrink-0">
                        Promovat
                      </span>
                    )}
                    <span className="truncate">{p.title}</span>
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {p.city}
                    {p.zone ? `, ${p.zone}` : ""}
                  </p>
                </div>
                <p className="ml-2 shrink-0 text-sm font-bold text-emerald">
                  {formatPrice(p.price_monthly, p.currency)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}