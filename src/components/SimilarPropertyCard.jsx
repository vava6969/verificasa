import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, BedDouble, Maximize, Eye } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Image } from "@/components/ui/image";

// Compact card for the Similar Properties carousel — only essential info,
// smaller text, no contact buttons or phone display.
export default function SimilarPropertyCard({ property, hot = false }) {
  const { currency, formatPrice, t } = useCountry();
  const navigate = useNavigate();
  const p = property;
  const images = p.images?.length ? p.images : [];

  const trustScore = typeof p.trust_score === "number" ? p.trust_score : 0;
  const isHighTrust = trustScore >= 75;
  const isVerified = trustScore >= 40;

  const eur = formatPrice(p.price_monthly, p.currency, "EUR");
  const ron = formatPrice(p.price_monthly, p.currency, "RON");
  const primary = currency === "EUR" ? eur : ron;
  const secondary = currency === "EUR" ? ron : eur;

  return (
    <div
      onClick={() => navigate(`/property/${p.id}`)}
      className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border bg-white shadow-soft transition-colors dark:bg-card ${hot ? "border-gold/60" : "border-border hover:border-foreground/25"}`}
    >
      {/* Cover */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {images.length ? (
          <Image src={images[0]} alt={p.title} fittingType="fill" className="h-full w-full" />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {isHighTrust ? (
            <span className="stamp-line rounded-sm bg-navy/90 px-1.5 py-0.5 text-[9px] text-white">
              {t("pc_trust_high")}
            </span>
          ) : isVerified ? (
            <span className="stamp-line rounded-sm bg-emerald px-1.5 py-0.5 text-[9px] text-white">
              {t("pc_verified")}
            </span>
          ) : null}
          {p.tour_3d_url && (
            <span className="stamp-line rounded-sm bg-navy/90 px-1.5 py-0.5 text-[9px] text-white">
              {t("tab_3d")}
            </span>
          )}
        </div>

        {hot && (
          <span className="premium-badge stamp-line absolute right-2 top-2 rounded-sm px-1.5 py-0.5 text-[9px]">
            {t("pc_hot")}
          </span>
        )}

        {/* Views */}
        <span className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-sm bg-navy-deep/70 px-1.5 py-0.5 font-mono text-[9px] text-white">
          <Eye className="h-2.5 w-2.5" /> {p.views_count || 0}
        </span>
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col p-2.5">
        <h3 className="font-heading text-sm font-bold leading-tight text-navy line-clamp-1 dark:text-foreground">
          {p.title || <span className="italic text-muted-foreground/70">{t("info_missing")}</span>}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">
            {p.zone || p.city ? `${p.zone ? p.zone + ", " : ""}${p.city || ""}` : "—"}
          </span>
        </p>

        {/* Specs — compact inline */}
        <div className="mt-1.5 flex items-center gap-2.5 text-[11px] text-foreground/70">
          {p.rooms != null && (
            <span className="flex items-center gap-0.5">
              <BedDouble className="h-3 w-3 text-muted-foreground" /> {p.rooms}
            </span>
          )}
          {p.surface_sqm != null && (
            <span className="flex items-center gap-0.5">
              <Maximize className="h-3 w-3 text-muted-foreground" /> {p.surface_sqm} mp
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto border-t border-border/60 pt-2">
          <p className="font-heading text-base font-bold leading-none text-navy dark:text-foreground">
            {primary}
            <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
              {p.transaction_type === "SALE" ? "" : t("pc_permonth")}
            </span>
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">≈ {secondary}</p>
        </div>
      </div>
    </div>
  );
}