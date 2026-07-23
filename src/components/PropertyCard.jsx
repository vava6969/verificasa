import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Play, MapPin, Maximize, BedDouble, ShieldCheck, PawPrint, Car,
  ArrowLeftRight, BadgePercent, TrendingDown, TrendingUp, Heart, Eye, Building2,
  Flame,
} from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Image } from "@/components/ui/image";

// Premium, clean property preview card: verification badges over the cover,
// facility chips, quick specs, big bold price, favorite heart, "Vezi Detalii".
export default function PropertyCard({ property }) {
  const { currency, formatPrice, t } = useCountry();
  const p = property;
  const cover = p.images?.[0];

  const isField = p.verification_level === "field_certified";
  const isVideo = p.verification_level === "video_ai" || !!p.ai_video_url;
  const isVerified = p.owner_verified || isField || isVideo;

  const eur = formatPrice(p.price_monthly, p.currency, "EUR");
  const ron = formatPrice(p.price_monthly, p.currency, "RON");
  const primary = currency === "EUR" ? eur : ron;
  const secondary = currency === "EUR" ? ron : eur;

  const FAIRNESS = {
    sub_piata: { label: "Sub prețul pieței", cls: "bg-emerald-soft text-emerald", icon: TrendingDown },
    corect: { label: "Preț corect", cls: "bg-gold-soft text-gold-deep", icon: BadgePercent },
    peste_medie: { label: "Peste media pieței", cls: "bg-destructive/10 text-destructive", icon: TrendingUp },
  };
  const fairness = p.price_fairness ? FAIRNESS[p.price_fairness] : null;

  const [fav, setFav] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vc_favs") || "{}")[p.id] || false; } catch { return false; }
  });
  const toggleFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    setFav((v) => {
      const next = !v;
      try {
        const map = JSON.parse(localStorage.getItem("vc_favs") || "{}");
        if (next) map[p.id] = true; else delete map[p.id];
        localStorage.setItem("vc_favs", JSON.stringify(map));
      } catch {}
      return next;
    });
  };

  // Facility chips under the title
  const chips = [];
  if (p.furnished) chips.push({ label: "Mobilat Complet", cls: "bg-emerald-soft text-emerald", icon: BedDouble });
  if (p.pet_friendly) chips.push({ label: "Pet Friendly", cls: "bg-emerald-soft text-emerald", icon: PawPrint });
  else chips.push({ label: "Fără animale", cls: "bg-secondary text-muted-foreground", icon: PawPrint });
  if (p.parking) chips.push({ label: "Loc Parcare Incl.", cls: "bg-blue-50 text-blue-700", icon: Car });

  return (
    <Link
      to={`/property/${p.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
    >
      {/* Cover */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {cover ? (
          <Image src={cover} alt={p.title} fittingType="fill" className="h-full w-full transition-transform duration-500 group-hover:scale-[1.06]" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy/10 to-emerald/20" />
        )}

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-navy text-navy" />
            </div>
          </div>
        )}

        {/* Top-left verification badge */}
        {isVerified && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
            <ShieldCheck className="h-3.5 w-3.5" /> Verificat
          </div>
        )}

        {/* Top-right badges + favorite */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={toggleFav}
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-soft transition ${
              fav ? "bg-rose-500 text-white" : "bg-white/90 text-foreground/60 backdrop-blur hover:text-rose-500"
            }`}
            aria-label="Favorit"
          >
            <Heart className={`h-4 w-4 ${fav ? "fill-white" : ""}`} />
          </button>
          {p.commission_free && (
            <span className="flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
              <BadgePercent className="h-3 w-3" /> Comision 0%
            </span>
          )}
          {p.is_swap_available && (
            <span className="flex items-center gap-1 rounded-full bg-navy/85 px-2.5 py-1 text-[11px] font-bold text-emerald backdrop-blur">
              <ArrowLeftRight className="h-3 w-3" /> Schimb
            </span>
          )}
        </div>

        {/* Bottom-left owner/agency tag */}
        <div className="absolute bottom-3 left-3">
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-navy backdrop-blur">
            <Building2 className="h-3 w-3" /> {p.owner_verified ? "Proprietar" : "Agenție"}
          </span>
        </div>

        {/* Featured / "0% guarantee" accent */}
        {p.deposit_option === "verificasa_guarantee" && (
          <div className="absolute bottom-3 right-3">
            <span className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-navy shadow-gold">
              <Flame className="h-3 w-3" /> Garanție 0
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold leading-snug text-navy line-clamp-1">{p.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{p.zone}, {p.city}</span>
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-secondary px-2 py-1 text-[11px] font-bold text-foreground/70">{p.property_type}</span>
        </div>

        {/* Spec row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/70">
          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-emerald" /> {p.rooms} {t("sep_rooms")}</span>
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5 text-emerald" /> {p.surface_sqm} mp</span>
          <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-emerald" /> Etaj {p.floor || "P"}</span>
        </div>

        {/* Facility chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <span key={i} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.cls}`}>
              <c.icon className="h-3 w-3" /> {c.label}
            </span>
          ))}
        </div>

        {/* Price + actions */}
        <div className="mt-4 flex items-end justify-between border-t border-border/60 pt-3">
          <div>
            <p className="font-heading text-xl font-bold text-navy">{primary}<span className="text-xs font-medium text-muted-foreground">/lună</span></p>
            <p className="text-[11px] text-muted-foreground">≈ {secondary}</p>
            {fairness && (
              <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${fairness.cls}`}>
                <fairness.icon className="h-3 w-3" /> {fairness.label}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Eye className="h-3 w-3" /> {p.views_count || 0}</span>
            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald px-3 py-1.5 text-xs font-bold text-white transition group-hover:opacity-90">
              Vezi Detalii
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}