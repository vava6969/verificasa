import React from "react";
import { Field, ChoiceCard, inputCls } from "./wizardUi";

const TYPES = [
  { v: "Garsonieră", e: "🚪" }, { v: "2 Camere", e: "🛏️" }, { v: "3 Camere", e: "🏠" },
  { v: "4+ Camere", e: "🏘️" }, { v: "Casă", e: "🏡" }, { v: "Studio", e: "🎬" },
];

export default function StepBasics({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Ce vrei să faci?</p>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceCard emoji="🔑" title="Închiriere" sub="Chirie lunară" active={form.transaction_type === "RENT"} onClick={() => set({ transaction_type: "RENT" })} />
          <ChoiceCard emoji="💰" title="Vânzare" sub="Preț total" active={form.transaction_type === "SALE"} onClick={() => set({ transaction_type: "SALE" })} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Tip proprietate</p>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((tp) => (
            <ChoiceCard key={tp.v} emoji={tp.e} title={tp.v} active={form.property_type === tp.v} onClick={() => set({ property_type: tp.v })} />
          ))}
        </div>
      </div>

      <Field label="Titlul anunțului" required hint="Ex: Apartament 2 camere modern, Copou — renovat 2023">
        <input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Scrie un titlu scurt și clar" className={inputCls} />
      </Field>
    </div>
  );
}