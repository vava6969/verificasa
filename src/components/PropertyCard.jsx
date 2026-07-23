import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, MapPin, Maximize, BedDouble, ShieldCheck, PawPrint, BadgePercent,
  TrendingDown, TrendingUp, Heart, Eye, Building2, Phone, MessageCircle,
  ChevronLeft, ChevronRight, Calendar,
} from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";

// Premium listing card inspired by Storia/OLX.
export default function PropertyCard({ property }) {
  const { currency, formatPrice, t } = useCountry();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const p = property;
  const images = p.images?.length ? p.images : [];
  const [idx, setIdx] = useState(0);
  const [fav, setFav] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vc_favs") || "{}")[p.id] || false; } catch { return false; }
  });

  const isVerified = p.owner_verified || p.verification_level === "field_certified" || p.verification_level === "video_ai" || !!p.ai_video_url;
  const isVideo = p.verification_level === "video_ai" || !!p.ai_video_url;
  const seller = p.seller_role || (p.owner_verified ? "Proprietar" : "Agent");
  const isProprietar = seller === "Proprietar";

  const eur = formatPrice(p.price_monthly, p.currency, "EUR");
  const ron = formatPrice(p.price_monthly, p.currency, "RON");
  const primary = currency === "EUR" ? eur : ron;
  const secondary = currency === "EUR" ? ron : eur;

  const FAIRNESS = {
    sub_piata: { label: "Sub preț", cls: "bg-emerald-soft text-emerald", icon: TrendingDown },
    corect: { label: "Preț corect", cls: "bg-gold-soft text-gold-deep", icon: BadgePercent },
    peste_medie: { label: "Peste medie", cls: "bg-destructive/10 text-destructive", icon: TrendingUp },
  };
  const fairness = p.price_fairness ? FAIRNESS[p.price_fairness] : null;

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

  const go = (e, dir) => {
    e.preventDefault(); e.stopPropagation();
    setIdx((i) => (i + dir + images.length) % Math.max(images.length, 1));
  };

  const toDetail = () => navigate(`/property/${p.id}`);

  const contact = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { navigate("/login"); return; }
    navigate(`/property/${p.id}`);
  };

  const waPhone = (p.whatsapp_phone || p.phone || "").replace(/\D/g, "");
  const callPhone = (p.phone || "").replace(/\D/g, "");

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
      {/* Cover with slider */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {images.length ? (
          <Image src={images[idx]} alt={p.title} fittingType="fill" className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy/10 to-emerald/20" />
        )}

        {isVideo && (
          <button onClick={contact} className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur">
              <Play className="ml-0.5 h-5 w-5 fill-navy text-navy" />
            </div>
          </button>
        )}

        {/* Slider controls */}
        {images.length > 1 && (
          <>
            <button onClick={(e) => go(e, -1)} className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy shadow-soft backdrop-blur transition hover:bg-white" aria-label="Anterior">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={(e) => go(e, 1)} className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy shadow-soft backdrop-blur transition hover:bg-white" aria-label="Următor">
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.slice(0, 6).map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/60"}`} />
              ))}
            </div>
          </>
        )}

        {/* Badges top-left */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isVerified && (
            <span className="flex items-center gap-1 rounded-full bg-emerald px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5" /> Verificat
            </span>
          )}
          {p.commission_free && (
            <span className="flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
              <BadgePercent className="h-3 w-3" /> Comision 0%
            </span>
          )}
          {p.pet_friendly && (
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-navy backdrop-blur">
              <PawPrint className="h-3 w-3" /> Pet Friendly
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          type="button"
          onClick={toggleFav}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-soft transition ${
            fav ? "bg-rose-500 text-white" : "bg-white/90 text-foreground/60 backdrop-blur hover:text-rose-500"
          }`}
          aria-label="Favorit"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-white" : ""}`} />
        </button>

        {/* Seller role badge + date */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-soft ${
            isProprietar ? "bg-emerald" : "bg-blue-600"
          }`}>
            <Building2 className="h-3 w-3" /> {seller}
          </span>
        </div>
        {p.created_date && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-foreground/70 backdrop-blur">
            <Calendar className="h-3 w-3" /> {new Date(p.created_date).toLocaleDateString("ro-RO")}
          </span>
        )}
      </div>

      {/* Body */}
      <div onClick={toDetail} className="flex flex-1 cursor-pointer flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-bold leading-snug text-navy line-clamp-1">{p.title}</h3>
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{p.zone}, {p.city}</span>
        </p>

        {/* Specs */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/70">
          {p.rooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-emerald" /> {p.rooms} {t("sep_rooms")}</span>}
          {p.surface_sqm != null && <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5 text-emerald" /> {p.surface_sqm} mp</span>}
          {p.floor && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-emerald" /> Etaj {p.floor}</span>}
          {p.building_year && <span className="flex items-center gap-1 text-foreground/60"><Calendar className="h-3.5 w-3.5" /> {p.building_year}</span>}
        </div>

        {/* Price */}
        <div className="mt-3 flex items-end justify-between border-t border-border/60 pt-3">
          <div>
            <p className="font-heading text-xl font-bold text-navy">{primary}<span className="text-xs font-medium text-muted-foreground">/{p.transaction_type === "SALE" ? "" : "lună"}</span></p>
            <p className="text-[11px] text-muted-foreground">≈ {secondary}</p>
            {fairness && (
              <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${fairness.cls}`}>
                <fairness.icon className="h-3 w-3" /> {fairness.label}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Eye className="h-3 w-3" /> {p.views_count || 0}</span>
        </div>
      </div>

      {/* Contact buttons */}
      <div className="grid grid-cols-3 gap-1.5 px-4 pb-4">
        {waPhone && (
          <a
            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Bună, sunt interesat de anunțul "${p.title}" pe VerifiCasa.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 rounded-xl bg-emerald px-2 py-2 text-xs font-bold text-white transition hover:opacity-90"
          >
            WhatsApp
          </a>
        )}
        {callPhone && (
          <a href={`tel:${callPhone}`} className="flex items-center justify-center gap-1 rounded-xl border border-emerald/40 px-2 py-2 text-xs font-bold text-emerald transition hover:bg-emerald-soft">
            <Phone className="h-3.5 w-3.5" /> Sună
          </a>
        )}
        <button onClick={contact} className="flex items-center justify-center gap-1 rounded-xl bg-navy px-2 py-2 text-xs font-bold text-emerald transition hover:opacity-90">
          <MessageCircle className="h-3.5 w-3.5" /> Mesaj
        </button>
      </div>
    </div>
  );
}