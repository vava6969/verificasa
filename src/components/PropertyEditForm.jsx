import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getCities, getZones } from "@/components/locations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Compact edit form for an existing property. Save updates the Property entity.
export default function PropertyEditForm({ property, onDone }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: property.title || "",
    description: property.description || "",
    price_monthly: property.price_monthly ?? "",
    city: property.city || "",
    zone: property.zone || "",
    property_type: property.property_type || "Garsonieră",
    rooms: property.rooms ?? 1,
    surface_sqm: property.surface_sqm ?? "",
    floor: property.floor || "",
    furnished: !!property.furnished,
    pet_friendly: !!property.pet_friendly,
    parking: !!property.parking,
    status: property.status || "Activ",
  });
  const [saving, setSaving] = useState(false);

  const cities = useMemo(() => getCities("RO"), []);
  const zones = useMemo(() => getZones("RO", form.city), [form.city]);
  const inputCls = "w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-emerald";

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price_monthly || !form.city) {
      toast({ title: "Completează câmpurile obligatorii", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.Property.update(property.id, {
        title: form.title,
        description: form.description,
        price_monthly: Number(form.price_monthly),
        city: form.city,
        zone: form.zone,
        property_type: form.property_type,
        rooms: Number(form.rooms),
        surface_sqm: form.surface_sqm ? Number(form.surface_sqm) : null,
        floor: form.floor,
        furnished: form.furnished,
        pet_friendly: form.pet_friendly,
        parking: form.parking,
        status: form.status,
        ai_video_url: property.ai_video_url || "",
      });
      toast({ title: "Anunț actualizat" });
      onDone();
    } catch (err) {
      toast({ title: "Eroare la salvare", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const TYPES = ["Garsonieră", "2 Camere", "3 Camere", "4+ Camere", "Casă", "Studio"];
  const STATUS = ["Activ", "Rezervat", "Închis"];

  return (
    <form onSubmit={handleSubmit} className="mt-3 rounded-2xl border border-emerald/30 bg-emerald-soft/40 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={form.title} onChange={(e) => upd("title", e.target.value)} placeholder="Titlu" className={inputCls} />
        <select value={form.property_type} onChange={(e) => upd("property_type", e.target.value)} className={inputCls}>
          {TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
        </select>
        <select value={form.city} onChange={(e) => { upd("city", e.target.value); upd("zone", ""); }} className={inputCls}>
          <option value="">Oraş</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={form.zone} onChange={(e) => upd("zone", e.target.value)} disabled={!form.city} className={inputCls}>
          <option value="">Zona / Cartier</option>
          {zones.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        <input type="number" value={form.price_monthly} onChange={(e) => upd("price_monthly", e.target.value)} placeholder="Preț /lună (€)" className={inputCls} />
        <input type="number" value={form.rooms} onChange={(e) => upd("rooms", e.target.value)} placeholder="Camere" className={inputCls} />
        <input type="number" value={form.surface_sqm} onChange={(e) => upd("surface_sqm", e.target.value)} placeholder="Suprafață (mp)" className={inputCls} />
        <input value={form.floor} onChange={(e) => upd("floor", e.target.value)} placeholder="Etaj (ex: 2/4)" className={inputCls} />
        <select value={form.status} onChange={(e) => upd("status", e.target.value)} className={inputCls}>
          {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <textarea value={form.description} onChange={(e) => upd("description", e.target.value)} placeholder="Descriere" rows={2} className={`mt-3 ${inputCls}`} />

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.furnished} onChange={(e) => upd("furnished", e.target.checked)} /> Mobilat</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.pet_friendly} onChange={(e) => upd("pet_friendly", e.target.checked)} /> Pet friendly</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.parking} onChange={(e) => upd("parking", e.target.checked)} /> Parcare</label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button type="submit" disabled={saving} className="bg-emerald text-white hover:bg-emerald/90">
          {saving ? "Salvez..." : "Salvează"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>Renunță</Button>
      </div>
    </form>
  );
}