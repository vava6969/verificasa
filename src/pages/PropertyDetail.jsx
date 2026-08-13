import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNowStrict } from "date-fns";
import { ro, enGB } from "date-fns/locale";

import { useCountry } from "@/components/CountryContext";
import PropertyEditForm from "@/components/PropertyEditForm";
import PropertyComments from "@/components/PropertyComments";
import SimilarProperties from "@/components/SimilarProperties";
import Lightbox from "@/components/Lightbox";
import ReportModal from "@/components/ReportModal";
import ContactPanel from "@/components/ContactPanel";
import PropertyGoogleMap from "@/components/PropertyGoogleMap";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin, Maximize, BedDouble, Wallet, BadgeCheck, Sparkles, PawPrint, Car,
  Calendar, ShieldCheck, CheckCircle2, ChevronLeft, ChevronRight,
  Heart, MessageCircle, UserCircle2, Clock, Pencil, Box, Maximize2, X,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { startConversation } from "@/lib/conversations";
import { createNotification } from "@/lib/notifications";

export default function PropertyDetail() {
  const { id } = useParams();
  const { country, formatPrice, t, legalInfo, lang } = useCountry();
  const locale = lang === "en" ? "en-GB" : "ro-RO";
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState("gallery");
  const [ownerUser, setOwnerUser] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tour3dFull, setTour3dFull] = useState(false);
  const [showLb, setShowLb] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const viewedRef = useRef(new Set());
  const touchStartX = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (!user || !property) return;
    (async () => {
      try {
        const list = await base44.entities.SavedProperty.filter({ user_id: user.id, property_id: property.id }, "-created_date", 1);
        if (!cancelled) setSaved(list.length > 0);
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, [user, property]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await base44.entities.Property.get(id);
        if (cancelled) return;
        const shouldInc = !viewedRef.current.has(id);
        if (shouldInc) viewedRef.current.add(id);
        setProperty(shouldInc ? { ...p, views_count: (p.views_count || 0) + 1 } : p);
        setTab(p.ai_tour_verified ? "ai" : "gallery");
        if (p.created_by_id) {
          base44.entities.User.get(p.created_by_id).then((u) => { if (!cancelled) setOwnerUser(u); }).catch(() => {});
        }
        if (shouldInc) {
          base44.functions.invoke("IncrementViews", { property_id: id }).catch(() => {});
        }
      } catch (e) {
        if (cancelled) setProperty(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-4 h-[420px] rounded-2xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <MapPin className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="mt-4 font-heading text-2xl font-bold text-navy dark:text-foreground">{t("not_found")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === "en"
            ? "This listing may have been removed or is no longer available."
            : "Acest anunț ar fi putut fi șters sau nu mai este disponibil."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button asChild variant="outline"><Link to="/search">{t("back_results")}</Link></Button>
          <Button asChild className="bg-emerald text-white hover:bg-emerald/90"><Link to="/">{t("back_home")}</Link></Button>
        </div>
      </div>
    );
  }

  const p = property;
  const images = p.images?.length ? p.images : [];
  const isAdmin = user && ["SUPER_ADMIN", "ADMIN"].includes((user.role || "").toUpperCase());
  const canEdit = !!user && (isAdmin || (user.id && p.created_by_id === user.id));

  const toggleSave = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      if (saved) {
        const list = await base44.entities.SavedProperty.filter({ user_id: user.id, property_id: p.id }, "-created_date", 10);
        for (const s of list) await base44.entities.SavedProperty.delete(s.id);
        setSaved(false); toast({ title: t("pd_unsaved") });
      } else {
        await base44.entities.SavedProperty.create({ user_id: user.id, property_id: p.id });
        setSaved(true); toast({ title: t("pd_saved_toast") });
        // „Like la postare": notify owner someone liked/saved their listing
        if (p.created_by_id && p.created_by_id !== user.id) {
          createNotification({
            userId: p.created_by_id,
            type: "like",
            text: t("pd_like_msg", { name: user.full_name || user.email, title: p.title }),
            link: `/property/${p.id}`,
            actorName: user.full_name || user.email,
          });
        }
      }
    } catch (e) { toast({ title: t("pc_err_msg"), variant: "destructive" }); }
  };

  const handleMessage = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      const conv = await startConversation(user, p);
      navigate(`/messages/${conv.id}?prefill=1`);
    } catch (e) { toast({ title: t("pc_err_msg"), variant: "destructive" }); }
  };

  const stats = [
    { icon: BedDouble, label: t("stat_rooms"), value: p.rooms },
    { icon: Maximize, label: t("stat_area"), value: `${p.surface_sqm} mp` },
    { icon: Wallet, label: t("stat_deposit"), value: formatPrice(p.deposit || p.price_monthly, p.currency) },
    { icon: Calendar, label: t("stat_avail"), value: p.available_from ? new Date(p.available_from).toLocaleDateString(locale) : t("immediate") },
  ];

  return (
    <div className="bg-secondary/30">
      {tour3dFull && p.tour_3d_url && (
        <div className="fixed inset-0 z-[100] bg-navy-deep">
          <iframe
            src={p.tour_3d_url}
            title="Tur 3D"
            className="h-full w-full"
            allowFullScreen
            allow="xr-spatial-tracking; fullscreen; autoplay"
            frameBorder="0"
          />
          <button
            type="button"
            onClick={() => setTour3dFull(false)}
            aria-label={lang === "en" ? "Close" : "Închide"}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md active:bg-white/30"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Link to="/search" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-navy">
          <ChevronLeft className="h-4 w-4" /> {t("back_results")}
        </Link>

        <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="min-w-0 space-y-4 sm:space-y-6 lg:col-span-2">
            {/* GALLERY */}
            <div>
          <div className="mb-3 flex items-center gap-2">
            <button onClick={() => setTab("gallery")} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === "gallery" ? "bg-navy text-mint" : "bg-white text-foreground/60 border border-border"}`}>
              {t("tab_gallery")} ({images.length})
            </button>
            {p.tour_3d_url && (
              <button onClick={() => setTab("3d")} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === "3d" ? "bg-navy text-mint" : "bg-white text-foreground/60 border border-border"}`}>
                <span className="flex items-center gap-1.5"><Box className="h-3.5 w-3.5" /> {t("tab_3d")}</span>
              </button>
            )}
          </div>

          {tab === "3d" ? (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-navy-deep shadow-soft">
              <iframe
                src={p.tour_3d_url}
                title="Tur 3D"
                className="aspect-video w-full"
                allowFullScreen
                allow="xr-spatial-tracking; fullscreen; autoplay"
                frameBorder="0"
              />
              <button
                type="button"
                onClick={() => setTour3dFull(true)}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-navy-deep/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md lg:hidden"
              >
                <Maximize2 className="h-3.5 w-3.5" /> {lang === "en" ? "Fullscreen" : "Ecran complet"}
              </button>
            </div>
          ) : (
            <div className="select-none">
              <div
                className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary select-none"
                style={{ aspectRatio: "16 / 10" }}
                onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (touchStartX.current == null) return;
                  const dx = e.changedTouches[0].clientX - touchStartX.current;
                  if (Math.abs(dx) > 50 && images.length > 1) {
                    setActiveImage((i) => (i + (dx < 0 ? 1 : -1) + images.length) % images.length);
                  }
                  touchStartX.current = null;
                }}
              >
                {images[activeImage] ? (
                  <button type="button" onClick={() => { setLbIndex(activeImage); setShowLb(true); }} className="h-full w-full cursor-zoom-in">
                    <Image src={images[activeImage]} alt={p.title} fittingType="fill" className="h-full w-full" />
                  </button>
                ) : (
                  <div className="flex aspect-video w-full max-w-3xl items-center justify-center bg-gradient-to-br from-navy/10 to-mint/20 text-muted-foreground">
                    <span className="text-sm">Fără poze</span>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                      aria-label="Imaginea anterioară"
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                      aria-label="Imaginea următoare"
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <span className="absolute bottom-3 right-3 rounded-full bg-navy-deep/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      {activeImage + 1} / {images.length}
                    </span>
                  </>
                )}

                {/* Salvează — acces rapid direct pe poza principală, ca la Zillow */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleSave(); }}
                  aria-label={saved ? t("pd_saved") : t("pd_save")}
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-navy-deep/45 text-white backdrop-blur-md transition hover:bg-navy-deep/65"
                >
                  <Heart className={`h-4 w-4 transition ${saved ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                </button>
              </div>

              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-navy-deep transition ${activeImage === i ? "border-mint" : "border-transparent opacity-80 hover:opacity-100"}`}
                    >
                      <Image src={img} alt={`thumb ${i}`} fittingType="fill" className="h-full w-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* KEY STATS BAR */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-white px-2.5 py-2 shadow-soft dark:bg-card">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-soft">
                <s.icon className="h-3.5 w-3.5 text-emerald" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-bold leading-tight text-navy dark:text-foreground">{s.value}</p>
                <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

            {editing && (
              <PropertyEditForm
                property={p}
                isAdmin={isAdmin}
                onDone={async () => {
                  setEditing(false);
                  try { const np = await base44.entities.Property.get(id); setProperty(np); } catch {}
                }}
              />
            )}
            <div className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="font-heading text-xl font-bold text-navy sm:text-3xl">{p.title}</h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {p.zone}, {p.city}{p.landmark ? ` · 📍 ${p.landmark}` : ""}, {p.country === "UK" ? t("pd_country_uk") : t("pd_country_ro")}
                  </p>
                  {p.created_date && (
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <UserCircle2 className="h-3.5 w-3.5 text-emerald" />
                      {p.created_by_id ? (
                        <Link to={`/profile/${p.created_by_id}`} className="font-medium text-foreground/70 underline-offset-2 hover:text-emerald hover:underline">
                          {p.posted_by_name || p.owner_name || "VerifiCasa"}
                        </Link>
                      ) : (
                        <span className="font-medium text-foreground/70">{p.posted_by_name || p.owner_name || "VerifiCasa"}</span>
                      )}
                      <span className="text-foreground/40">·</span>
                      <Clock className="h-3.5 w-3.5 text-emerald" />
                      {new Date(p.created_date).toLocaleString(locale, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      <span className="text-foreground/40">·</span>
                      {formatDistanceToNowStrict(new Date(p.created_date), { addSuffix: true, locale: lang === "en" ? enGB : ro })}
                    </p>
                  )}
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground/70">
                    {t("pd_code_label")} <span className="font-mono select-all font-semibold text-foreground/80">{p.property_code || p.id}</span>
                  </p>
                  {p.approved_by_name && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald">
                      <BadgeCheck className="h-3.5 w-3.5" /> {t("pd_approved_by")} {p.approved_by_name}{p.approved_date ? ` · ${new Date(p.approved_date).toLocaleString(locale, { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}` : ""}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={toggleSave} className="gap-1.5 bg-emerald text-white shadow-soft hover:bg-emerald/90">
                      <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} /> {saved ? t("pd_saved") : t("pd_save")}
                    </Button>
                    {canEdit && (
                      <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1 border-emerald/40 text-emerald hover:bg-emerald-soft">
                        <Pencil className="h-3.5 w-3.5" /> {t("pd_edit")}
                      </Button>
                    )}
                    <ReportModal targetType="property" targetId={p.id} targetTitle={p.title} variant="outline" size="sm" className="border-border" />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-heading text-xl font-bold text-navy sm:text-2xl">{formatPrice(p.price_monthly, p.currency)}</p>
                  <p className="text-xs text-muted-foreground">{t("pc_permonth")}</p>
                </div>
              </div>

              {/* BADGES — scorul de încredere (0-100, calculat automat) înlocuiește
                  vechiul badge static "Proprietar verificat" */}
              <div className="mt-4 flex flex-wrap gap-2">
                {p.trust_score >= 75 ? (
                  <span className="flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-mint ring-1 ring-mint/40">
                    <BadgeCheck className="h-3.5 w-3.5" /> {t("pc_trust_high")}
                  </span>
                ) : p.trust_score >= 40 ? (
                  <span className="flex items-center gap-1 rounded-full bg-mint-soft px-3 py-1 text-xs font-semibold text-navy">
                    <BadgeCheck className="h-3.5 w-3.5" /> {t("pc_verified")}
                  </span>
                ) : null}
                {p.ai_tour_verified && (
                  <span className="flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-mint">
                    <Sparkles className="h-3.5 w-3.5" /> {t("badge_aitour_v")}
                  </span>
                )}
                {p.tour_3d_url && (
                  <span className="flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-mint ring-1 ring-mint/40">
                    <Box className="h-3.5 w-3.5" /> {t("tab_3d")}
                  </span>
                )}
                {p.pet_friendly && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                    <PawPrint className="h-3.5 w-3.5" /> {t("badge_pet_v")}
                  </span>
                )}
                {p.parking && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-400/15 dark:text-blue-300">
                    <Car className="h-3.5 w-3.5" /> {t("badge_parking")}
                  </span>
                )}
                {p.furnished && (
                  <span className="flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800 dark:bg-purple-400/15 dark:text-purple-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {t("badge_furnished")}
                  </span>
                )}
              </div>

              <div className="mt-4 rounded-xl bg-mint-soft/60 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-navy">
                  <ShieldCheck className="h-4 w-4" /> {legalInfo.tenantFee}
                </p>
              </div>

                {(p.internet_speed_mbps || p.noise_db != null || p.light_orientation || p.water_pressure_ok) && (
                  <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/60">{t("pd_facilities_h")}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.internet_speed_mbps && <span className="flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-emerald">📶 {t("pd_fac_internet")} {p.internet_speed_mbps} Mbps</span>}
                      {p.noise_db != null && <span className="flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-emerald">🔊 {t("pd_fac_noise")} {p.noise_db} dB</span>}
                      {p.light_orientation && <span className="flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-deep dark:text-gold">☀️ {t("pd_fac_orientation")} {p.light_orientation}</span>}
                      {p.water_pressure_ok && <span className="flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-emerald">💧 {t("pd_fac_water")}</span>}
                    </div>
                  </div>
                )}

              <h2 className="mt-6 font-heading text-lg font-bold text-navy">{t("desc_h")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {p.description || <span className="italic text-muted-foreground/70">{t("info_missing")}</span>}
              </p>
            </div>

            {/* MAP */}
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
              <div className="border-b border-border p-4">
                <h3 className="font-heading font-bold text-navy">{t("map_h")}</h3>
                <p className="text-xs text-muted-foreground">{t("map_sub")}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald">
                  <MapPin className="h-3 w-3" />
                  {p.latitude && p.longitude ? t("map_exact") : t("map_approx")}
                </p>
              </div>
              <MapPreview
                lat={p.latitude}
                lng={p.longitude}
                title={p.title}
                landmark={p.landmark}
                zone={p.zone}
                city={p.city}
                t={t}
              />
            </div>

            {/* COMMENTS */}
            <PropertyComments property={p} />

            {/* SIMILAR RECOMMENDATIONS */}
            <SimilarProperties property={p} />
          </div>
          {showLb && images.length > 0 && (
            <Lightbox
              images={images}
              index={lbIndex}
              onIndex={setLbIndex}
              onClose={() => setShowLb(false)}
              saved={saved}
              onToggleSave={toggleSave}
              title={p.title}
            />
          )}

          {/* RIGHT — Contact panel */}
          <div className="min-w-0 lg:col-span-1">
            <div className="sticky top-20">
              <ContactPanel property={p} ownerUser={ownerUser} onMessage={handleMessage} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA — sits above the BottomNav on phones, flush on md+ */}
      <div className="fixed inset-x-0 z-40 flex items-center gap-2 border-t border-border bg-white/95 px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur-md bottom-[calc(3.75rem+env(safe-area-inset-bottom))] md:bottom-0 lg:hidden dark:bg-card/95">
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-bold text-navy dark:text-foreground">{formatPrice(p.price_monthly, p.currency)}</p>
          <p className="truncate text-[11px] text-muted-foreground">{p.zone}, {p.city}</p>
        </div>
        <Button onClick={handleMessage} className="gap-1.5 bg-emerald text-white shadow-soft hover:bg-emerald/90">
          <MessageCircle className="h-4 w-4" /> {t("pd_msg_btn")}
        </Button>
      </div>
    </div>
  );
}

function MapPreview({ lat, lng, title, landmark, zone, city, t }) {
  return (
    <PropertyGoogleMap
      lat={lat}
      lng={lng}
      title={title}
      landmark={landmark}
      zone={zone}
      city={city}
      t={t}
    />
  );
}