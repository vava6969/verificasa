import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, BedDouble, Maximize, ShieldCheck, Box, Eye, RotateCw } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Image } from "@/components/ui/image";

// Compact card for the Similar Properties carousel — only essential info,
// smaller text, no contact buttons or phone display.
export default function SimilarPropertyCard({ property, hot = false }) {
  const { currency, formatPrice, t } = useCountry();
  const navigate = useNavigate();
  const p = property;
  const images = p.images?.length ? p.images : [];

  const isVerified = p.owner_verified || p.verification_level === "field_certified" || p.ai_tour_verified;

  const eur = formatPrice(p.price_monthly, p.currency, "EUR");
  const ron = formatPrice(p.price_monthly, p.currency, "RON");
  const primary = currency === "EUR" ? eur : ron;
  const secondary = currency === "EUR" ? ron : eur;

  return (
    <div
      onClick={() => navigate(`/property/${p.id}`)}
      className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow dark:bg-card ${hot ? "premium-glow border-gold/50" : "border-border"}`}
    >
      {/* Cover */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {images.length ? (
          <Image src={images[0]} alt={p.title} fittingType="fill" className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy/10 to-emerald/20" />
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isVerified && (
            <span className="flex items-center gap-0.5 rounded-full bg-emerald px-2 py-0.5 text-[10px] font-bold text-white shadow-soft">
              <ShieldCheck className="h-3 w-3" /> {t("pc_verified")}
            </span>
          )}
          {p.tour_3d_url && (
            <span className="flex items-center gap-0.5 rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold text-mint shadow-soft ring-1 ring-mint/40">
              <Box className="h-3 w-3" /> {t("tab_3d")}
            </span>
          )}
          {p.has_walkthrough_tour && (
            <span className="flex items-center gap-0.5 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-soft">
              <RotateCw className="h-3 w-3" /> {t("tab_tour360")}
            </span>
          )}
        </div>

        {hot && (
          <span className="premium-badge absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
            {t("pc_hot")}
          </span>
        )}

        {/* Views */}
        <span className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-navy/75 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
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
              <BedDouble className="h-3 w-3 text-emerald" /> {p.rooms}
            </span>
          )}
          {p.surface_sqm != null && (
            <span className="flex items-center gap-0.5">
              <Maximize className="h-3 w-3 text-emerald" /> {p.surface_sqm} mp
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