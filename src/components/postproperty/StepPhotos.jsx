import React from "react";
import { Link } from "react-router-dom";
import { Upload, X, Loader2, ArrowUpRight } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import { Field, inputCls } from "./wizardUi";
import { MIN_PHOTOS, MAX_PHOTOS, onlyPhoneDigits } from "@/lib/propertyPayload";
import { TOUR_3D_APP_URL } from "@/lib/appLinks";

// Aplicația de captură 3D. Cât timp `TOUR_3D_APP_URL` e null, butonul stă stins
// și marcat „În curând" — nu trimitem proprietarul într-o filă goală. Link-ul
// către explicații merge însă de pe acum: pagina /tur-3d există chiar dacă
// aplicația nu, deci omul are unde să afle ce urmează.

export default function StepPhotos({ form, set, uploading, onFiles, agreed, setAgreed }) {
  const urls = form.images ? form.images.split(",").filter(Boolean) : [];
  const removeAt = (i) => set({ images: urls.filter((_, idx) => idx !== i).join(",") });

  return (
    <div className="space-y-5">
      <div>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded border-2 border-dashed border-border bg-secondary/20 px-4 py-8 text-center transition hover:border-emerald hover:bg-emerald-soft/30">
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
              <div key={u + i} className="group relative aspect-square overflow-hidden rounded bg-secondary">
                <UIImage src={u} fittingType="fill" className="h-full w-full" />
                <button type="button" onClick={() => removeAt(i)} aria-label="Șterge poza"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-emerald px-1.5 py-0.5 text-[9px] font-bold text-white">Copertă</span>}
              </div>
            ))}
          </div>
        )}
        <p className={"mt-2 text-xs font-semibold " + (urls.length >= MIN_PHOTOS ? "text-emerald" : "text-amber-600")}>
          {urls.length} / {MIN_PHOTOS} poze minime
        </p>
      </div>

      {/* Tur 3D (opțional) — aceeași casetă ca în formularul de editare, dar
          aici capătă și butonul care deschide aplicația de captură. Turul nu e
          o condiție ca să publici: rămâne un pas separat, făcut după poze. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/images/generated/icon-video.png"
            alt=""
            aria-hidden="true"
            className={"h-12 w-12 shrink-0 object-contain" + (TOUR_3D_APP_URL ? "" : " opacity-60")}
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-navy dark:text-foreground">Tur 3D (opțional)</span>
            <span className="block text-xs text-muted-foreground">
              Îl faci cu aplicația noastră, din telefon · Plan Pro
            </span>
            <Link
              to="/tur-3d"
              className="mt-1 inline-flex text-xs font-semibold text-emerald underline-offset-2 hover:underline"
            >
              Cum funcționează
            </Link>
          </span>
        </div>

        {TOUR_3D_APP_URL ? (
          <a
            href={TOUR_3D_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-emerald px-5 text-sm font-bold text-white shadow-soft transition hover:bg-emerald/90 active:scale-[0.98]"
          >
            Deschide aplicația 3D
            <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : (
          // Fără URL nu desenăm un buton: un dreptunghi rotunjit care arată
          // exact ca butonul de alături cere să fie apăsat și nu face nimic,
          // iar motivul stătea doar în `title` — invizibil pe telefon. O
          // pastilă de stare spune adevărul fără să promită o acțiune.
          <span className="shrink-0 rounded-full bg-gold-soft px-3 py-1.5 text-xs font-semibold text-gold-deep">
            În curând
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Telefon" required>
          <input inputMode="numeric" value={form.phone} onChange={(e) => set({ phone: onlyPhoneDigits(e.target.value) })} placeholder="0759..." className={inputCls} />
        </Field>
        <Field label="WhatsApp" hint="Format internațional, ex: 40759...">
          <input inputMode="tel" value={form.whatsapp_phone} onChange={(e) => set({ whatsapp_phone: onlyPhoneDigits(e.target.value) })} placeholder="40759..." className={inputCls} />
        </Field>
        <Field label="Nume afișat" hint="Preluat automat din contul tău">
          <input
            value={form.owner_name}
            readOnly
            placeholder="Nume proprietar"
            className={inputCls + " cursor-not-allowed bg-secondary/40 text-muted-foreground"}
          />
        </Field>
        <Field label="Postez ca">
          <select value={form.seller_role} onChange={(e) => set({ seller_role: e.target.value })} className={inputCls}>
            <option value="Proprietar">Proprietar</option>
            <option value="Agent">Agent</option>
          </select>
        </Field>
      </div>

      <label className="flex items-start gap-2 rounded border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-border accent-emerald" />
        <span className="leading-relaxed">
          Sunt de acord cu{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald hover:underline">Termenii</a> și{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald hover:underline">Politica de confidențialitate</a>.
          <span className="mt-1 block text-xs text-muted-foreground/70">Se deschid într-o pagină nouă — nu pierzi ce ai scris.</span>
        </span>
      </label>
    </div>
  );
}