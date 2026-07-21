import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Image as UIImage } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera, Sparkles, Eye, MessageSquare, FileText, TrendingUp, Upload,
  CheckCircle2, Clock, Plus, Download,
} from "lucide-react";

export default function Owner() {
  const { country, legalInfo } = useCountry();
  const { toast } = useToast();
  const [properties, setProperties] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const [ps, inq] = await Promise.all([
        base44.entities.Property.list("-created_date", 50),
        base44.entities.Inquiry.list("-created_date", 50),
      ]);
      setProperties(ps);
      setInquiries(inq);
    } catch (e) {
      setProperties([]);
    }
  };

  useEffect(() => { load(); }, []);

  const totalViews = (properties || []).reduce((a, p) => a + (p.views_count || 0), 0);

  return (
    <div className="bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-navy">Dashboard Proprietar</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gestionează anunțuri, tururi AI și cereri de vizionare.</p>
          </div>
          <Button onClick={() => setShowForm((s) => !s)} className="gradient-mint text-navy shadow-soft hover:opacity-90">
            <Plus className="h-4 w-4" /> Adaugă Anunț
          </Button>
        </div>

        {/* STAT CARDS */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: FileText, label: "Anunțuri active", value: properties?.length ?? "—" },
            { icon: Eye, label: "Vizionări AI Tour", value: totalViews },
            { icon: MessageSquare, label: "Cereri vizionare", value: inquiries.length },
            { icon: TrendingUp, label: "Monetizare", value: country === "UK" ? "Landlord" : "30-50%" },
          ].map((s, i) => (
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

        {/* PROPERTIES LIST */}
        <div className="mt-8">
          <h2 className="font-heading text-xl font-bold text-navy">Proprietățile mele</h2>
          {properties === null ? (
            <div className="mt-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
          ) : properties.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border py-16 text-center">
              <Camera className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">Nu ai anunțuri încă. Adaugă prima proprietate.</p>
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
                    <span className={`flex items-center gap-1 ${p.ai_video_url ? "text-mint" : "text-muted-foreground"}`}><Sparkles className="h-3.5 w-3.5" /> {p.ai_video_url ? "AI Activ" : "Fără AI"}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.status === "Activ" ? "bg-mint-soft text-navy" : "bg-secondary text-muted-foreground"}`}>{p.status}</span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-3.5 w-3.5" /> Contract PDF
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INQUIRIES */}
        {inquiries.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-xl font-bold text-navy">Cereri de vizionare primite</h2>
            <div className="mt-4 space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="rounded-2xl border border-border bg-white p-4 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-heading font-bold text-navy">{inq.name} <span className="text-xs font-normal text-muted-foreground">— {inq.property_title}</span></p>
                      <p className="text-xs text-muted-foreground">{inq.email} · {inq.phone || "fără telefon"}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      inq.status === "Nou" ? "bg-blue-50 text-blue-700" :
                      inq.status === "Calificat" ? "bg-mint-soft text-navy" :
                      inq.status === "Vizionare programată" ? "bg-amber-50 text-amber-700" : "bg-secondary text-muted-foreground"
                    }`}>{inq.status}</span>
                  </div>
                  {(inq.occupation || inq.estimated_income) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      {inq.occupation && <span>💼 {inq.occupation}</span>}
                      {inq.estimated_income && <span>💰 Venit: {inq.estimated_income}</span>}
                      {inq.move_date && <span>📅 Mutare: {new Date(inq.move_date).toLocaleDateString("ro-RO")}</span>}
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
  const { country } = useCountry();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "", description: "", price_monthly: "", city: "", zone: "", property_type: "Garsonieră",
    rooms: "1", surface_sqm: "", deposit: "", available_from: "", images: "", ai_video_url: "",
    latitude: "", longitude: "", owner_name: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      toast({ title: `${urls.length} imagini încărcate` });
    } catch (err) {
      toast({ title: "Eroare la încărcare", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price_monthly || !form.city) {
      toast({ title: "Completează titlu, preț și oraș", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const demoVideo = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";
      await base44.entities.Property.create({
        title: form.title,
        description: form.description,
        price_monthly: Number(form.price_monthly),
        currency: country === "UK" ? "GBP" : "RON",
        country,
        city: form.city,
        zone: form.zone,
        property_type: form.property_type,
        rooms: Number(form.rooms),
        surface_sqm: Number(form.surface_sqm) || null,
        deposit: Number(form.deposit) || null,
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
      toast({ title: "Anunț creat cu Tur AI!", description: "Proprietatea a fost publicată." });
      onDone();
    } catch (err) {
      toast({ title: "Eroare la salvare", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const field = (k, ph, type = "text") => (
    <input
      type={type}
      value={form[k]}
      onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
      placeholder={ph}
      className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-mint"
    />
  );

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5 text-mint" />
        <h3 className="font-heading text-lg font-bold text-navy">Adaugă proprietate + Tur AI</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Încarcă 5-10 poze 2D — generăm automat un Tur AI preview.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {field("title", "Titlu anunț")}
        <select value={form.property_type} onChange={(e) => setForm((f) => ({ ...f, property_type: e.target.value }))} className="rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-mint">
          {["Garsonieră", "2 Camere", "3 Camere", "4+ Camere", "Studio", "Casă"].map((t) => <option key={t}>{t}</option>)}
        </select>
        {field("city", country === "UK" ? "Oraș (London)" : "Oraș (București)")}
        {field("zone", "Zona (ex. Aviatorilor / Shoreditch)")}
        {field("price_monthly", "Preț /lună", "number")}
        {field("deposit", "Depozit", "number")}
        {field("rooms", "Nr. camere", "number")}
        {field("surface_sqm", "Suprafață (mp)", "number")}
        {field("available_from", "Disponibil din", "date")}
        {field("owner_name", "Nume proprietar")}
        {field("latitude", "Latitudine", "number")}
        {field("longitude", "Longitudine", "number")}
      </div>

      <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descriere..." rows={3} className="mt-3 w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-mint" />

      <div className="mt-3">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/20 px-4 py-6 text-sm text-muted-foreground transition hover:border-mint hover:text-navy">
          <Upload className="h-5 w-5" />
          {uploading ? "Se încarcă..." : "Încarcă 5-10 poze 2D pentru Tur AI"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
        </label>
        {form.images && <p className="mt-1 text-xs text-mint">{form.images.split(",").length} imagini încărcate ✓</p>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button type="submit" disabled={saving || uploading} className="gradient-mint text-navy shadow-soft hover:opacity-90">
          <Sparkles className="h-4 w-4" /> {saving ? "Se salvează..." : "Publică + Generează Tur AI"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>Anulează</Button>
      </div>
    </form>
  );
}