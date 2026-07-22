import React from "react";
import { Link } from "react-router-dom";
import { Play, MapPin, Maximize, BedDouble, ShieldCheck, Sparkles, PawPrint, Car, TrainFront, Volume2, Wifi, ArrowLeftRight, BadgePercent } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Image } from "@/components/ui/image";

// VerifiCasa verification badges + Scor Confort chips.
export default function PropertyCard({ property }) {
  const { currency, formatPrice, t } = useCountry();
  const p = property;
  const cover = p.images?.[0];

  const isField = p.verification_level === "field_certified";
  const isVideo = p.verification_level === "video_ai" || !!p.ai_video_url;

  const eur = formatPrice(p.price_monthly, p.currency, "EUR");
  const ron = formatPrice(p.price_monthly, p.currency, "RON");
  const primary = currency === "EUR" ? eur : ron;
  const secondary = currency === "EUR" ? ron : eur;

  const comfort = [];
  if (p.metro_distance_min != null) comfort.push({ icon: TrainFront, label: `${p.metro_distance_min} min metrou` });
  if (p.noise_db != null) comfort.push({ icon: Volume2, label: `${p.noise_db} dB` });
  if (p.internet_speed_mbps != null) comfort.push({ icon: Wifi, label: `${p.internet_speed_mbps} Mbps` });

  return (
    <Link
      to={`/property/${p.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
    >
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

        {/* "100% Verificat" ribbon */}
        {isField && (
          <div className="absolute left-0 top-3 flex items-center gap-1 rounded-r-full bg-gold px-3 py-1 text-[11px] font-bold text-navy shadow-gold">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% Verificat
          </div>
        )}

        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {isField && (
            <span className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-navy backdrop-blur">
              <ShieldCheck className="h-3 w-3" /> VerifiCasa Certified
            </span>
          )}
          {isVideo && !isField && (
            <span className="flex items-center gap-1 rounded-full bg-emerald px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
              <Sparkles className="h-3 w-3" /> Verificat Video & AI
            </span>
          )}
          {p.pet_friendly && (
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-navy backdrop-blur">
              <PawPrint className="h-3 w-3" /> Pet
            </span>
          )}
          {p.is_swap_available && (
            <span className="flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-[11px] font-bold text-emerald backdrop-blur">
              <ArrowLeftRight className="h-3 w-3" /> Schimb
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold leading-snug text-navy line-clamp-1">{p.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{p.zone}, {p.city}</span>
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-emerald-soft px-2 py-1 text-[11px] font-bold text-emerald">{p.property_type}</span>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-foreground/70">
          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {p.rooms} {t("sep_rooms")}</span>
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {p.surface_sqm} mp</span>
          {p.floor && <span className="flex items-center gap-1 text-foreground/60">Etaj {p.floor}</span>}
          {p.parking && <span className="flex items-center gap-1 text-emerald"><Car className="h-3.5 w-3.5" /></span>}
        </div>

        {/* Scor Confort chips */}
        {comfort.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {comfort.map((c, i) => (
              <span key={i} className="flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-foreground/65">
                <c.icon className="h-3 w-3" /> {c.label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-end justify-between border-t border-border/60 pt-3">
          <div>
            <p className="font-heading text-lg font-bold text-navy">{primary}<span className="text-xs font-medium text-muted-foreground">/lună</span></p>
            <p className="text-[11px] text-muted-foreground">≈ {secondary}</p>
          </div>
          {p.deposit_option === "verificasa_guarantee" ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-soft px-2 py-1 text-[10px] font-bold text-emerald">
              <BadgePercent className="h-3 w-3" /> Garanție 0
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald">
              {p.commission_free ? "Fără comision" : "Comision corect"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}