import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Phone, MessageCircle, PhoneOff, Heart } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { startConversation } from "@/lib/conversations";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";
import { Stamp, Frank, PhotoMark, Viewfinder } from "@/components/fisa";
import { formatDistanceToNowStrict } from "date-fns";
import { ro, enGB } from "date-fns/locale";

// Fișa scurtă a unui anunț. Coperta poartă stratul de inspecție (colțare,
// marcaje mono, codul proprietății), verdictul e o ștampilă cu bordură, iar
// faptele stau pe un rând de registru cu cifre tabulare. Fără pastile, fără
// sticlă, fără ridicare la hover — doar conturul care se închide la verde.
export default function PropertyCard({ property, hot = false }) {
  const { currency, formatPrice, t, lang } = useCountry();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const p = property;
  const images = p.images?.length ? p.images : [];
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(null);
  const en = lang === "en";

  const trustScore = typeof p.trust_score === "number" ? p.trust_score : 0;
  const isHighTrust = trustScore >= 75;
  const isVerified = trustScore >= 40;
  const boosted = p.boost_active || p.featured || hot;
  const seller = p.seller_role || (p.owner_verified ? "Proprietar" : "Agent");
  const isProprietar = seller === "Proprietar";
  const sellerLabel = isProprietar ? t("pc_seller_landlord") : t("pc_seller_agent");

  const [saved, setSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!user || !p?.id) { setSaved(false); return undefined; }
    (async () => {
      try {
        const list = await base44.entities.SavedProperty.filter({ user_id: user.id, property_id: p.id }, "-created_date", 1);
        if (!cancelled) setSaved(list.length > 0);
      } catch (e) { /* noop */ }
    })();
    return () => { cancelled = true; };
  }, [user, p?.id]);

  const toggleSave = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { navigate("/login"); return; }
    if (savePending) return;
    setSavePending(true);
    try {
      if (saved) {
        const list = await base44.entities.SavedProperty.filter({ user_id: user.id, property_id: p.id }, "-created_date", 10);
        for (const s of list) await base44.entities.SavedProperty.delete(s.id);
        setSaved(false);
        toast({ title: t("pd_unsaved") });
      } else {
        await base44.entities.SavedProperty.create({ user_id: user.id, property_id: p.id });
        setSaved(true);
        toast({ title: t("pd_saved_toast") });
      }
    } catch (err) {
      toast({ title: t("pc_err_msg"), variant: "destructive" });
    } finally {
      setSavePending(false);
    }
  };

  const eur = formatPrice(p.price_monthly, p.currency, "EUR");
  const ron = formatPrice(p.price_monthly, p.currency, "RON");
  const primary = currency === "EUR" ? eur : ron;
  const secondary = currency === "EUR" ? ron : eur;

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
  const hasPhone = !!callPhone && callPhone.length >= 6;
  const postedAgo = p.created_date
    ? formatDistanceToNowStrict(new Date(p.created_date), { addSuffix: true, locale: en ? enGB : ro })
    : "";

  // Facilitățile ca text, nu ca pastile cu iconițe — se citesc dintr-o privire.
  const features = [
    p.tour_3d_url && t("tab_3d"),
    p.commission_free && t("pc_com0"),
    p.pet_friendly && t("pc_pet_btn"),
    p.furnished && t("badge_furnished"),
    p.parking && t("badge_parking"),
  ].filter(Boolean);

  const boostUntil = p.boost_ends_date
    ? new Date(p.boost_ends_date).toLocaleDateString(en ? "en-GB" : "ro-RO", { day: "2-digit", month: "short" })
    : null;

  return (
    <article className="group relative flex flex-col overflow-hidden border border-border bg-card transition-colors hover:border-emerald">
      {/* Copertă — stratul de inspecție e desenat PE fotografie */}
      <div
        className="relative aspect-[4/3] cursor-pointer overflow-hidden touch-pan-y"
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
          <Image src={images[idx]} alt={p.title} fittingType="fill" className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <span className="text-xs text-muted-foreground">{t("info_missing")}</span>
          </div>
        )}

        <Viewfinder inset="0.5rem" stroke="rgba(255,255,255,0.7)" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />

        {/* marcaje de instrument */}
        {p.property_code && <PhotoMark className="bottom-2 left-2.5">{p.property_code}</PhotoMark>}
        {p.surface_sqm != null && <PhotoMark className="bottom-2 right-2.5">{p.surface_sqm} MP</PhotoMark>}
        {images.length > 1 && (
          <PhotoMark className="top-2 left-2.5">
            {String(idx + 1).padStart(2, "0")}/{String(images.length).padStart(2, "0")}
          </PhotoMark>
        )}

        <button
          type="button"
          onClick={toggleSave}
          aria-label={saved ? t("pd_unsaved") : t("pd_saved_toast")}
          disabled={savePending}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-sm border border-white/40 bg-black/35 text-white transition-colors hover:bg-black/55 disabled:opacity-60"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
        </button>

        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.slice(0, 6).map((_, i) => (
              <span key={i} className={`h-1 ${i === idx ? "w-4 bg-white" : "w-1 bg-white/55"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Verdicte — ștampile, nu pastile */}
      {(isVerified || boosted) && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3.5 py-2">
          {isHighTrust ? (
            <Stamp tone="verde">{t("pc_trust_high")}</Stamp>
          ) : isVerified ? (
            <Stamp tone="verde">{t("pc_verified")}</Stamp>
          ) : null}
          {boosted && <Frank until={boostUntil} />}
        </div>
      )}

      {/* Corp */}
      <div onClick={toDetail} className="flex min-w-0 flex-1 cursor-pointer flex-col p-3.5">
        <h3 className="line-clamp-1 font-heading text-lg font-semibold leading-snug text-foreground">
          {p.title || <span className="italic text-muted-foreground">{t("info_missing")}</span>}
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {p.zone || p.city ? `${p.zone ? p.zone + ", " : ""}${p.city || ""}` : t("info_missing")}
        </p>

        {/* Rând de registru: fapte cu cifre tabulare */}
        <dl className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border pt-2.5 text-sm">
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
          {p.floor && (
            <div className="flex items-baseline gap-1">
              <dt className="text-muted-foreground">{t("pc_floor")}</dt>
              <dd className="font-semibold tnum">{p.floor}</dd>
            </div>
          )}
          <div className="ml-auto flex items-baseline gap-1">
            <dt className="text-muted-foreground">{en ? "views" : "vizite"}</dt>
            <dd className="font-semibold tnum">{p.views_count || 0}</dd>
          </div>
        </dl>

        {features.length > 0 && (
          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{features.join(" · ")}</p>
        )}

        <div className="mt-3 flex items-end justify-between border-t border-border pt-2.5">
          <div>
            <p className="font-heading text-2xl font-semibold text-foreground tnum">
              {primary}
              <span className="ml-0.5 font-body text-xs font-medium text-muted-foreground">
                {p.transaction_type === "SALE" ? "" : t("pc_permonth")}
              </span>
            </p>
            <p className="text-xs text-muted-foreground tnum">≈ {secondary}</p>
          </div>
          {trustScore > 0 && (
            <span className="text-right text-xs text-muted-foreground">
              {en ? "trust" : "încredere"}<br />
              <span className="font-heading text-base font-semibold text-foreground tnum">{trustScore}</span>
              <span className="text-[10px]">/100</span>
            </span>
          )}
        </div>
      </div>

      {/* Subsol — cine a publicat + contact */}
      <div className="flex items-center gap-2.5 border-t border-border px-3.5 py-2.5">
        <Link
          to={p.created_by_id ? `/profile/${p.created_by_id}` : "#"}
          onClick={(e) => e.stopPropagation()}
          className="flex shrink-0 items-center"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-secondary text-[10px] font-bold text-foreground">
            {(p.posted_by_name || p.owner_name || "V").charAt(0).toUpperCase()}
          </span>
        </Link>
        <Link
          to={p.created_by_id ? `/profile/${p.created_by_id}` : "#"}
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 flex-1"
        >
          <p className="truncate text-xs font-semibold text-foreground hover:text-emerald">
            {p.posted_by_name || p.owner_name || "VerifiCasa"}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {sellerLabel}{postedAgo ? ` · ${postedAgo}` : ""}
          </p>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          {hasPhone ? (
            <a
              href={`tel:${callPhone}`}
              onClick={(e) => e.stopPropagation()}
              title={t("pc_call")}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-emerald hover:text-emerald"
            >
              <Phone className="h-4 w-4" />
            </a>
          ) : (
            <span title={t("pc_no_phone")} className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground/40">
              <PhoneOff className="h-4 w-4" />
            </span>
          )}
          <button
            onClick={handleMessage}
            title={t("pc_message")}
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-emerald text-primary-foreground transition-colors hover:bg-emerald/90"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
