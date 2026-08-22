import React from "react";

/**
 * ANPC SAL + SOL — obligatorii în subsolul oricărei firme din România.
 *
 * Erau două pastile mici cu textul „ANPC SAL" și „ODR · UE". Legea cere
 * bannerele, nu o abreviere: două casete albe, cu textul oficial cu majuscule
 * și butonul DETALII, care duc la paginile ANPC și la platforma europeană.
 *
 * Bannerele oficiale sunt desenate aici, nu sunt imagini luate de pe alt site:
 * un banner găzduit la ei dispare când îl mută, și atunci subsolul rămâne cu
 * două pătrate goale. Singura bucată care chiar trebuie să fie fișier este
 * stema ANPC; dacă lipsește, caseta rămâne întreagă și doar textul rămâne —
 * pune-o la public/images/legal/anpc-logo.png și apare singură.
 */

const ANPC_LOGO = "/images/legal/anpc-logo.png";

const BADGES = [
  {
    href: "https://anpc.ro/ce-este-sal/",
    logo: ANPC_LOGO,
    lines: ["Soluționarea alternativă", "a litigiilor"],
    label: "ANPC SAL",
  },
  {
    href: "https://consumer-redress.ec.europa.eu/site-relocation_en",
    logo: null,
    lines: ["Soluționarea online", "a litigiilor"],
    label: "SOL",
  },
];

export default function LegalBadges() {
  return (
    <div className="mt-3 flex flex-col gap-2.5">
      {BADGES.map((b) => (
        <a
          key={b.href}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={b.label}
          className="flex w-full max-w-[260px] items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-transparent transition-shadow hover:shadow-md hover:ring-emerald"
        >
          {b.logo && (
            <img
              src={b.logo}
              alt=""
              aria-hidden="true"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
              className="h-10 w-auto shrink-0 object-contain"
              loading="lazy"
            />
          )}
          <span className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
            <span className="text-[11px] font-extrabold uppercase leading-snug tracking-[0.02em] text-[#1b2a6b]">
              {b.lines.map((l) => (
                <React.Fragment key={l}>
                  {l}
                  <br />
                </React.Fragment>
              ))}
            </span>
            <span className="rounded-full bg-[#1b2a6b] px-3.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
              Detalii
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
