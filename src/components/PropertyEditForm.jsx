import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getCities, getZones } from "@/components/locations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Complete edit form for an existing property — admin or the owner who posted.
// Verification/badge flags (owner_verified, ai_tour_verified, verification_level)
// are exposed only when isAdmin is true; anyone editing can change all content
// (title, price, contacts, video URL, flags like pet/parking/featured, etc.).
const TYPES = ["Garsonieră", "2 Camere", "3 Camere", "4+ Camere", "Casă", "Studio", "Teren", "Spațiu Comercial"];
const STATUS = ["Activ", "Rezervat", "Închis"];
const TRANSACTIONS = ["RENT", "SALE"];
const CURRENCIES = ["EUR", "RON", "GBP"];
const DEPOSIT_OPTIONS = [{ v: "standard", label: "Standard" }, { v: "verificasa_guarantee", label: "Garanție VerifiCasa" }];
const FAIRNESS = [{ v: "", label: "—" }, { v: "sub_piata", label: "Sub piață" }, { v: "corect", label: "Corect" }, { v: "peste_medie", label: "Peste medie" }];
const VERIF = [{ v: "unverified", label: "Neverificat" }, { v: "video_ai", label: "Video / AI" }, { v: "field_certified", label: "Certificat pe teren" }];

export default function PropertyEditForm({ property, onDone, isAdmin = false }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: property.title || "",
    description: property.description || "",
    price_monthly: property.price_monthly ?? "",
    currency: property.currency || "EUR",
    transaction_type: property.transaction_type || "RENT",
    city: property.city || "",
    zone: property.zone || "",
    property_type: property.property_type || "Garsonieră",
    rooms: property.rooms ?? 1,
    surface_sqm: property.surface_sqm ?? "",
    floor: property.floor || "",
    total_floors: property.total_floors ?? "",
    building_year: property.building_year ?? "",
    deposit: property.deposit ?? "",
    available_from: property.available_from || "",
    furnished: !!property.furnished,
    pet_friendly: !!property.pet_friendly,
    parking: !!property.parking,
    phone: property.phone || "",
    whatsapp_phone: property.whatsapp_phone || "",
    owner_name: property.owner_name || "",
    seller_role: property.seller_role || "Proprietar",
    ai_video_url: property.ai_video_url || "",
    tour_3d_url: property.tour_3d_url || "",
    monthly_utilities_estimate: property.monthly_utilities_estimate ?? "",
    maintenance_fee: property.maintenance_fee ?? "",
    deposit_option: property.deposit_option || "standard",
    price_fairness: property.price_fairness || "",
    status: property.status || "Activ",
    featured: !!property.featured,
    commission_free: !!property.commission_free,
    reserve_instant: !!property.reserve_instant,
    is_swap_available: !!property.is_swap_available,
    owner_verified: !!property.owner_verified,
    ai_tour_verified: !!property.ai_tour_verified,
    verification_level: property.verification_level || "unverified",
  });
  const [saving, setSaving] = useState(false);

  const cities = useMemo(() => getCities("RO"), []);
  const zones = useMemo(() => getZones("RO", form.city), [form.city]);
  const inputCls = "w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-emerald";
  const lab = "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70";

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const numOrNull = (v) => (v === "" || v == null ? null : Number(v));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price_monthly || !form.city) {
      toast({ title: "Completează titlu, preț și oraș", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        transaction_type: form.transaction_type,
        currency: form.currency,
        price_monthly: Number(form.price_monthly),
        city: form.city,
        zone: form.zone,
        property_type: form.property_type,
        rooms: form.rooms ? Number(form.rooms) : null,
        surface_sqm: numOrNull(form.surface_sqm),
        floor: form.floor,
        total_floors: numOrNull(form.total_floors),
        building_year: numOrNull(form.building_year),
        deposit: numOrNull(form.deposit),
        available_from: form.available_from || null,
        furnished: form.furnished,
        pet_friendly: form.pet_friendly,
        parking: form.parking,
        phone: form.phone,
        whatsapp_phone: form.whatsapp_phone,
        owner_name: form.owner_name,
        seller_role: form.seller_role,
        ai_video_url: form.ai_video_url,
        monthly_utilities_estimate: numOrNull(form.monthly_utilities_estimate),
        maintenance_fee: numOrNull(form.maintenance_fee),
        deposit_option: form.deposit_option,
        price_fairness: form.price_fairness || null,
        status: form.status,
        featured: form.featured,
        commission_free: form.commission_free,
        reserve_instant: form.reserve_instant,
        is_swap_available: form.is_swap_available,
      };
      if (isAdmin) {
        payload.owner_verified = form.owner_verified;
        payload.ai_tour_verified = form.ai_tour_verified;
        payload.verification_level = form.verification_level;
        payload.tour_3d_url = form.tour_3d_url;
      }
      await base44.entities.Property.update(property.id, payload);
      toast({ title: "Anunț actualizat" });
      onDone();
    } catch (err) {
      toast({ title: "Eroare la salvare", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children }) => (
    <label className="flex flex-col gap-1">
      <span className={lab}>{label}</span>
      {children}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-emerald/30 bg-emerald-soft/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-navy dark:text-foreground">Editează anunțul</h3>
        {isAdmin && <span className="rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald">Mod admin</span>}
      </div>

      {/* Date de bază */}
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-emerald">Date de bază</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Titlu"><input value={form.title} onChange={(e) => upd("title", e.target.value)} className={inputCls} /></Field>
        <Field label="Tip tranzacție">
          <select value={form.transaction_type} onChange={(e) => upd("transaction_type", e.target.value)} className={inputCls}>
            {TRANSACTIONS.map((x) => <option key={x} value={x}>{x === "RENT" ? "Închiriere" : "Vânzare"}</option>)}
          </select>
        </Field>
        <Field label="Preț">
          <div className="flex gap-2">
            <input type="number" value={form.price_monthly} onChange={(e) => upd("price_monthly", e.target.value)} className={inputCls} />
            <select value={form.currency} onChange={(e) => upd("currency", e.target.value)} className={`${inputCls} w-28`}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </Field>
        <Field label="Tip proprietate">
          <select value={form.property_type} onChange={(e) => upd("property_type", e.target.value)} className={inputCls}>
            {TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </Field>
      </div>
      <textarea value={form.description} onChange={(e) => upd("description", e.target.value)} placeholder="Descriere" rows={3} className={`mt-3 ${inputCls}`} />

      {/* Locație */}
      <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-emerald">Locație</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Oraș">
          <select value={form.city} onChange={(e) => { upd("city", e.target.value); upd("zone", ""); }} className={inputCls}>
            <option value="">Oraș</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Zona / Cartier">
          <select value={form.zone} onChange={(e) => upd("zone", e.target.value)} disabled={!form.city} className={inputCls}>
            <option value="">Zonă</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </Field>
      </div>

      {/* Specificații */}
      <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-emerald">Specificații</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Camere"><input type="number" value={form.rooms} onChange={(e) => upd("rooms", e.target.value)} className={inputCls} /></Field>
        <Field label="Suprafață (mp)"><input type="number" value={form.surface_sqm} onChange={(e) => upd("surface_sqm", e.target.value)} className={inputCls} /></Field>
        <Field label="Etaj"><input value={form.floor} onChange={(e) => upd("floor", e.target.value)} placeholder="ex: 2/4" className={inputCls} /></Field>
        <Field label="Total etaje"><input type="number" value={form.total_floors} onChange={(e) => upd("total_floors", e.target.value)} className={inputCls} /></Field>
        <Field label="An construcție"><input type="number" value={form.building_year} onChange={(e) => upd("building_year", e.target.value)} className={inputCls} /></Field>
        <Field label="Depozit"><input type="number" value={form.deposit} onChange={(e) => upd("deposit", e.target.value)} className={inputCls} /></Field>
        <Field label="Disponibil din"><input type="date" value={form.available_from} onChange={(e) => upd("available_from", e.target.value)} className={inputCls} /></Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => upd("status", e.target.value)} className={inputCls}>
            {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.furnished} onChange={(e) => upd("furnished", e.target.checked)} /> Mobilat</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.pet_friendly} onChange={(e) => upd("pet_friendly", e.target.checked)} /> Pet friendly</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.parking} onChange={(e) => upd("parking", e.target.checked)} /> Parcare</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => upd("featured", e.target.checked)} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.commission_free} onChange={(e) => upd("commission_free", e.target.checked)} /> Fără comision</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.reserve_instant} onChange={(e) => upd("reserve_instant", e.target.checked)} /> Rezervare instantă</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_swap_available} onChange={(e) => upd("is_swap_available", e.target.checked)} /> Schimb de chirie</label>
      </div>

      {/* Contact */}
      <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-emerald">Contact & proprietar</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Telefon"><input value={form.phone} onChange={(e) => upd("phone", e.target.value)} placeholder="07xx..." className={inputCls} /></Field>
        <Field label="WhatsApp (internațional)"><input value={form.whatsapp_phone} onChange={(e) => upd("whatsapp_phone", e.target.value)} placeholder="407xx..." className={inputCls} /></Field>
        <Field label="Nume proprietar"><input value={form.owner_name} onChange={(e) => upd("owner_name", e.target.value)} className={inputCls} /></Field>
        <Field label="Rol vânzător">
          <select value={form.seller_role} onChange={(e) => upd("seller_role", e.target.value)} className={inputCls}>
            <option value="Proprietar">Proprietar</option>
            <option value="Agent">Agent</option>
          </select>
        </Field>
      </div>

      {/* Costuri & tur AI */}
      <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-emerald">Costuri & Tur 3D</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Estimare utilități/lună"><input type="number" value={form.monthly_utilities_estimate} onChange={(e) => upd("monthly_utilities_estimate", e.target.value)} className={inputCls} /></Field>
        <Field label="Întreținere/lună"><input type="number" value={form.maintenance_fee} onChange={(e) => upd("maintenance_fee", e.target.value)} className={inputCls} /></Field>
        <Field label="Opțiune garanție">
          <select value={form.deposit_option} onChange={(e) => upd("deposit_option", e.target.value)} className={inputCls}>
            {DEPOSIT_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Corectitudine preț">
          <select value={form.price_fairness} onChange={(e) => upd("price_fairness", e.target.value)} className={inputCls}>
            {FAIRNESS.map((f) => <option key={f.v} value={f.v}>{f.label}</option>)}
          </select>
        </Field>
        <Field label="Tur Video URL">
          <input value={form.ai_video_url} onChange={(e) => upd("ai_video_url", e.target.value)} placeholder="https://..." className={inputCls} />
        </Field>
      </div>

      {/* Badge-uri & verificări — admin only */}
      {isAdmin && (
        <>
          <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-emerald">Badge-uri & verificări (admin)</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nivel verificare">
              <select value={form.verification_level} onChange={(e) => upd("verification_level", e.target.value)} className={inputCls}>
                {VERIF.map((v) => <option key={v.v} value={v.v}>{v.label}</option>)}
              </select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-2"><input type="checkbox" checked={form.owner_verified} onChange={(e) => upd("owner_verified", e.target.checked)} /> Proprietar verificat</label>
            <label className="flex items-center gap-2 self-end pb-2"><input type="checkbox" checked={form.ai_tour_verified} onChange={(e) => upd("ai_tour_verified", e.target.checked)} /> Activare badge Tur 3D</label>
            <Field label="Link Tur 3D (Matterport — doar admin)">
              <input value={form.tour_3d_url} onChange={(e) => upd("tour_3d_url", e.target.value)} placeholder="https://my.matterport.com/show/?m=..." className={inputCls} />
            </Field>
          </div>
        </>
      )}

      <div className="mt-5 flex items-center gap-2">
        <Button type="submit" disabled={saving} className="bg-emerald text-white hover:bg-emerald/90">
          {saving ? "Salvez..." : "Salvează"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>Renunță</Button>
      </div>
    </form>
  );
}