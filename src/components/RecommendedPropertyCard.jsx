import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, BedDouble, Maximize, ShieldCheck, Eye } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Image } from "@/components/ui/image";
import { getPlanMeta } from "@/lib/plans";

// Card compact pentru rândurile „Anunțuri recomandate" de pe homepage și pentru
// pagina de rezultate ordonate pe plan — doar informația esențială (preț,
// locație, specs), plus insigna planului postatorului în colțul din
// dreapta-sus al fotografiei. Deliberat mai mic decât PropertyCard (fără
// footer cu agent/butoane de contact), ca să încapă mai multe anunțuri
// într-un rând înainte de „Vezi mai multe".
export default function RecommendedPropertyCard({ property, planId }) {
  const { currency, formatPrice, t } = useCountry();
  const navigate = useNavigate();
  const p = property;
  const images = p.images?.length ? p.images : [];
  const meta = getPlanMeta(planId);

  const trustScore = typeof p.trust_score === "number" ? p.trust_score : 0;
  const isVerified = trustScore >= 40;

  const eur = formatPrice(p.price_monthly, p.currency, "EUR");
  const ron = formatPrice(p.price_monthly, p.currency, "RON");
  const primary = currency === "EUR" ? eur : ron;
  const secondary = currency === "EUR" ? ron : eur;

  return (
    <div
      onClick={() => navigate(`/property/${p.id}`)}
      className={`group flex w-[168px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow dark:bg-card sm:w-[196px] ${meta?.accent === "gold" ? "border-gold/45" : "border-border"}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {images.length ? (
          <Image src={images[0]} alt={p.title} fittingType="fill" className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy/10 to-emerald/20" />
        )}

        {isVerified && (
          <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-emerald px-1.5 py-0.5 text-[9px] font-bold text-white shadow-soft">
            <ShieldCheck className="h-2.5 w-2.5" /> {t("pc_verified")}
          </span>
        )}

        {meta?.badgeImg && (
          <img
            src={meta.badgeImg}
            alt={meta.name}
            title={meta.name}
            className="absolute right-1.5 top-1.5 h-7 w-7 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
          />
        )}

        <span className="absolute bottom-2 left-2 flex items-center gap-0.5 rounded-full bg-navy-deep/60 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
          <Eye className="h-2.5 w-2.5" /> {p.views_count || 0}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-2.5">
        <p className="font-heading text-base font-bold leading-none text-navy dark:text-foreground">
          {primary}
          <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
            {p.transaction_type === "SALE" ? "" : t("pc_permonth")}
          </span>
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">≈ {secondary}</p>

        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5 shrink-0 text-emerald" />
          <span className="truncate">
            {p.zone || p.city ? `${p.zone ? p.zone + ", " : ""}${p.city || ""}` : "—"}
          </span>
        </p>

        <div className="mt-1.5 flex items-center gap-2.5 border-t border-border/60 pt-1.5 text-[10.5px] text-foreground/70">
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
      </div>
    </div>
  );
}
