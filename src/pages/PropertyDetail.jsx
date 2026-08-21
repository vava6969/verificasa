import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNowStrict, isValid } from "date-fns";
import { ro, enGB } from "date-fns/locale";

import { useCountry } from "@/components/CountryContext";
import PropertyEditForm from "@/components/PropertyEditForm";
import PropertyComments from "@/components/PropertyComments";
import SimilarProperties from "@/components/SimilarProperties";
import Lightbox from "@/components/Lightbox";
import ReportModal from "@/components/ReportModal";
import ContactPanel from "@/components/ContactPanel";
import PropertyPresentation from "@/components/PropertyPresentation";
import PropertyDescription from "@/components/PropertyDescription";
import PropertyGoogleMap from "@/components/PropertyGoogleMap";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin, Maximize, BedDouble, Wallet,
  Calendar, ChevronLeft, ChevronRight,
  Heart, UserCircle2, Clock, Pencil, Box, Maximize2, X, Film,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { startConversation } from "@/lib/conversations";
import { createNotification } from "@/lib/notifications";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Stamp, Frank, Ledger, LedgerRow, PhotoMark } from "@/components/fisa";

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
        if (!cancelled) setProperty(null);
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
        <Skeleton className="mt-4 h-[420px] rounded" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded lg:col-span-2" />
          <Skeleton className="h-96 rounded" />
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
    { icon: Calendar, label: t("stat_avail"), value: p.available_from && isValid(new Date(p.available_from)) ? new Date(p.available_from).toLocaleDateString(locale) : t("immediate") },
  ];

  // Tab-urile galeriei (Galerie/Prezentare/Tur 3D) — aceleași butoane, refolosite
  // fie ca rând normal (deasupra, pt. tab-urile 3D/Prezentare), fie ca bară
  // flotantă glassmorphism peste poza principală (tab-ul Galerie), ca imaginea
  // să se extindă până sus, acoperind fosta dungă albă.
  const tabSwitcherButtons = (
    <>
      <button onClick={() => setTab("gallery")} className={`rounded px-4 py-1.5 text-sm font-semibold transition ${tab === "gallery" ? "bg-navy text-mint" : "bg-white text-foreground/60 border border-border"}`}>
        {t("tab_gallery")} ({images.length})
      </button>
      {images.length > 0 && (
        <button onClick={() => setTab("presentation")} className={`rounded px-4 py-1.5 text-sm font-semibold transition ${tab === "presentation" ? "bg-navy text-mint" : "bg-white text-foreground/60 border border-border"}`}>
          <span className="flex items-center gap-1.5"><Film className="h-3.5 w-3.5" /> {lang === "en" ? "Showcase" : "Prezentare"}</span>
        </button>
      )}
      {p.tour_3d_url && (
        <button onClick={() => setTab("3d")} className={`rounded px-4 py-1.5 text-sm font-semibold transition ${tab === "3d" ? "bg-navy text-mint" : "bg-white text-foreground/60 border border-border"}`}>
          <span className="flex items-center gap-1.5"><Box className="h-3.5 w-3.5" /> {t("tab_3d")}</span>
        </button>
      )}
    </>
  );

  return (
    <div className="bg-background">
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
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-sm border border-white/40 bg-black/45 text-white transition-colors hover:bg-black/65"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-3 pb-4 sm:px-6 sm:pb-6 lg:px-8">
        {/* Grila pornește trasă -14 (înălțimea header-ului) ca galeria de mai jos
            să ajungă chiar sub header-ul transparent, fără gol alb între ele. */}
        <div className="-mt-14 grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="min-w-0 space-y-4 sm:space-y-6 lg:col-span-2">
            {/* GALLERY */}
            <div className="relative">
          {/* Bară flotantă glassmorphism — back + tab-uri, chiar sub header-ul
              site-ului (transparent pe această pagină); imaginea/conținutul de
              dedesubt se întinde până sus, acoperind fosta dungă albă. */}
          <div className="pointer-events-none absolute inset-x-0 top-14 z-20 flex items-center gap-2 bg-gradient-to-b from-black/40 via-black/10 to-transparent p-3">
            <div className="pointer-events-auto flex items-center gap-2 rounded-sm border border-white/30 bg-black/45 p-1">
              <button
                type="button"
                onClick={() => navigate("/search")}
                aria-label={t("back_results")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              {tabSwitcherButtons}
            </div>
          </div>

          {tab === "3d" ? (
            <div className="relative overflow-hidden border border-border bg-navy-deep">
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
                className="absolute bottom-3 right-3 flex min-h-[36px] items-center gap-1.5 rounded-sm border border-white/35 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white lg:hidden"
              >
                <Maximize2 className="h-3.5 w-3.5" /> {lang === "en" ? "Fullscreen" : "Ecran complet"}
              </button>
            </div>
          ) : tab === "presentation" ? (
            <PropertyPresentation images={images} title={p.title} />
          ) : (
            <div className="select-none">
              <div
                className="relative flex items-center justify-center overflow-hidden rounded border border-border/60 bg-secondary shadow-[0_30px_80px_-30px_rgba(16,24,40,0.4)] select-none"
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
                <AnimatePresence>
                  {images[activeImage] && (
                    <motion.button
                      key={activeImage}
                      type="button"
                      onClick={() => { setLbIndex(activeImage); setShowLb(true); }}
                      className="absolute inset-0 h-full w-full cursor-zoom-in overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <motion.div
                        className="h-full w-full"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.045 }}
                        transition={{ duration: 10, ease: "linear" }}
                      >
                        <Image src={images[activeImage]} alt={p.title} fittingType="fill" className="h-full w-full" />
                      </motion.div>
                    </motion.button>
                  )}
                </AnimatePresence>
                {!images[activeImage] && (
                  <div className="flex aspect-video w-full max-w-3xl items-center justify-center bg-secondary text-muted-foreground">
                    <span className="text-sm">Fără poze</span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 to-transparent" />

                {/* Preîncărcăm pozele vecine (stânga/dreapta) la aceeași dimensiune ca poza
                    principală, ca navigarea next/prev să pară instantă în loc să
                    reîncarce vizibil de fiecare dată. */}
                {images.length > 1 && (
                  <div className="pointer-events-none absolute inset-0 opacity-0" aria-hidden="true">
                    <Image src={images[(activeImage + 1) % images.length]} fittingType="fill" className="h-full w-full" />
                    <Image src={images[(activeImage - 1 + images.length) % images.length]} fittingType="fill" className="h-full w-full" />
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                      aria-label="Imaginea anterioară"
                      className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm border border-white/40 bg-black/40 text-white transition-colors hover:bg-black/65 sm:h-12 sm:w-12"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                      aria-label="Imaginea următoare"
                      className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm border border-white/40 bg-black/40 text-white transition-colors hover:bg-black/65 sm:h-12 sm:w-12"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <PhotoMark className="bottom-3 right-3">
                      {String(activeImage + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                    </PhotoMark>
                  </>
                )}

                {/* Salvează — acces rapid direct pe poza principală, ca la Zillow */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleSave(); }}
                  aria-label={saved ? t("pd_saved") : t("pd_save")}
                  className="absolute right-3 top-16 flex h-11 w-11 items-center justify-center rounded-sm border border-white/40 bg-black/40 text-white transition-colors hover:bg-black/65"
                >
                  <Heart className={`h-5 w-5 transition ${saved ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                </button>
                {images.length > 0 && (
                  <PhotoMark className="bottom-3 left-3">{p.property_code || ""}</PhotoMark>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-16 w-24 shrink-0 overflow-hidden border-2 bg-navy-deep transition-colors sm:h-20 sm:w-28 ${activeImage === i ? "border-emerald" : "border-transparent opacity-65 hover:opacity-100"}`}
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
        <RevealGroup className="mt-3 grid grid-cols-2 divide-x divide-y divide-border border border-border bg-card sm:grid-cols-4 sm:divide-y-0">
          {stats.map((s, i) => (
            <RevealItem key={i} y={10} className="px-3 py-2.5">
              <p className="truncate text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 truncate font-heading text-lg font-semibold leading-tight text-foreground tnum">{s.value}</p>
            </RevealItem>
          ))}
        </RevealGroup>

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
            <div className="relative border border-border bg-card p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-4xl">{p.title}</h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {p.zone}, {p.city}{p.landmark ? ` · ${p.landmark}` : ""}, {p.country === "UK" ? t("pd_country_uk") : t("pd_country_ro")}
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
                      {isValid(new Date(p.created_date))
                        ? new Date(p.created_date).toLocaleString(locale, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                      <span className="text-foreground/40">·</span>
                      {isValid(new Date(p.created_date))
                        ? formatDistanceToNowStrict(new Date(p.created_date), { addSuffix: true, locale: lang === "en" ? enGB : ro })
                        : ""}
                    </p>
                  )}
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground/70">
                    {t("pd_code_label")} <span className="select-all font-mono font-semibold text-foreground">{p.property_code || p.id}</span>
                  </p>
                  {p.approved_by_name && (
                    <div className="mt-2">
                      <Stamp
                        tone="verde"
                        date={p.approved_date ? new Date(p.approved_date).toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" }) : null}
                        by={p.approved_by_name}
                      >
                        {t("pd_approved_by").replace(/[:·]\s*$/, "")}
                      </Stamp>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={toggleSave} className="min-h-[40px] gap-1.5 rounded bg-emerald text-primary-foreground hover:bg-emerald/90">
                      <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} /> {saved ? t("pd_saved") : t("pd_save")}
                    </Button>
                    {canEdit && (
                      <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="min-h-[40px] gap-1 rounded border-border text-foreground hover:border-emerald hover:text-emerald">
                        <Pencil className="h-3.5 w-3.5" /> {t("pd_edit")}
                      </Button>
                    )}
                    <ReportModal targetType="property" targetId={p.id} targetTitle={p.title} variant="outline" size="sm" className="border-border" />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-heading text-3xl font-semibold text-foreground tnum sm:text-4xl">{formatPrice(p.price_monthly, p.currency)}</p>
                  <p className="text-xs font-medium text-muted-foreground">{t("pc_permonth")}</p>
                </div>
              </div>

              {/* VERDICTE — ștampile cu bordură, niciodată pastile colorate */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {p.trust_score >= 75 ? (
                  <Stamp tone="verde">{t("pc_trust_high")}</Stamp>
                ) : p.trust_score >= 40 ? (
                  <Stamp tone="verde">{t("pc_verified")}</Stamp>
                ) : null}
                {(p.boost_active || p.featured) && (
                  <Frank
                    until={p.boost_ends_date ? new Date(p.boost_ends_date).toLocaleDateString(locale, { day: "2-digit", month: "short" }) : null}
                  />
                )}
                {p.ai_tour_verified && <Stamp tone="ink">{t("badge_aitour_v")}</Stamp>}
                {p.tour_3d_url && <Stamp tone="ink">{t("tab_3d")}</Stamp>}
                {p.pet_friendly && <Stamp tone="ink">{t("badge_pet_v")}</Stamp>}
                {p.parking && <Stamp tone="ink">{t("badge_parking")}</Stamp>}
                {p.furnished && <Stamp tone="ink">{t("badge_furnished")}</Stamp>}
              </div>

              {/* MĂSURĂTORI — registrul de fapte al fișei, cifre tabulare */}
              {(p.internet_speed_mbps || p.noise_db != null || p.light_orientation || p.water_pressure_ok || p.maintenance_fee || p.monthly_utilities_estimate) && (
                <div className="mt-4">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    {lang === "en" ? "Measured on site" : "Măsurat la fața locului"}
                  </h2>
                  <Ledger className="mt-2">
                    {p.surface_sqm != null && <LedgerRow label={lang === "en" ? "Surface" : "Suprafață"} value={p.surface_sqm} sub="mp" />}
                    {p.internet_speed_mbps && <LedgerRow label={t("pd_fac_internet")} value={p.internet_speed_mbps} sub="Mbps" />}
                    {p.noise_db != null && <LedgerRow label={t("pd_fac_noise")} value={p.noise_db} sub="dB" />}
                    {p.light_orientation && <LedgerRow label={t("pd_fac_orientation")} value={p.light_orientation} />}
                    {p.water_pressure_ok && <LedgerRow label={t("pd_fac_water")} value={lang === "en" ? "compliant" : "conformă"} />}
                    {p.metro_distance_min != null && <LedgerRow label={lang === "en" ? "Transit" : "Transport"} value={p.metro_distance_min} sub="min" />}
                    {p.maintenance_fee != null && <LedgerRow label={lang === "en" ? "Maintenance" : "Întreținere"} value={formatPrice(p.maintenance_fee, p.currency)} />}
                    {p.monthly_utilities_estimate != null && <LedgerRow label={lang === "en" ? "Utilities est." : "Estimare utilități"} value={formatPrice(p.monthly_utilities_estimate, p.currency)} />}
                    {p.building_year != null && <LedgerRow label={lang === "en" ? "Built" : "An construcție"} value={p.building_year} />}
                  </Ledger>
                </div>
              )}

              <p className="mt-4 border-t border-border pt-3 text-xs font-semibold text-foreground">
                {legalInfo.tenantFee}
              </p>

              <h2 className="mt-6 font-heading text-lg font-semibold text-foreground">{t("desc_h")}</h2>
              <PropertyDescription
                text={p.description}
                emptyLabel={t("info_missing")}
                moreLabel={lang === "en" ? "Read more" : "Află mai mult"}
                lessLabel={lang === "en" ? "Show less" : "Arată mai puțin"}
              />
            </div>

            {/* MAP */}
            <Reveal>
              <div className="overflow-hidden border border-border bg-card">
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border text-emerald">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-navy dark:text-foreground">{t("map_h")}</h3>
                    <p className="text-xs text-muted-foreground">{t("map_sub")}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 rounded bg-emerald-soft px-2.5 py-1 text-[11px] font-medium text-emerald">
                    {p.latitude && p.longitude ? t("map_exact") : t("map_approx")}
                  </span>
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
            </Reveal>

            {/* SCORUL, CU CALCULUL LA VEDERE — inclusiv scăderile.
                Niciun marketplace nu arată de ce un anunț a punctat prost.
                Acesta o face; asta e ce transformă un contor de completare
                într-o verificare. */}
            <Reveal>
              <ScoreLedger
                score={p.trust_score}
                breakdown={p.trust_breakdown ? (() => { try { return JSON.parse(p.trust_breakdown); } catch { return null; } })() : null}
                labels={{
                  title: lang === "en" ? "Trust score" : "Scor de încredere",
                  sub: lang === "en"
                    ? "Built from evidence, not from how many photos were uploaded."
                    : "Calculat din dovezi, nu din câte poze au fost încărcate.",
                  high: t("pc_trust_high"),
                  mid: t("pc_verified"),
                  low: lang === "en" ? "Not verified" : "Neverificat",
                  pending: lang === "en"
                    ? "The breakdown is published at the listing's next recalculation."
                    : "Detalierea se publică la următoarea recalculare a anunțului.",
                }}
              />
            </Reveal>

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
              <Reveal>
                <ContactPanel property={p} ownerUser={ownerUser} onMessage={handleMessage} />
              </Reveal>
            </div>
          </div>
        </div>
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