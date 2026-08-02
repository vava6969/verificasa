import React from "react";
import DateField from "@/components/DateField";
import { Field, inputCls } from "./wizardUi";
import { onlyDigits } from "@/lib/propertyPayload";

export default function StepDetails({ form, set }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={form.transaction_type === "SALE" ? "Preț (EUR)" : "Chirie / lună (EUR)"} required>
          <input type="number" inputMode="numeric" value={form.price_monthly} onChange={(e) => set({ price_monthly: e.target.value })} placeholder="450" className={inputCls} />
        </Field>
        <Field label="Depozit / Garanție (EUR)">
          <input type="number" inputMode="numeric" value={form.deposit} onChange={(e) => set({ deposit: e.target.value })} placeholder="450" className={inputCls} />
        </Field>
        <Field label="Camere" required>
          <input type="number" inputMode="numeric" value={form.rooms} onChange={(e) => set({ rooms: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Suprafață (mp)" required>
          <input type="number" inputMode="numeric" value={form.surface_sqm} onChange={(e) => set({ surface_sqm: e.target.value })} placeholder="52" className={inputCls} />
        </Field>
        <Field label="Etaj" required hint="Ex: 3, Parter, Demisol">
          <input value={form.floor} onChange={(e) => set({ floor: e.target.value })} placeholder="3" className={inputCls} />
        </Field>
        <Field label="Total etaje clădire">
          <input inputMode="numeric" value={form.total_floors} onChange={(e) => set({ total_floors: onlyDigits(e.target.value, 3) })} placeholder="10" className={inputCls} />
        </Field>
        <Field label="An construcție">
          <input inputMode="numeric" value={form.building_year} onChange={(e) => set({ building_year: onlyDigits(e.target.value, 4) })} placeholder="2005" className={inputCls} />
        </Field>
        <Field label="Disponibil din">
          <DateField value={form.available_from} onChange={(e) => set({ available_from: e.target.value })} placeholder="Disponibil din" className="w-full" />
        </Field>
      </div>

      <Field label="Descriere" hint="Spune ce face locul special — lumină, vecinătate, renovări recente.">
        <textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={4} placeholder="Descrie proprietatea…" className={inputCls} />
      </Field>
    </div>
  );
}