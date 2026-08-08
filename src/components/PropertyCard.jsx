import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Maximize, BedDouble, ShieldCheck, PawPrint, BadgePercent,
  Eye, Building2, Phone, MessageCircle,
  Calendar, PhoneOff, Clock,
  Box, Crown, Car, Sofa,
} from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { startConversation } from "@/lib/conversations";
import { Image } from "@/components/ui/image";
import { formatDistanceToNowStrict } from "date-fns";
import { ro, enGB } from "date-fns/locale";

// Card compact de proprietate — badge-uri ierarhizate, chips icon-only, footer cu agent.
export default function PropertyCard({ property, hot = false }) {
  const { currency, formatPrice, t, lang } = useCountry();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const p = property;
  const images = p.images?.length ? p.images : [];
  const [idx, setIdx] = useState(0);
  const [showExtra, setShowExtra] = useState(false);
  const touchStartX = useRef(null);

  const isVerified = p.owner_verified || p.verification_level === "field_certified" || p.ai_tour_verified;
  const seller = p.seller_role || (p.owner_verified ? "Proprietar" : "Agent");
  const isProprietar = seller === "Proprietar";
  const sellerLabel = isProprietar ? t("pc_seller_landlord") : t("pc_seller_agent");

  const eur = formatPrice(p.price_monthly, p.currency, "EUR");
  const ron = formatPrice(p.price_monthly, p.currency, "RON");
  const primary = currency === "EUR" ? eur : ron;
  const secondary = currency === "EUR" ? ron : eur;

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
      navigate(`/messages/${conv.id}?prefill=1`);
    } catch (err) {
      toast({ title: t("pc_err_msg"), variant: "destructive" });
    }
  };

  const callPhone = (p.phone || "").replace(/\D/g, "");
  const waPhone = (p.whatsapp_phone || p.phone || "").replace(/\D/g, "");
  const hasPhone = !!callPhone && callPhone.length >= 6;
  const dateLocale = lang === "en" ? "en-GB" : "ro-RO";
  const postedAgo = p.created_date
    ? formatDistanceToNowStrict(new Date(p.created_date), { addSuffix: true, locale: lang === "en" ? enGB : ro })
    : "";

  // Chips secundare — icon-only, max 3 vizibile + popover pentru restul
  const chips = [];
  if (p.tour_3d_url) chips.push({ icon: Box, label: t("tab_3d"), cls: "bg-navy/10 text-navy dark:bg-white/10 dark:text-foreground" });
  if (p.commission_free) chips.push({ icon: BadgePercent, label: t("pc_com0"), cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" });
  if (p.pet_friendly) chips.push({ icon: PawPrint, label: t("pc_pet_btn"), cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" });
  if (p.furnished) chips.push({ icon: Sofa, label: t("badge_furnished"), cls: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" });
  if (p.parking) chips.push({ icon: Car, label: t("badge_parking"), cls: "bg-emerald-soft text-emerald" });
  const visibleChips = chips.slice(0, 3);
  const extraChips = chips.slice(3);

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow dark:bg-card ${hot ? "premium-glow border-gold/50" : "border-border"}`}>
      {/* Cover */}
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
        onClick={toDetail}
      >
        {images.length ? (
          <Image src={images[idx]} alt={p.title} fittingType="fill" className="h-full w-full cursor-pointer transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy/10 to-emerald/20" />
        )}

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.slice(0, 6).map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/60"}`} />
            ))}
          </div>
        )}

        {/* Badge Verificat — singurul badge permanent pe imagine */}
        {isVerified && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
            <ShieldCheck className="h-3.5 w-3.5" /> {t("pc_verified")}
          </span>
        )}

        {/* Badge Recomandat — panglică discretă dreapta-sus */}
        {hot && (
          <span className="premium-badge absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
            <Crown className="h-3 w-3" /> {t("pc_hot")}
          </span>
        )}

        {/* Data postării — discret, dreapta-jos */}
        {p.created_date && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-navy-deep/70 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur">
            <Calendar className="h-2.5 w-2.5" /> {new Date(p.created_date).toLocaleDateString(dateLocale, { day: "2-digit", month: "2-digit" })}
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

        {/* Specs — rând unic compact */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-foreground/70">
          {p.rooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-emerald" /> {p.rooms} {t("sep_rooms")}</span>}
          {p.surface_sqm != null && <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5 text-emerald" /> {p.surface_sqm} mp</span>}
          {p.floor && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-emerald" /> {t("pc_floor")} {p.floor}</span>}
        </div>

        {/* Chips secundare — icon-only, max 3 + popover */}
        {visibleChips.length > 0 && (
          <div className="relative mt-2 flex flex-wrap items-center gap-1.5">
            {visibleChips.map((c, i) => {
              const Ico = c.icon;
              return (
                <span key={i} title={c.label} className={`flex items-center justify-center rounded-full px-2 py-1 text-[11px] font-semibold ${c.cls}`}>
                  <Ico className="h-3 w-3" />
                </span>
              );
            })}
            {extraChips.length > 0 && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowExtra((s) => !s); }}
                className="flex items-center justify-center rounded-full bg-secondary px-2 py-1 text-[11px] font-bold text-muted-foreground hover:bg-secondary/80"
              >
                +{extraChips.length}
              </button>
            )}
            {showExtra && extraChips.length > 0 && (
              <div className="absolute left-0 top-7 z-10 flex flex-wrap gap-1.5 rounded-xl border border-border bg-white p-2 shadow-glow dark:bg-card">
                {extraChips.map((c, i) => {
                  const Ico = c.icon;
                  return (
                    <span key={i} className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${c.cls}`}>
                      <Ico className="h-3 w-3" /> {c.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex items-end justify-between border-t border-border/60 pt-2.5">
          <div>
            <p className="font-heading text-xl font-bold text-navy dark:text-foreground">{primary}<span className="text-xs font-medium text-muted-foreground">{p.transaction_type === "SALE" ? "" : t("pc_permonth")}</span></p>
            <p className="text-[11px] text-muted-foreground">≈ {secondary}</p>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Eye className="h-3 w-3" /> {p.views_count || 0}</span>
        </div>
      </div>

      {/* Footer — agent + icon buttons */}
      <div className="flex items-center gap-2 border-t border-border/60 px-3.5 py-2.5">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${isProprietar ? "bg-emerald" : "bg-blue-600"}`}>
          {(p.posted_by_name || p.owner_name || "V").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-navy dark:text-foreground">{p.posted_by_name || p.owner_name || "VerifiCasa"}</p>
          <p className="truncate text-[10px] text-muted-foreground">{sellerLabel}{postedAgo ? ` · ${postedAgo}` : ""}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {hasPhone ? (
            <a href={`tel:${callPhone}`} onClick={(e) => e.stopPropagation()} title={t("pc_call")} className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald/30 text-emerald transition hover:bg-emerald-soft">
              <Phone className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span title={t("pc_no_phone")} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground/40">
              <PhoneOff className="h-3.5 w-3.5" />
            </span>
          )}
          <button onClick={handleMessage} title={t("pc_message")} className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-white transition hover:bg-emerald/90">
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}