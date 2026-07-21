import React from "react";
import { Link } from "react-router-dom";
import { Play, MapPin, Maximize, BedDouble, BadgeCheck, Sparkles, PawPrint, Car, Tag } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Image } from "@/components/ui/image";

export default function PropertyCard({ property }) {
  const { formatPrice, country } = useCountry();
  const p = property;
  const cover = p.images?.[0];

  const badges = [];
  if (p.owner_verified) badges.push({ icon: BadgeCheck, label: "Verificat", cls: "bg-mint text-navy" });
  if (p.ai_tour_verified) badges.push({ icon: Sparkles, label: "Tur AI", cls: "bg-navy text-mint" });
  if (p.pet_friendly) badges.push({ icon: PawPrint, label: "Pet Friendly", cls: "bg-amber-100 text-amber-800" });

  return (
    <Link
      to={`/property/${p.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={p.title}
            fittingType="fill"
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy/10 to-mint/20" />
        )}

        {p.ai_video_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-navy text-navy" />
            </div>
            <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-[11px] font-semibold text-mint backdrop-blur">
              <Sparkles className="h-3 w-3" /> AI Walkthrough
            </span>
          </div>
        )}

        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {badges.map((b, i) => (
            <span key={i} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${b.cls} backdrop-blur`}>
              <b.icon className="h-3 w-3" /> {b.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-heading text-base font-bold leading-snug text-navy line-clamp-1">{p.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {p.zone}, {p.city}
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-mint-soft px-2 py-1 text-[11px] font-bold text-navy">{p.property_type}</span>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-foreground/70">
          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {p.rooms} cam.</span>
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {p.surface_sqm} mp</span>
          {p.parking && <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" /></span>}
          {country === "UK" && p.pet_friendly && <span className="flex items-center gap-1 text-mint"><PawPrint className="h-3.5 w-3.5" /></span>}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border/60 pt-3">
          <div>
            <p className="font-heading text-lg font-bold text-navy">{formatPrice(p.price_monthly, p.currency)}</p>
            <p className="text-[11px] text-muted-foreground">/lună</p>
          </div>
          {country === "UK" ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-mint"><Tag className="h-3 w-3" /> 0 Fees</span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-mint"><Tag className="h-3 w-3" /> Comision redus</span>
          )}
        </div>
      </div>
    </Link>
  );
}