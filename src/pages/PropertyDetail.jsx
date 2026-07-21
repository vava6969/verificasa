import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { base44 } from "@/api/base44Client";

// Fix default marker icon for bundled leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
import { useCountry } from "@/components/CountryContext";
import AITourPlayer from "@/components/AITourPlayer";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin, Maximize, BedDouble, Wallet, BadgeCheck, Sparkles, PawPrint, Car,
  Calendar, ShieldCheck, FileText, CheckCircle2, ChevronLeft, Send,
} from "lucide-react";

const DEMO_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-living-room-41558-large.mp4";
const DEMO_FALLBACK = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

export default function PropertyDetail() {
  const { id } = useParams();
  const { country, formatPrice, t, legalInfo } = useCountry();
  const { toast } = useToast();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState("ai");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", occupation: "", estimated_income: "", move_date: "", message: "", preferred_visit_date: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await base44.entities.Property.get(id);
        if (cancelled) return;
        setProperty(p);
      } catch (e) {
        if (cancelled) setProperty(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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

  const stats = [
    { icon: BedDouble, label: t("stat_rooms"), value: p.rooms },
    { icon: Maximize, label: t("stat_area"), value: `${p.surface_sqm} mp` },
    { icon: Wallet, label: t("stat_deposit"), value: formatPrice(p.deposit || p.price_monthly, p.currency) },
    { icon: Calendar, label: t("stat_avail"), value: p.available_from ? new Date(p.available_from).toLocaleDateString(country === "UK" ? "en-GB" : "ro-RO") : t("immediate") },
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
            <button onClick={() => setTab("ai")} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === "ai" ? "bg-navy text-mint" : "bg-white text-foreground/60 border border-border"}`}>
              <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> {t("tab_ai")}</span>
            </button>
            <button onClick={() => setTab("gallery")} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === "gallery" ? "bg-navy text-mint" : "bg-white text-foreground/60 border border-border"}`}>
              {t("tab_gallery")} ({images.length})
            </button>
          </div>

          {tab === "ai" ? (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-navy-deep shadow-soft">
              <video autoPlay muted loop playsInline poster={images[0]} className="aspect-video w-full object-cover">
                <source src={p.ai_video_url || DEMO_VIDEO} type="video/mp4" />
                <source src={DEMO_FALLBACK} type="video/mp4" />
              </video>
              {/* subtle controls overlay */}
              <div className="absolute left-3 top-3">
                <span className="flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-[11px] font-semibold text-mint backdrop-blur">
                  <Sparkles className="h-3 w-3" /> {t("aip_badge")}
                </span>
              </div>
              <div className="pointer-events-none absolute bottom-3 left-3">
                <p className="text-sm font-semibold text-white drop-shadow">{p.title}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              {images[activeImage] ? (
                <Image src={images[activeImage]} alt={p.title} fittingType="fill" className="aspect-video w-full" />
              ) : (
                <div className="aspect-video w-full bg-gradient-to-br from-navy/10 to-mint/20" />
              )}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${activeImage === i ? "border-mint" : "border-transparent"}`}>
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
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">{p.title}</h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {p.zone}, {p.city}, {p.country === "UK" ? "United Kingdom" : "România"}
                  </p>
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
                  <ShieldCheck className="h-4 w-4" /> {legalInfo.tenantFee} · {legalInfo.legal1}
                </p>
              </div>

              <h2 className="mt-6 font-heading text-lg font-bold text-navy">{t("desc_h")}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{p.description}</p>
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
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-mint" />
                <h3 className="font-heading text-lg font-bold text-navy">{t("contact_h")}</h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("contact_sub")}</p>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <input required value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder={t("ph_name")} className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-mint" />
                <input required type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder={t("ph_email")} className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-mint" />
                <input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder={t("ph_phone")} className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-mint" />

                <div className="rounded-xl bg-mint-soft/40 p-3">
                  <p className="mb-2 text-xs font-semibold text-navy">{t("prequal")}</p>
                  <div className="space-y-2.5">
                    <input value={form.occupation} onChange={(e) => handleChange("occupation", e.target.value)} placeholder={t("ph_occupation")} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-mint" />
                    <input type="number" value={form.estimated_income} onChange={(e) => handleChange("estimated_income", e.target.value)} placeholder={t("ph_income")} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-mint" />
                    <input type="date" value={form.move_date} onChange={(e) => handleChange("move_date", e.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-mint" />
                    <input type="date" value={form.preferred_visit_date} onChange={(e) => handleChange("preferred_visit_date", e.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-mint" />
                  </div>
                </div>

                <textarea value={form.message} onChange={(e) => handleChange("message", e.target.value)} placeholder={t("ph_msg")} rows={3} className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-mint" />

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