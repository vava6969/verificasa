import React from "react";
import { useNavigate } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import { Image } from "@/components/ui/image";
import { Stamp, Frank, PhotoMark } from "@/components/fisa";

// Fișă redusă pentru carusele — aceleași reguli ca PropertyCard, doar mai
// strânsă: verdict ștampilat, fapte cu cifre tabulare, fără contact.
export default function SimilarPropertyCard({ property, hot = false }) {
  const { currency, formatPrice, t, lang } = useCountry();
  const navigate = useNavigate();
  const p = property;
  const images = p.images?.length ? p.images : [];
  const en = lang === "en";

  const trustScore = typeof p.trust_score === "number" ? p.trust_score : 0;
  const isHighTrust = trustScore >= 75;
  const isVerified = trustScore >= 40;
  const boosted = p.boost_active || p.featured || hot;

  const eur = formatPrice(p.price_monthly, p.currency, "EUR");
  const ron = formatPrice(p.price_monthly, p.currency, "RON");
  const primary = currency === "EUR" ? eur : ron;
  const secondary = currency === "EUR" ? ron : eur;

  const boostUntil = p.boost_ends_date
    ? new Date(p.boost_ends_date).toLocaleDateString(en ? "en-GB" : "ro-RO", { day: "2-digit", month: "short" })
    : null;

  return (
    <article
      onClick={() => navigate(`/property/${p.id}`)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden border border-border bg-card transition-colors hover:border-emerald"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {images.length ? (
          <Image src={images[0]} alt={p.title} fittingType="fill" className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <span className="text-xs text-muted-foreground">{t("info_missing")}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/45 to-transparent" />
        {p.property_code && <PhotoMark className="bottom-1.5 left-2">{p.property_code}</PhotoMark>}
        {p.surface_sqm != null && <PhotoMark className="bottom-1.5 right-2">{p.surface_sqm} MP</PhotoMark>}
      </div>

      {(isVerified || boosted) && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-2.5 py-1.5">
          {isHighTrust ? (
            <Stamp tone="verde">{t("pc_trust_high")}</Stamp>
          ) : isVerified ? (
            <Stamp tone="verde">{t("pc_verified")}</Stamp>
          ) : null}
          {boosted && <Frank until={boostUntil} />}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col p-2.5">
        <h3 className="line-clamp-1 font-heading text-[15px] font-semibold leading-tight text-foreground">
          {p.title || <span className="italic text-muted-foreground">{t("info_missing")}</span>}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {p.zone || p.city ? `${p.zone ? p.zone + ", " : ""}${p.city || ""}` : "—"}
        </p>

        <dl className="mt-1.5 flex flex-wrap items-baseline gap-x-3 text-xs">
          {p.rooms != null && (
            <div className="flex items-baseline gap-1">
              <dt className="text-muted-foreground">{t("sep_rooms")}</dt>
              <dd className="font-semibold tnum">{p.rooms}</dd>
            </div>
          )}
          {p.surface_sqm != null && (
            <div className="flex items-baseline gap-1">
              <dt className="text-muted-foreground">mp</dt>
              <dd className="font-semibold tnum">{p.surface_sqm}</dd>
            </div>
          )}
          <div className="ml-auto flex items-baseline gap-1">
            <dt className="text-muted-foreground">{en ? "views" : "vizite"}</dt>
            <dd className="font-semibold tnum">{p.views_count || 0}</dd>
          </div>
        </dl>

        <div className="mt-auto border-t border-border pt-2">
          <p className="font-heading text-lg font-semibold leading-none text-foreground tnum">
            {primary}
            <span className="ml-0.5 font-body text-[10px] font-medium text-muted-foreground">
              {p.transaction_type === "SALE" ? "" : t("pc_permonth")}
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground tnum">≈ {secondary}</p>
        </div>
      </div>
    </article>
  );
}
