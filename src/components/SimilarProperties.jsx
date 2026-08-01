import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import PropertyCard from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";

// 3 proprietăți similare, din același oraș, recomandate după vizualizări.
export default function SimilarProperties({ property }) {
  const { t } = useCountry();
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = await base44.entities.Property.list("-views_count", 100);
        if (!alive) return;
        const same = all.filter(
          (p) => p.city === property.city && p.id !== property.id && (p.approval_status || "APPROVED") === "APPROVED"
        );
        // Dacă orașul are mai puțin de 3, completăm cu apropiate (alte orașe, top vizualizări).
        if (same.length < 3) {
          const extra = all.filter(
            (p) => p.id !== property.id && (p.approval_status || "APPROVED") === "APPROVED" && p.city !== property.city
          );
          setItems([...same, ...extra].slice(0, 3));
        } else {
          setItems(same.slice(0, 3));
        }
      } catch {
        if (alive) setItems([]);
      }
    })();
    return () => { alive = false; };
  }, [property]);

  if (!items) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-gold" />
        <div>
          <h3 className="font-heading text-lg font-bold text-navy dark:text-foreground">{t("similar_h")}</h3>
          <p className="text-xs text-muted-foreground">{t("similar_sub", { city: property.city })}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => <PropertyCard key={p.id} property={p} />)}
      </div>
      {items.length > 0 && (
        <div className="mt-6 text-center">
          <Link to={`/search?city=${encodeURIComponent(property.city || "")}`} className="text-sm font-semibold text-emerald hover:underline">
            {t("view_all")} →
          </Link>
        </div>
      )}
    </div>
  );
}