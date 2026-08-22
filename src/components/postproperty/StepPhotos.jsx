import React from "react";
import { Link } from "react-router-dom";
import { Upload, X, Loader2, Plus, Minus } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import { Field, inputCls } from "./wizardUi";
import { MIN_PHOTOS, MAX_PHOTOS, onlyPhoneDigits } from "@/lib/propertyPayload";
import { useWiz, SELLER_ROLE_EN } from "./wizardCopy";

// Turul 3D e o singură linie cu un link (cererea clientului, a doua oară:
// „small line and a link", nu banner). Locul bannerului l-a luat promovarea:
// alegi aici câte boost-uri pui pe anunț, iar publicarea le aplică.

export default function StepPhotos({
  form, set, uploading, onFiles, agreed, setAgreed,
  boostQty, setBoostQty, boostBalance,
}) {
  const { w, en } = useWiz();
  const urls = form.images ? form.images.split(",").filter(Boolean) : [];
  const removeAt = (i) => set({ images: urls.filter((_, idx) => idx !== i).join(",") });

  return (
    <div className="space-y-5">
      <div>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded border-2 border-dashed border-border bg-secondary/20 px-4 py-6 text-center sm:py-8 transition hover:border-emerald hover:bg-emerald-soft/30">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-emerald" /> : <Upload className="h-6 w-6 text-emerald" />}
          <span className="text-sm font-semibold text-navy dark:text-foreground">
            {uploading ? w.p_uploading : w.p_upload}
          </span>
          <span className="text-[11px] text-muted-foreground">{w.p_limits(MIN_PHOTOS, MAX_PHOTOS)}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </label>

        {urls.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {urls.map((u, i) => (
              <div key={u + i} className="group relative aspect-square overflow-hidden rounded bg-secondary">
                <UIImage src={u} fittingType="fill" className="h-full w-full" />
                <button type="button" onClick={() => removeAt(i)} aria-label={w.p_remove}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-emerald px-1.5 py-0.5 text-[9px] font-bold text-white">{w.p_cover}</span>}
              </div>
            ))}
          </div>
        )}
        <p className={"mt-2 text-xs font-semibold " + (urls.length >= MIN_PHOTOS ? "text-emerald" : "text-amber-600")}>
          {w.p_count(urls.length, MIN_PHOTOS)}
        </p>
      </div>

      {/* Turul 3D: o linie, un link, atât. */}
      <p className="text-xs text-muted-foreground">
        {w.p_tour_t} ·{" "}
        <Link to="/tur-3d" className="font-semibold text-emerald underline-offset-2 hover:underline">
          {w.p_tour_how}
        </Link>
      </p>

      {/* PROMOVARE — pe ultimul pas al formularului, după macheta clientului:
          titlu, soldul, minus/plus. Cantitatea se aplică la Publică; linkul de
          cumpărare se deschide în filă nouă ca formularul să nu se piardă. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{w.p_boost_t}</p>
          <p className="text-xs text-muted-foreground">
            {boostBalance > 0 ? w.p_boost_have(boostBalance) : w.p_boost_none}
            {" · "}
            <a
              href="/upgrade"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald underline-offset-2 hover:underline"
            >
              {boostBalance > 0 ? w.p_boost_more : w.p_boost_buy}
            </a>
          </p>
          {boostQty > 0 && (
            <p className="mt-1 text-[11px] text-muted-foreground/80">{w.p_boost_note}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setBoostQty((n) => Math.max(0, n - 1))}
            disabled={boostQty <= 0}
            aria-label="-1"
            className="tap-44 flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-emerald disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-7 text-center text-base font-bold tnum text-foreground">{boostQty}</span>
          <button
            type="button"
            onClick={() => setBoostQty((n) => Math.min(boostBalance, n + 1))}
            disabled={boostQty >= boostBalance}
            aria-label="+1"
            className="tap-44 flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-emerald disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={w.p_phone} required>
          <input inputMode="numeric" value={form.phone} onChange={(e) => set({ phone: onlyPhoneDigits(e.target.value) })} placeholder="0759..." className={inputCls} />
        </Field>
        <Field label={w.p_whatsapp} hint={w.p_whatsapp_hint}>
          <input inputMode="tel" value={form.whatsapp_phone} onChange={(e) => set({ whatsapp_phone: onlyPhoneDigits(e.target.value) })} placeholder="40759..." className={inputCls} />
        </Field>
        <Field label={w.p_name} hint={w.p_name_hint}>
          <input
            value={form.owner_name}
            readOnly
            placeholder={w.p_name_ph}
            className={inputCls + " cursor-not-allowed bg-secondary/40 text-muted-foreground"}
          />
        </Field>
        <Field label={w.p_role}>
          {/* Valorile rămân în română: seller_role se salvează în entitate. */}
          <select value={form.seller_role} onChange={(e) => set({ seller_role: e.target.value })} className={inputCls}>
            <option value="Proprietar">{en ? SELLER_ROLE_EN.Proprietar : "Proprietar"}</option>
            <option value="Agent">{en ? SELLER_ROLE_EN.Agent : "Agent"}</option>
          </select>
        </Field>
      </div>

      <label className="flex items-start gap-2 rounded border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-border accent-emerald" />
        <span className="leading-relaxed">
          {w.p_terms_pre}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald hover:underline">{w.p_terms}</a>
          {w.p_and}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald hover:underline">{w.p_privacy}</a>.
          <span className="mt-1 block text-xs text-muted-foreground/70">{w.p_terms_note}</span>
        </span>
      </label>
    </div>
  );
}
