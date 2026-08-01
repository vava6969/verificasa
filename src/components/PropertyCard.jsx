import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, MapPin, Maximize, BedDouble, ShieldCheck, PawPrint, BadgePercent,
  TrendingDown, TrendingUp, Eye, Building2, Phone, MessageCircle,
  ChevronLeft, ChevronRight, Calendar, PhoneOff, Clock,
  UserCircle2, Box,
} from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { startConversation } from "@/lib/conversations";
import { Image } from "@/components/ui/image";
import { formatDistanceToNowStrict } from "date-fns";
import { ro, enGB } from "date-fns/locale";

// Premium listing card inspired by Storia/OLX.
export default function PropertyCard({ property, hot = false }) {
  const { currency, formatPrice, t, lang } = useCountry();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const p = property;
  const images = p.images?.length ? p.images : [];
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(null);

  const isVerified = p.owner_verified || p.verification_level === "field_certified" || p.ai_tour_verified;
  const isVideo = !!p.ai_tour_verified;
  const seller = p.seller_role || (p.owner_verified ? "Proprietar" : "Agent");
  const isProprietar = seller === "Proprietar";
  const sellerLabel = isProprietar ? t("pc_seller_landlord") : t("pc_seller_agent");

  const eur = formatPrice(p.price_monthly, p.currency, "EUR");
  const ron = formatPrice(p.price_monthly, p.currency, "RON");
  const primary = currency === "EUR" ? eur : ron;
  const secondary = currency === "EUR" ? ron : eur;

  const FAIRNESS = {
    sub_piata: { labelKey: "pc_price_below", cls: "bg-emerald-soft text-emerald", icon: TrendingDown },
    corect: { labelKey: "pc_price_fair", cls: "bg-gold-soft text-gold-deep", icon: BadgePercent },
    peste_medie: { labelKey: "pc_price_above", cls: "bg-destructive/10 text-destructive", icon: TrendingUp },
  };
  const fairness = p.price_fairness ? FAIRNESS[p.price_fairness] : null;

  const go = (e, dir) => {
    e.preventDefault(); e.stopPropagation();
    setIdx((i) => (i + dir + images.length) % Math.max(images.length, 1));
  };

  const toDetail = () => navigate(`/property/${p.id}`);

  const handleMessage = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { navigate("/login"); return; }
    try {
      const conv = await startConversation(user, p);
      navigate(`/messages?c=${conv.id}`);
    } catch (err) {
      toast({ title: t("pc_err_msg"), variant: "destructive" });
    }
  };

  const waPhone = (p.whatsapp_phone || p.phone || "").replace(/\D/g, "");
  const callPhone = (p.phone || "").replace(/\D/g, "");
  const hasPhone = !!callPhone && callPhone.length >= 6;
  const dateLocale = lang === "en" ? "en-GB" : "ro-RO";
  const postedAgo = p.created_date
    ? formatDistanceToNowStrict(new Date(p.created_date), { addSuffix: true, locale: lang === "en" ? enGB : ro })
    : "";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow dark:bg-card">
      {/* Cover with slider */}
      <div
        className="relative aspect-[4/3] overflow-hidden touch-pan-y"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const sx = touchStartX.current;
          if (sx == null) return;
          const dx = e.changedTouches[0].clientX - sx;
          if (Math.abs(dx) > 40 && images.length > 1) {
            setIdx((i) => (i + (dx < 0 ? 1 : -1) + images.length) % images.length);
          }
          touchStartX.current = null;
        }}
      >
        {images.length ? (
          <Image src={images[idx]} alt={p.title} fittingType="fill" className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy/10 to-emerald/20" />
        )}

        {/* Dots indicator only — swipe to navigate */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.slice(0, 6).map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/60"}`} />
            ))}
          </div>
        )}

        {/* Badges top-left */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isVerified && (
            <span className="flex items-center gap-1 rounded-full bg-emerald px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5" /> {t("pc_verified")}
            </span>
          )}
          {p.tour_3d_url && (
            <span className="flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-[11px] font-bold text-mint shadow-soft ring-1 ring-mint/40">
              <Box className="h-3.5 w-3.5" /> {t("tab_3d")}
            </span>
          )}
          {p.commission_free && (
            <span className="flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
              <BadgePercent className="h-3 w-3" /> {t("pc_com0")}
            </span>
          )}
          {p.pet_friendly && (
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-800 backdrop-blur">
              <PawPrint className="h-3 w-3" /> {t("pc_pet_btn")}
            </span>
          )}
        </div>

        {/* Badge RECOMANDAT — trending (multe vizualizări), doar pe recomandate homepage */}
        {hot && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-gold to-gold-deep px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-gold">
            ⭐ {t("pc_hot")}
          </span>
        )}


        {/* Seller role badge + date */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-soft ${isProprietar ? "bg-emerald" : "bg-blue-600"}`}>
            <Building2 className="h-3 w-3" /> {sellerLabel}
          </span>
        </div>
        {p.created_date && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-slate-700 backdrop-blur">
            <Calendar className="h-3 w-3" /> {new Date(p.created_date).toLocaleString(dateLocale, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* Body */}
      <div onClick={toDetail} className="flex min-w-0 flex-1 cursor-pointer flex-col p-3.5">
        <h3 className="font-heading text-base font-bold leading-snug text-navy line-clamp-1 dark:text-foreground">{p.title || <span className="italic text-muted-foreground/70">{t("info_missing")}</span>}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {p.zone || p.city ? `${p.zone ? p.zone + ", " : ""}${p.city || ""}` : <span className="italic text-muted-foreground/70">{t("info_missing")}</span>}
          </span>
        </p>
        {p.created_date && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <UserCircle2 className="h-3 w-3 shrink-0 text-emerald" />
            <span className="truncate font-medium text-foreground/70">{p.posted_by_name || p.owner_name || "VerifiCasa"}</span>
            <span className="text-foreground/40">·</span>
            <Clock className="h-3 w-3 shrink-0 text-emerald" />
            {lang === "en" ? `Posted ${postedAgo}` : `A fost postat ${postedAgo}`}
          </p>
        )}

        {/* Specs */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/70">
          {p.rooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-emerald" /> {p.rooms} {t("sep_rooms")}</span>}
          {p.surface_sqm != null && <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5 text-emerald" /> {p.surface_sqm} mp</span>}
          {p.floor && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-emerald" /> {t("pc_floor")} {p.floor}</span>}
          {p.building_year && <span className="flex items-center gap-1 text-foreground/60"><Calendar className="h-3.5 w-3.5" /> {p.building_year}</span>}
        </div>

        {/* Phone */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <Phone className="h-3.5 w-3.5 text-emerald" />
          {hasPhone ? (
            <a href={`tel:${callPhone}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-navy hover:text-emerald dark:text-foreground">{p.phone}</a>
          ) : (
            <span className="flex items-center gap-1 italic text-muted-foreground"><PhoneOff className="h-3 w-3" /> {t("pc_no_phone")}</span>
          )}
        </div>

        {/* Facilități verificate */}
        {(p.internet_speed_mbps || p.noise_db != null || p.light_orientation || p.water_pressure_ok) && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            {p.internet_speed_mbps && <span className="flex items-center gap-1 rounded-full bg-emerald-soft px-2 py-0.5 font-semibold text-emerald">📶 {p.internet_speed_mbps}Mbps</span>}
            {p.noise_db != null && p.noise_db <= 45 && <span className="flex items-center gap-1 rounded-full bg-emerald-soft px-2 py-0.5 font-semibold text-emerald">🔊 {t("pc_quiet")}</span>}
            {p.light_orientation && <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 font-semibold text-gold-deep dark:text-gold">☀️ {p.light_orientation}</span>}
            {p.water_pressure_ok && <span className="flex items-center gap-1 rounded-full bg-emerald-soft px-2 py-0.5 font-semibold text-emerald">💧 {t("pc_water_ok")}</span>}
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex items-end justify-between border-t border-border/60 pt-3">
          <div>
            <p className="font-heading text-xl font-bold text-navy dark:text-foreground">{primary}<span className="text-xs font-medium text-muted-foreground">{p.transaction_type === "SALE" ? "" : t("pc_permonth")}</span></p>
            <p className="text-[11px] text-muted-foreground">≈ {secondary}</p>
            {fairness && (
              <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${fairness.cls}`}>
                <fairness.icon className="h-3 w-3" /> {t(fairness.labelKey)}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Eye className="h-3 w-3" /> {p.views_count || 0}</span>
        </div>
      </div>

      {/* Contact buttons */}
      <div className="grid grid-cols-3 gap-1.5 px-3 pb-3">
        {waPhone && (
          <a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(t("pc_wa_msg", { title: p.title }))}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex min-w-0 items-center justify-center gap-1 rounded-xl bg-emerald px-1.5 py-2 text-[11px] font-bold text-white transition hover:opacity-90">
            <span className="truncate">WhatsApp</span>
          </a>
        )}
        {hasPhone ? (
          <a href={`tel:${callPhone}`} onClick={(e) => e.stopPropagation()} className="flex min-w-0 items-center justify-center gap-1 rounded-xl border border-emerald/40 px-1.5 py-2 text-[11px] font-bold text-emerald transition hover:bg-emerald-soft">
            <Phone className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{t("pc_call")}</span>
          </a>
        ) : (
          <span className="flex min-w-0 items-center justify-center gap-1 rounded-xl border border-border px-1.5 py-2 text-[11px] font-bold text-muted-foreground">
            <PhoneOff className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{t("pc_call")}</span>
          </span>
        )}
        <button onClick={handleMessage} className="flex min-w-0 items-center justify-center gap-1 rounded-xl bg-navy px-1.5 py-2 text-[11px] font-bold text-emerald transition hover:opacity-90">
          <MessageCircle className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{t("pc_message")}</span>
        </button>
      </div>
    </div>
  );
}