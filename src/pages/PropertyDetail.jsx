import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNowStrict } from "date-fns";
import { ro, enGB } from "date-fns/locale";

// Fix default marker icon for bundled leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
import { useCountry } from "@/components/CountryContext";
import AITourPlayer from "@/components/AITourPlayer";
import PropertyEditForm from "@/components/PropertyEditForm";
import PhoneReveal from "@/components/PhoneReveal";
import PropertyPOI from "@/components/PropertyPOI";
import PropertyComments from "@/components/PropertyComments";
import ReportModal from "@/components/ReportModal";
import DateField from "@/components/DateField";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin, Maximize, BedDouble, Wallet, BadgeCheck, Sparkles, PawPrint, Car,
  Calendar, ShieldCheck, FileText, CheckCircle2, ChevronLeft, ChevronRight, Send, Phone,
  Heart, MessageCircle, UserCircle2, Clock, Pencil, Box,
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
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", occupation: "", estimated_income: "", move_date: "", message: "", preferred_visit_date: "",
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
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

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  // Telefonul de contact al cumpărătorului — doar cifre (opțional "+ la început").
  const handlePhoneChange = (raw) => {
    const clean = String(raw || "").replace(/[^0-9+]/g, "");
    const v = clean.startsWith("+") ? "+" + clean.slice(1).replace(/\+/g, "") : clean.replace(/\+/g, "");
    handleChange("phone", v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast({ title: t("requiredComplete"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Inquiry.create({
        property_id: property.id,
        property_title: property.title,
        name: form.name,
        email: form.email,
        phone: form.phone,
        occupation: form.occupation,
        estimated_income: form.estimated_income ? Number(form.estimated_income) : null,
        move_date: form.move_date || null,
        message: form.message,
        preferred_visit_date: form.preferred_visit_date || null,
        status: "Nou",
      });
      try {
        await base44.functions.invoke("NotifyOnNewInquiry", {
          inquiry: {
            property_id: property.id,
            property_title: property.title,
            name: form.name,
            email: form.email,
            phone: form.phone,
            occupation: form.occupation,
            estimated_income: form.estimated_income ? Number(form.estimated_income) : null,
            move_date: form.move_date || null,
            message: form.message,
            preferred_visit_date: form.preferred_visit_date || null,
          },
        });
      } catch (_) { /* email/notification is best-effort; don't block the user */ }
      toast({ title: t("submit_sent"), description: t("submit_sent_desc") });
      setForm({ name: "", email: "", phone: "", occupation: "", estimated_income: "", move_date: "", message: "", preferred_visit_date: "" });
    } catch (err) {
      toast({ title: t("submit_err"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="font-heading text-2xl font-bold text-navy">{t("not_found")}</p>
        <Button asChild className="mt-4 gradient-mint text-navy"><Link to="/">{t("back_home")}</Link></Button>
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
      navigate(`/messages?c=${conv.id}`);
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/search" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-navy">
          <ChevronLeft className="h-4 w-4" /> {t("back_results")}
        </Link>

        {/* HERO */}
        <div className="mt-4">
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
            <div className="overflow-hidden rounded-2xl border border-border bg-navy-deep shadow-soft">
              <iframe
                src={p.tour_3d_url}
                title="Tur 3D"
                className="aspect-video w-full"
                allowFullScreen
                allow="xr-spatial-tracking; fullscreen; autoplay"
                frameBorder="0"
              />
            </div>
          ) : (
            <div className="select-none">
              <div
                className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-border bg-navy-deep select-none"
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
                  <Image src={images[activeImage]} alt={p.title} fittingType="fit" className="max-h-full w-full" />
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
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-white p-4 shadow-soft">
              <s.icon className="h-5 w-5 text-mint" />
              <p className="mt-2 font-heading text-lg font-bold text-navy">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
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
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">{p.title}</h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {p.zone}, {p.city}{p.landmark ? ` · 📍 ${p.landmark}` : ""}, {p.country === "UK" ? t("pd_country_uk") : t("pd_country_ro")}
                  </p>
                  {p.created_date && (
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <UserCircle2 className="h-3.5 w-3.5 text-emerald" />
                      <span className="font-medium text-foreground/70">{p.posted_by_name || p.owner_name || "VerifiCasa"}</span>
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
                <div className="text-right">
                  <p className="font-heading text-2xl font-bold text-navy">{formatPrice(p.price_monthly, p.currency)}</p>
                  <p className="text-xs text-muted-foreground">{t("pc_permonth")}</p>
                </div>
              </div>

              {/* BADGES */}
              <div className="mt-4 flex flex-wrap gap-2">
                {p.owner_verified && (
                  <span className="flex items-center gap-1 rounded-full bg-mint-soft px-3 py-1 text-xs font-semibold text-navy">
                    <BadgeCheck className="h-3.5 w-3.5" /> {t("badge_owner_v")}
                  </span>
                )}
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
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    <PawPrint className="h-3.5 w-3.5" /> {t("badge_pet_v")}
                  </span>
                )}
                {p.parking && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                    <Car className="h-3.5 w-3.5" /> {t("badge_parking")}
                  </span>
                )}
                {p.furnished && (
                  <span className="flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800">
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
            {p.latitude && p.longitude && (
              <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
                <div className="border-b border-border p-4">
                  <h3 className="font-heading font-bold text-navy">{t("map_h")}</h3>
                  <p className="text-xs text-muted-foreground">{t("map_sub")}</p>
                </div>
                <MapPreview lat={p.latitude} lng={p.longitude} title={p.title} />
              </div>
            )}

            {/* POINTS OF INTEREST */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald" />
                <h3 className="font-heading text-lg font-bold text-navy dark:text-foreground">{t("poi_section_title")}</h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("poi_section_sub", { zone: p.zone, city: p.city })}</p>
              <div className="mt-4">
                <PropertyPOI zone={p.zone} city={p.city} />
              </div>
            </div>

            {/* COMMENTS */}
            <PropertyComments property={p} />
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-mint" />
                <h3 className="font-heading text-lg font-bold text-navy">{t("contact_h")}</h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("contact_sub")}</p>

              <Button type="button" onClick={handleMessage} className="mt-3 w-full gap-1.5 bg-navy text-emerald hover:opacity-90">
                <MessageCircle className="h-4 w-4" /> {t("pd_msg_btn")}
              </Button>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div className="rounded-xl bg-emerald-soft/40 p-3">
                  <p className="mb-2 flex items-center gap-1 text-xs font-bold text-emerald"><Phone className="h-3.5 w-3.5" /> {t("pd_seller_contact")}</p>
                  <PhoneReveal phone={p.phone} whatsappPhone={p.whatsapp_phone} />
                </div>
                <input required value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder={t("ph_name")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-emerald dark:bg-card" />
                <input required type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder={t("ph_email")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-emerald dark:bg-card" />
                <input inputMode="numeric" value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder={t("ph_phone")} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-emerald dark:bg-card" />

                <div className="rounded-xl bg-mint-soft/40 p-3">
                  <p className="mb-2 text-xs font-semibold text-navy">{t("prequal")}</p>
                  <div className="space-y-2.5">
                    <input value={form.occupation} onChange={(e) => handleChange("occupation", e.target.value)} placeholder={t("ph_occupation")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-emerald dark:bg-card" />
                    <input type="number" value={form.estimated_income} onChange={(e) => handleChange("estimated_income", e.target.value)} placeholder={t("ph_income")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-emerald dark:bg-card" />
                    <DateField value={form.move_date} onChange={(e) => handleChange("move_date", e.target.value)} placeholder={t("pd_move_label")} className="w-full" />
                    <DateField value={form.preferred_visit_date} onChange={(e) => handleChange("preferred_visit_date", e.target.value)} placeholder={t("pd_visit_label")} className="w-full" />
                  </div>
                </div>

                <textarea value={form.message} onChange={(e) => handleChange("message", e.target.value)} placeholder={t("ph_msg")} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-emerald dark:bg-card" />

                <Button type="submit" disabled={submitting} className="w-full gradient-mint text-navy shadow-soft hover:opacity-90">
                  <Send className="h-4 w-4" /> {submitting ? t("sending") : t("btn_send")}
                </Button>
              </form>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-mint" /> {legalInfo.legal2}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPreview({ lat, lng, title }) {
  return (
    <div className="h-72 w-full">
      <MapContainer center={[lat, lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        <Marker position={[lat, lng]}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}