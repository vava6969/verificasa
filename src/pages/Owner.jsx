import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { getCities, getZones, getCounty } from "@/components/locations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Image as UIImage } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera, Eye, MessageSquare, FileText, TrendingUp, Upload, Plus, Download, Wifi, Volume2, Sun, Droplet,
} from "lucide-react";
import OwnerCharts from "@/components/OwnerCharts";
import { generateUniquePropertyCode } from "@/lib/propertyCode";

const MAX_PHOTOS = 20;
const MIN_PHOTOS = 3;

export default function Owner() {
  const { country, t, lang } = useCountry();
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  // Auto-open the form when the user came from a "Adaugă Anunț" link with ?nou=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("nou") === "1") setShowForm(true);
  }, []);

  // Smooth-scroll to the form whenever it becomes visible.
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  const load = async () => {
    if (!user?.id) return;
    try {
      const [ps, inq] = await Promise.all([
        base44.entities.Property.filter({ created_by_id: user.id }, "-created_date", 50),
        base44.entities.Inquiry.list("-created_date", 50),
      ]);
      setProperties(ps);
      setInquiries(inq);
    } catch (e) {
      setProperties([]);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const totalViews = (properties || []).reduce((a, p) => a + (p.views_count || 0), 0);

  const STAT_CARDS = [
    { icon: FileText, label: t("s_active"), value: properties?.length ?? "—" },
    { icon: Eye, label: "Total Vizionări Anunțuri", value: totalViews },
    { icon: MessageSquare, label: t("s_inq"), value: inquiries.length },
  ];

  return (
    <div className="bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-navy">{t("owner_h")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("owner_sub")}</p>
          </div>
          <Button onClick={() => setShowForm((s) => !s)} className="gradient-mint text-navy shadow-soft hover:opacity-90">
            <Plus className="h-4 w-4" /> {t("owner_add")}
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-soft">
                <s.icon className="h-5 w-5 text-navy" />
              </div>
              <p className="mt-3 font-heading text-2xl font-bold text-navy">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <OwnerCharts ownerId={user?.id} lang={lang} />

        {showForm && (
          <div ref={formRef}>
            <NewPropertyForm onDone={() => { setShowForm(false); load(); }} />
          </div>
        )}

        {/* PROPERTIES */}
        <div className="mt-8">
          <h2 className="font-heading text-xl font-bold text-navy">{t("my_props")}</h2>
          {properties === null ? (
            <div className="mt-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
          ) : properties.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border py-16 text-center">
              <Camera className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">{t("no_props")}</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {properties.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-soft">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {p.images?.[0] ? <UIImage src={p.images[0]} fittingType="fill" className="h-full w-full" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-bold text-navy line-clamp-1">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.zone}, {p.city} · {p.property_type}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground"><Eye className="h-3.5 w-3.5" /> {p.views_count || 0}</span>
                    <span className={`flex items-center gap-1 ${p.ai_video_url ? "text-mint" : "text-muted-foreground"}`}>AI {p.ai_video_url ? t("ai_active") : t("ai_none")}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.approval_status === "APPROVED" ? "bg-mint-soft text-navy" : "bg-amber-100 text-amber-700"}`}>{p.approval_status === "APPROVED" ? "Aprobat" : "În așteptare"}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.status === "Activ" ? "bg-mint-soft text-navy" : "bg-secondary text-muted-foreground"}`}>{p.status}</span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" /> {t("contract_pdf")}</Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INQUIRIES */}
        {inquiries.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-xl font-bold text-navy">{t("inq_title")}</h2>
            <div className="mt-4 space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="rounded-2xl border border-border bg-white p-4 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-heading font-bold text-navy">{inq.name} <span className="text-xs font-normal text-muted-foreground">— {inq.property_title}</span></p>
                      <p className="text-xs text-muted-foreground">{inq.email} · {inq.phone || t("inq_no_phone")}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${inq.status === "Nou" ? "bg-blue-50 text-blue-700" : inq.status === "Calificat" ? "bg-mint-soft text-navy" : inq.status === "Vizionare programată" ? "bg-amber-50 text-amber-700" : "bg-secondary text-muted-foreground"}`}>{inq.status}</span>
                  </div>
                  {(inq.occupation || inq.estimated_income) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      {inq.occupation && <span>{t("inq_occupation")} {inq.occupation}</span>}
                      {inq.estimated_income && <span>💰 {t("inq_income")} {inq.estimated_income}</span>}
                      {inq.move_date && <span>📅 {t("inq_move")} {new Date(inq.move_date).toLocaleDateString("ro-RO")}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NewPropertyForm({ onDone }) {
  const { country, t } = useCountry();
  const { user } = useAuth();
  const { toast } = useToast();
  const cities = useMemo(() => getCities(country), [country]);
  const [form, setForm] = useState({
    title: "", description: "", price_monthly: "", city: "", zone: "", landmark: "", property_type: "Garsonieră",
    rooms: "1", surface_sqm: "", floor: "", deposit: "", available_from: "", images: "", ai_video_url: "",
    latitude: "", longitude: "", owner_name: "",
    transaction_type: "RENT", building_year: "", total_floors: "", phone: "", whatsapp_phone: "",
    seller_role: "Proprietar",
    parking: false, pet_friendly: false, commission_free: false, guarantee: false,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chips, setChips] = useState({ wifi: false, noise: false, light: false, water: false });
  const [facilities, setFacilities] = useState({});
  const [agreed, setAgreed] = useState(false);

  const zones = useMemo(() => getZones(country, form.city), [country, form.city]);
  const imagesCount = form.images ? form.images.split(",").filter(Boolean).length : 0;

  const CHIP_OPTS = [
    { key: "wifi", icon: Wifi, emoji: "📶", label: "Internet / Wi-Fi" },
    { key: "noise", icon: Volume2, emoji: "🔊", label: "Zonă liniștită" },
    { key: "light", icon: Sun, emoji: "☀️", label: "Orientare / Luminozitate" },
    { key: "water", icon: Droplet, emoji: "💧", label: "Presiune apă / Utilități verificate" },
  ];

  const FACILITY_OPTS = [
    { key: "ac", emoji: "❄️", label: "Aer Condiționat" },
    { key: "balcon", emoji: "🌇", label: "Balcon" },
    { key: "lift", emoji: "🛗", label: "Lift" },
    { key: "centrala", emoji: "🔥", label: "Centrală proprie" },
    { key: "termopan", emoji: "🪟", label: "Geamuri Termopan" },
    { key: "mobilat", emoji: "🛋️", label: "Mobilat complet" },
    { key: "bucatarie", emoji: "🍽️", label: "Bucătărie utilată" },
    { key: "tv", emoji: "📺", label: "Smart TV" },
    { key: "masina_spalat", emoji: "🧺", label: "Mașină de spălat" },
    { key: "terasa", emoji: "🌿", label: "Terasă / Grădină" },
  ];

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const existing = form.images ? form.images.split(",").filter(Boolean) : [];
      const remaining = Math.max(0, MAX_PHOTOS - existing.length);
      if (remaining === 0) {
        toast({ title: `Ai atins maximul de ${MAX_PHOTOS} poze`, variant: "destructive" });
        return;
      }
      const urls = [];
      for (const f of files.slice(0, remaining)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        urls.push(file_url);
      }
      setForm((f) => ({ ...f, images: [...(f.images ? f.images.split(",").filter(Boolean) : []), ...urls].join(",") }));
      toast({ title: t("uploaded", { n: urls.length }) });
    } catch (err) {
      toast({ title: t("upload_err"), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Câmpuri obligatorii
    if (!form.title || !form.price_monthly || !form.city || !form.surface_sqm || !form.floor || !form.phone) {
      toast({ title: "Completează toate câmpurile obligatorii", description: "Titlu, preț, oraș, suprafață, etaj și telefon sunt obligatorii.", variant: "destructive" });
      return;
    }
    if (imagesCount < MIN_PHOTOS) {
      toast({ title: `Încarcă cel puțin ${MIN_PHOTOS} poze`, description: "Pozele sunt obligatorii pentru a publica un anunț.", variant: "destructive" });
      return;
    }
    if (imagesCount > MAX_PHOTOS) {
      toast({ title: `Maxim ${MAX_PHOTOS} poze permise`, variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: t("agree_error"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const property_code = await generateUniquePropertyCode();
      const created = await base44.entities.Property.create({
        property_code,
        title: form.title,
        description: form.description,
        price_monthly: Number(form.price_monthly),
        currency: "EUR",
        country,
        county: getCounty(form.city),
        city: form.city,
        zone: form.zone,
        landmark: form.landmark || "",
        property_type: form.property_type,
        rooms: Number(form.rooms),
        surface_sqm: Number(form.surface_sqm) || null,
        floor: form.floor || "",
        deposit: Number(form.deposit) || null,
        transaction_type: form.transaction_type || "RENT",
        building_year: form.building_year ? Number(form.building_year) : null,
        total_floors: form.total_floors ? Number(form.total_floors) : null,
        phone: form.phone || "",
        whatsapp_phone: form.whatsapp_phone || "",
        seller_role: form.seller_role || "Proprietar",
        approval_status: "PENDING",
        furnished: true,
        pet_friendly: form.pet_friendly,
        parking: form.parking,
        commission_free: form.commission_free,
        deposit_option: form.guarantee ? "verificasa_guarantee" : "standard",
        available_from: form.available_from || null,
        images: form.images ? form.images.split(",") : [],
        ai_video_url: form.ai_video_url || "",
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        owner_name: form.owner_name || "Proprietar",
        posted_by_name: user?.full_name || form.owner_name || "VerifiCasa",
        owner_verified: false,
        ai_tour_verified: false,
        status: "Activ",
        featured: false,
        views_count: 0,
        internet_speed_mbps: chips.wifi ? 100 : null,
        noise_db: chips.noise ? 35 : null,
        light_orientation: chips.light ? "Sud" : "",
        water_pressure_ok: chips.water,
        features: [
          ...(chips.wifi ? ["📶 Internet / Wi-Fi"] : []),
          ...(chips.noise ? ["🔊 Zonă liniștită"] : []),
          ...(chips.light ? ["☀️ Orientare Sud"] : []),
          ...(chips.water ? ["💧 Presiune apă OK"] : []),
          ...(facilities.ac ? ["❄️ Aer Condiționat"] : []),
          ...(facilities.balcon ? ["🌇 Balcon"] : []),
          ...(facilities.lift ? ["🛗 Lift"] : []),
          ...(facilities.centrala ? ["🔥 Centrală proprie"] : []),
          ...(facilities.termopan ? ["🪟 Geamuri Termopan"] : []),
          ...(facilities.mobilat ? ["🛋️ Mobilat complet"] : []),
          ...(facilities.bucatarie ? ["🍽️ Bucătărie utilată"] : []),
          ...(facilities.tv ? ["📺 Smart TV"] : []),
          ...(facilities.masina_spalat ? ["🧺 Mașină de spălat"] : []),
          ...(facilities.terasa ? ["🌿 Terasă / Grădină"] : []),
        ],
      });
      try {
        base44.functions.invoke("NotifyAdminsOnNewProperty", {
          property_id: created.id,
          title: form.title,
          owner_name: form.owner_name || "",
        }).catch(() => {});
      } catch (_) {}
      toast({ title: "Anunț trimis spre aprobare", description: "Un administrator îl va verifica în curând. Va apărea în lista publică după aprobare." });
      onDone();
    } catch (err) {
      console.error("[Owner] create failed:", err);
      const detail = err?.message || (typeof err === "string" ? err : "Eroare necunoscută");
      toast({ title: t("save_err"), description: detail, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const TYPES = ["Garsonieră", "2 Camere", "3 Camere", "4+ Camere", "Casă", "Studio"];

  const inputCls = "w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-mint text-foreground";
  const reqMark = <span className="ml-0.5 text-rose-500">*</span>;

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6">
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5 text-mint" />
        <h3 className="font-heading text-lg font-bold text-navy">Publică anunțul tău pe VerifiCasa</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Completează detaliile importante. Câmpurile marcate cu {reqMark} sunt obligatorii.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={t("f_title") + " *"} className={inputCls} />
        <select required value={form.property_type} onChange={(e) => setForm((f) => ({ ...f, property_type: e.target.value }))} className={inputCls}>
          {TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
        </select>
        <select required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, zone: "" }))} className={inputCls}>
          <option value="">Oraş *</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={form.zone} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))} disabled={!form.city} className={inputCls}>
          <option value="">{t("f_zone")}</option>
          {zones.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        <input value={form.landmark} onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))} placeholder="Punct de reper / Stradă (ex: lângă Liceul Agricol)" className={inputCls} />
        <input required type="number" value={form.price_monthly} onChange={(e) => setForm((f) => ({ ...f, price_monthly: e.target.value }))} placeholder={t("f_price") + " *"} className={inputCls} />
        <input type="number" value={form.deposit} onChange={(e) => setForm((f) => ({ ...f, deposit: e.target.value }))} placeholder={t("f_deposit")} className={inputCls} />
        <input required type="number" value={form.rooms} onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))} placeholder={t("f_rooms") + " *"} className={inputCls} />
        <input required type="number" value={form.surface_sqm} onChange={(e) => setForm((f) => ({ ...f, surface_sqm: e.target.value }))} placeholder={t("f_surface") + " *"} className={inputCls} />
        <input required value={form.floor} onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))} placeholder="Etaj (ex: 3, Parter, Demisol) *" className={inputCls} />
        <input type="date" value={form.available_from} onChange={(e) => setForm((f) => ({ ...f, available_from: e.target.value }))} placeholder={t("f_avail")} className={inputCls} />
        <input value={form.owner_name} onChange={(e) => setForm((f) => ({ ...f, owner_name: e.target.value }))} placeholder={t("f_owner")} className={inputCls} />
        <input type="number" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} placeholder={t("f_lat")} className={inputCls} />
        <input type="number" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} placeholder={t("f_lng")} className={inputCls} />
        <select value={form.transaction_type} onChange={(e) => setForm((f) => ({ ...f, transaction_type: e.target.value }))} className={inputCls}>
          <option value="RENT">Închiriere</option>
          <option value="SALE">Vânzare</option>
        </select>
        <select value={form.seller_role} onChange={(e) => setForm((f) => ({ ...f, seller_role: e.target.value }))} className={inputCls}>
          <option value="Proprietar">Proprietar</option>
          <option value="Agent">Agent</option>
        </select>
        <input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Telefon (ex: 0759...) *" className={inputCls} />
        <input value={form.whatsapp_phone} onChange={(e) => setForm((f) => ({ ...f, whatsapp_phone: e.target.value }))} placeholder="WhatsApp (ex: 40759...)" className={inputCls} />
        <input type="number" value={form.building_year} onChange={(e) => setForm((f) => ({ ...f, building_year: e.target.value }))} placeholder="An construcție" className={inputCls} />
        <input type="number" value={form.total_floors} onChange={(e) => setForm((f) => ({ ...f, total_floors: e.target.value }))} placeholder="Total etaje clădire" className={inputCls} />
      </div>

      <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder={t("f_desc")} rows={3} className={`mt-3 ${inputCls}`} />

      {/* Facilități verificate */}
      <div className="mt-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/60">Facilități verificate (apă în preview și în pagina anunțului)</p>
        <div className="flex flex-wrap gap-2">
          {CHIP_OPTS.map((c) => (
            <button
              type="button"
              key={c.key}
              onClick={() => setChips((s) => ({ ...s, [c.key]: !s[c.key] }))}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${chips[c.key] ? "border-emerald bg-emerald text-white shadow-soft" : "border-border bg-white text-foreground/70 hover:border-emerald/50 dark:bg-card"}`}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Facilități apartament */}
      <div className="mt-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/60">Facilități apartament</p>
        <div className="flex flex-wrap gap-2">
          {FACILITY_OPTS.map((c) => (
            <button
              type="button"
              key={c.key}
              onClick={() => setFacilities((s) => ({ ...s, [c.key]: !s[c.key] }))}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${facilities[c.key] ? "border-emerald bg-emerald text-white shadow-soft" : "border-border bg-white text-foreground/70 hover:border-emerald/50 dark:bg-card"}`}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opțiuni care apar în filtrele de căutare */}
      <div className="mt-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/60">Opțiuni (apar automat în filtrele de căutare)</p>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "parking", emoji: "🅿️", label: "Parcare" },
            { key: "pet_friendly", emoji: "🐾", label: "Pet Friendly" },
            { key: "commission_free", emoji: "🆓", label: "Fără Comision" },
            { key: "guarantee", emoji: "🛡️", label: "Garanție 0 (VerifiCasa)" },
          ].map((c) => (
            <button
              type="button"
              key={c.key}
              onClick={() => setForm((s) => ({ ...s, [c.key]: !s[c.key] }))}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${form[c.key] ? "border-emerald bg-emerald text-white shadow-soft" : "border-border bg-white text-foreground/70 hover:border-emerald/50 dark:bg-card"}`}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
        <input
          value={form.ai_video_url}
          onChange={(e) => setForm((f) => ({ ...f, ai_video_url: e.target.value }))}
          placeholder="Link Tur 3D / Video (opțional)"
          className={`mt-2 ${inputCls}`}
        />
      </div>

      <div className="mt-3">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/20 px-4 py-6 text-sm text-muted-foreground transition hover:border-mint hover:text-navy">
          <Upload className="h-5 w-5" />
          {uploading ? t("uploading") : `Încarcă poze (minim ${MIN_PHOTOS}, maxim ${MAX_PHOTOS})`}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
        </label>
        <p className={`mt-1 text-xs ${imagesCount >= MIN_PHOTOS ? "text-mint" : "text-amber-600"}`}>
          {imagesCount > 0
            ? `${imagesCount} ${t("uploaded_n", { n: imagesCount })}`
            : `${t("info_missing")} — încarcă minim ${MIN_PHOTOS} poze.`}
        </p>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-emerald"
        />
        <span className="leading-relaxed">
          {t("agree_prefix")}{" "}
          <Link to="/terms" className="font-semibold text-emerald hover:underline">{t("agree_terms_link")}</Link>{" "}
          {t("agree_and")}{" "}
          <Link to="/privacy" className="font-semibold text-emerald hover:underline">{t("agree_privacy_link")}</Link>.
        </span>
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={saving || uploading} className="flex-1 gradient-mint text-navy shadow-soft hover:opacity-90">
          {saving ? t("saving") : t("pub_btn")}
        </Button>
        <Button type="button" variant="outline" onClick={onDone} className="min-w-[7rem]">{t("cancel")}</Button>
      </div>
    </form>
  );
}