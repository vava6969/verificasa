import React from "react";
import { Link } from "react-router-dom";
import { Upload, X, Loader2 } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import { Field, inputCls } from "./wizardUi";
import { MIN_PHOTOS, MAX_PHOTOS, onlyPhoneDigits } from "@/lib/propertyPayload";

export default function StepPhotos({ form, set, uploading, onFiles, agreed, setAgreed }) {
  const urls = form.images ? form.images.split(",").filter(Boolean) : [];
  const removeAt = (i) => set({ images: urls.filter((_, idx) => idx !== i).join(",") });

  return (
    <div className="space-y-5">
      <div>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-secondary/20 px-4 py-8 text-center transition hover:border-emerald hover:bg-emerald-soft/30">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-emerald" /> : <Upload className="h-6 w-6 text-emerald" />}
          <span className="text-sm font-semibold text-navy dark:text-foreground">
            {uploading ? "Se încarcă…" : "Încarcă pozele"}
          </span>
          <span className="text-[11px] text-muted-foreground">Minim {MIN_PHOTOS}, maxim {MAX_PHOTOS} · JPG / PNG</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </label>

        {urls.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {urls.map((u, i) => (
              <div key={u + i} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary">
                <UIImage src={u} fittingType="fill" className="h-full w-full" />
                <button type="button" onClick={() => removeAt(i)} aria-label="Șterge poza"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 rounded-full bg-emerald px-1.5 py-0.5 text-[9px] font-bold text-white">Copertă</span>}
              </div>
            ))}
          </div>
        )}
        <p className={"mt-2 text-xs font-semibold " + (urls.length >= MIN_PHOTOS ? "text-emerald" : "text-amber-600")}>
          {urls.length} / {MIN_PHOTOS} poze minime
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Telefon" required>
          <input inputMode="numeric" value={form.phone} onChange={(e) => set({ phone: onlyPhoneDigits(e.target.value) })} placeholder="0759..." className={inputCls} />
        </Field>
        <Field label="WhatsApp" hint="Format internațional, ex: 40759...">
          <input inputMode="tel" value={form.whatsapp_phone} onChange={(e) => set({ whatsapp_phone: onlyPhoneDigits(e.target.value) })} placeholder="40759..." className={inputCls} />
        </Field>
        <Field label="Nume afișat">
          <input value={form.owner_name} onChange={(e) => set({ owner_name: e.target.value })} placeholder="Nume proprietar" className={inputCls} />
        </Field>
        <Field label="Postez ca">
          <select value={form.seller_role} onChange={(e) => set({ seller_role: e.target.value })} className={inputCls}>
            <option value="Proprietar">Proprietar</option>
            <option value="Agent">Agent</option>
          </select>
        </Field>
      </div>

      <label className="flex items-start gap-2 rounded-xl border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-border accent-emerald" />
        <span className="leading-relaxed">
          Sunt de acord cu{" "}
          <Link to="/terms" className="font-semibold text-emerald hover:underline">Termenii</Link> și{" "}
          <Link to="/privacy" className="font-semibold text-emerald hover:underline">Politica de confidențialitate</Link>.
        </span>
      </label>
    </div>
  );
}