import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { getCities, getZones, getCounty } from "@/components/locations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Image as UIImage } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera, Sparkles, Eye, MessageSquare, FileText, TrendingUp, Upload, Plus, Download,
} from "lucide-react";

export default function Owner() {
  const { country, t } = useCountry();
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [showForm, setShowForm] = useState(false);

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
    { icon: Eye, label: t("s_views"), value: totalViews },
    { icon: MessageSquare, label: t("s_inq"), value: inquiries.length },
    { icon: TrendingUp, label: t("s_mon"), value: country === "UK" ? "Landlord" : "30-50%" },
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

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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

        {showForm && <NewPropertyForm onDone={() => { setShowForm(false); load(); }} />}

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
                    <span className={`flex items-center gap-1 ${p.ai_video_url ? "text-mint" : "text-muted-foreground"}`}><Sparkles className="h-3.5 w-3.5" /> {p.ai_video_url ? t("ai_active") : t("ai_none")}</span>
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
  const { toast } = useToast();
  const cities = useMemo(() => getCities(country), [country]);
  const [form, setForm] = useState({
    title: "", description: "", price_monthly: "", city: "", zone: "", property_type: "Garsonieră",
    rooms: "1", surface_sqm: "", deposit: "", available_from: "", images: "", ai_video_url: "",
    latitude: "", longitude: "", owner_name: "",
    transaction_type: "RENT", building_year: "", total_floors: "", phone: "", whatsapp_phone: "",
    seller_role: "Proprietar",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const zones = useMemo(() => getZones(country, form.city), [country, form.city]);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const f of files.slice(0, 10)) {
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
    if (!form.title || !form.price_monthly || !form.city) {
      toast({ title: t("complete_fields"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const demoVideo = "https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-living-room-41558-large.mp4";
      await base44.entities.Property.create({
        title: form.title,
        description: form.description,
        price_monthly: Number(form.price_monthly),
        currency: "EUR",
        country,
        county: getCounty(form.city),
        city: form.city,
        zone: form.zone,
        property_type: form.property_type,
        rooms: Number(form.rooms),
        surface_sqm: Number(form.surface_sqm) || null,
        deposit: Number(form.deposit) || null,
        transaction_type: form.transaction_type || "RENT",
        building_year: form.building_year ? Number(form.building_year) : null,
        total_floors: form.total_floors ? Number(form.total_floors) : null,
        phone: form.phone || "",
        whatsapp_phone: form.whatsapp_phone || "",
        seller_role: form.seller_role || "Proprietar",
        approval_status: "APPROVED",
        furnished: true,
        pet_friendly: false,
        parking: false,
        available_from: form.available_from || null,
        images: form.images ? form.images.split(",") : [],
        ai_video_url: form.ai_video_url || (form.images ? demoVideo : ""),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        owner_name: form.owner_name || "Proprietar",
        owner_verified: true,
        ai_tour_verified: !!form.images,
        status: "Activ",
        featured: true,
        views_count: 0,
      });
      toast({ title: t("created_title"), description: t("created_desc") });
      onDone();
    } catch (err) {
      toast({ title: t("save_err"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const TYPES = ["Garsonieră", "2 Camere", "3 Camere", "4+ Camere", "Casă", "Studio"];

  const inputCls = "w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-mint";

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5 text-mint" />
        <h3 className="font-heading text-lg font-bold text-navy">{t("new_prop_h")}</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t("new_prop_d")}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={t("f_title")} className={inputCls} />
        <select value={form.property_type} onChange={(e) => setForm((f) => ({ ...f, property_type: e.target.value }))} className={inputCls}>
          {TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
        </select>
        <select value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, zone: "" }))} className={inputCls}>
          <option value="">Oraş</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={form.zone} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))} disabled={!form.city} className={inputCls}>
          <option value="">{t("f_zone")}</option>
          {zones.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        <input type="number" value={form.price_monthly} onChange={(e) => setForm((f) => ({ ...f, price_monthly: e.target.value }))} placeholder={t("f_price")} className={inputCls} />
        <input type="number" value={form.deposit} onChange={(e) => setForm((f) => ({ ...f, deposit: e.target.value }))} placeholder={t("f_deposit")} className={inputCls} />
        <input type="number" value={form.rooms} onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))} placeholder={t("f_rooms")} className={inputCls} />
        <input type="number" value={form.surface_sqm} onChange={(e) => setForm((f) => ({ ...f, surface_sqm: e.target.value }))} placeholder={t("f_surface")} className={inputCls} />
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
        <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Telefon (ex: 0759...)" className={inputCls} />
        <input value={form.whatsapp_phone} onChange={(e) => setForm((f) => ({ ...f, whatsapp_phone: e.target.value }))} placeholder="WhatsApp (ex: 40759...)" className={inputCls} />
        <input type="number" value={form.building_year} onChange={(e) => setForm((f) => ({ ...f, building_year: e.target.value }))} placeholder="An construcție" className={inputCls} />
        <input type="number" value={form.total_floors} onChange={(e) => setForm((f) => ({ ...f, total_floors: e.target.value }))} placeholder="Total etaje clădire" className={inputCls} />
      </div>

      <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder={t("f_desc")} rows={3} className={`mt-3 ${inputCls}`} />

      <div className="mt-3">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/20 px-4 py-6 text-sm text-muted-foreground transition hover:border-mint hover:text-navy">
          <Upload className="h-5 w-5" />
          {uploading ? t("uploading") : t("upload_btn")}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
        </label>
        {form.images && <p className="mt-1 text-xs text-mint">{t("uploaded_n", { n: form.images.split(",").length })}</p>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button type="submit" disabled={saving || uploading} className="gradient-mint text-navy shadow-soft hover:opacity-90">
          <Sparkles className="h-4 w-4" /> {saving ? t("saving") : t("pub_btn")}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>{t("cancel")}</Button>
      </div>
    </form>
  );
}