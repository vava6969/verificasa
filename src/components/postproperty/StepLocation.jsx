import React from "react";
import { MapPin } from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";
import { Field, inputCls } from "./wizardUi";

export default function StepLocation({ form, set, country }) {
  return (
    <div className="space-y-5">
      <Field label="Oraș și zonă" required>
        <div className={inputCls}>
          <LocationAutocomplete
            country={country}
            value={{ city: form.city, zone: form.zone }}
            onSelect={({ city, zone }) => set({ city, zone })}
            placeholder="Scrie orașul (ex: Cluj-Napoca)"
            includeCounties={false}
            icon={MapPin}
          />
        </div>
      </Field>

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