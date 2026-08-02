import React, { useMemo } from "react";
import { MapPin } from "lucide-react";
import { getCities, getZones } from "@/components/locations";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";
import { Field, inputCls } from "./wizardUi";

export default function StepLocation({ form, set, country }) {
  const cities = useMemo(() => getCities(country), [country]);
  const zones = useMemo(() => getZones(country, form.city), [country, form.city]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Oraș" required>
          <select value={form.city} onChange={(e) => set({ city: e.target.value, zone: "" })} className={inputCls}>
            <option value="">Alege orașul</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Zonă / Cartier">
          <select value={form.zone} onChange={(e) => set({ zone: e.target.value })} disabled={!form.city} className={inputCls}>
            <option value="">Alege zona</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </Field>
      </div>

      <div className="rounded-2xl border border-emerald/30 bg-emerald-soft/40 p-4 dark:bg-emerald-soft/10">
        <p className="flex items-center gap-2 font-heading text-sm font-bold text-navy dark:text-foreground">
          <MapPin className="h-4 w-4 text-emerald" /> Locație exactă pe hartă
        </p>
        <GooglePlacesAutocomplete
          value={form.landmark}
          onChange={(v) => set({ landmark: v })}
          onPlace={(place) => set({
            landmark: place.name || form.landmark,
            latitude: place.lat != null ? place.lat : form.latitude,
            longitude: place.lng != null ? place.lng : form.longitude,
          })}
          placeholder="Caută adresa (ex: Strada Nicolae Iorga, Iași)…"
          className="mt-2 w-full rounded-xl border border-emerald/50 bg-white px-3.5 py-3 text-base text-foreground outline-none focus:border-emerald dark:bg-card"
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Selectează adresa din sugestii — coordonatele GPS se salvează automat.
        </p>
      </div>
    </div>
  );
}