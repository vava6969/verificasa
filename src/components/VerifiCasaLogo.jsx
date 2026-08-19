import React from "react";

// Official VerifiCasa brand logo (circular golden seal: navy field, gold house,
// emerald checkmark). Used as the platform's primary identity.
export const LOGO_URL =
  "https://media.base44.com/images/public/6a5ef7d63008cd71560dfe14/4317025d6_Gemini_Generated_Image_al0itkal0itkal0i.png";

export default function VerifiCasaLogo({ size = 44, withWordmark = true, tagline = false, className = "", tone = "dark" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={LOGO_URL}
        alt="VerifiCasa"
        style={{ height: size, width: size }}
        className="rounded-full object-cover ring-1 ring-gold/50"
      />
      {withWordmark && (
        <div className="min-w-0 leading-none">
          <span className={`block truncate font-heading text-base font-semibold tracking-tight ${tone === "light" ? "text-white" : "text-navy"} sm:text-lg`}>VerifiCasa</span>
          <span className={`mt-0.5 hidden whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.12em] lg:block ${tone === "light" ? "text-white/60" : "text-muted-foreground"}`}>
            Inspecții & Verificări Imobiliare
          </span>
          {tagline && (
            <span className="stamp-line mt-1 inline-flex text-emerald">
              Platformă Verificată de Închirieri
            </span>
          )}
        </div>
      )}
    </div>
  );
}