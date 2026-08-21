import React from "react";
import { Reveal } from "@/components/ui/reveal";
import { Stamp, Ledger, LedgerRow, Hairline } from "@/components/fisa";
import { PARTNERS } from "@/lib/partners";

// Directorul de parteneri — formă de registru: fiecare partener e o fișă
// riglată (logo într-o ramă neutră, ce face concret, ce primești cu codul
// VerifiCasa, link extern). Construit pentru n parteneri de la început.
export default function Parteneri() {

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Reveal>
        <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">Parteneri</h1>
        <p className="mt-3 max-w-[58ch] text-muted-foreground">
          Nu ne crezi pe cuvânt? Bine. Partenerii de mai jos verifică proprietățile
          independent de noi, cu propriile date și propriile metode. Codul VerifiCasa
          îți aduce reducere la fiecare.
        </p>
      </Reveal>

      <div className="mt-8 space-y-8">
        {PARTNERS.map((p) => (
          <Reveal key={p.id}>
            <article className="border border-border bg-card">
              {/* logo în ramă neutră — verdele lor nu se amestecă cu al nostru */}
              <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <h2 className="truncate font-heading text-xl font-semibold text-foreground">{p.name}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.tagline}</p>
                </div>
                <div className="flex h-14 w-32 shrink-0 items-center justify-center border border-border bg-white p-2">
                  <img src={p.logo} alt={p.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                </div>
              </div>

              <div className="px-5 py-4 sm:px-6">
                <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{p.description}</p>

                <Ledger className="mt-4">
                  {p.services.map((s) => (
                    <LedgerRow key={s} label={s} value="inclus" />
                  ))}
                </Ledger>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Stamp tone="verde">Cod {p.code}</Stamp>
                    <span className="text-sm font-semibold text-foreground">{p.discount}</span>
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded bg-emerald px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90"
                  >
                    Verifică pe {p.name.toLowerCase().replace(/\s/g, "")}.ro <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Hairline className="mt-10" />
      <p className="mt-4 text-xs text-muted-foreground">
        Partenerii sunt servicii independente. Reducerea se aplică pe site-ul lor, cu codul de mai sus.
      </p>
    </div>
  );
}
