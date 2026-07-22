import React from "react";

// Official VerifiCasa brand logo (circular golden seal: navy field, gold house,
// emerald checkmark). Used as the platform's primary identity.
export const LOGO_URL =
  "https://media.base44.com/images/public/6a5ef7d63008cd71560dfe14/4317025d6_Gemini_Generated_Image_al0itkal0itkal0i.png";

export default function VerifiCasaLogo({ size = 44, withWordmark = true, tagline = false, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={LOGO_URL}
        alt="VerifiCasa"
        style={{ height: size, width: size }}
        className="rounded-full object-cover ring-1 ring-gold/50"
      />
      {withWordmark && (
        <div className="leading-none">
          <span className="block font-heading text-lg font-extrabold tracking-tight text-navy">VerifiCasa</span>
          <span className="mt-0.5 block text-[8.5px] font-semibold uppercase tracking-[0.2em] text-gold">
            Inspecții & Verificări Imobiliare
          </span>
          {tagline && (
            <span className="mt-1 inline-flex rounded-full bg-emerald-soft px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-emerald">
              Platformă Verificată de Închirieri
            </span>
          )}
        </div>
      )}
    </div>
  );
}