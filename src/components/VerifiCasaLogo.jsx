import React from "react";

// VerifiCasa wordmark — option A, chosen by Megan + Andrei's "blocky" brief:
// Hanken Grotesk Black, "Verifi" in ink and "Casa" in verde, tight tracking.
// No plaque, no gradient, no seal image — the mark is type, and it survives
// at app-icon size, on photographs, and inside the verification stamp.
// Kept export for legacy imports; no longer rendered.
export const LOGO_URL =
  "https://media.base44.com/images/public/6a5ef7d63008cd71560dfe14/4317025d6_Gemini_Generated_Image_al0itkal0itkal0i.png";

export default function VerifiCasaLogo({
  size = 40,
  withWordmark = true,
  wordmark, // legacy alias — wordmark={false} means mark-only
  tagline = false,
  tone = "dark", // dark = ink on paper, light = paper text over photo/ink
  className = "",
}) {
  const showWordmark = wordmark === false ? false : withWordmark;
  const inkCls = tone === "light" ? "text-white" : "text-foreground";
  const casaCls = tone === "light" ? "text-white/80" : "text-emerald";

  // Mark-only: a compact stamped VC block (used where space is tight).
  if (!showWordmark) {
    return (
      <span
        className={`inline-flex items-center justify-center border-2 font-body font-black leading-none ${tone === "light" ? "border-white text-white" : "border-emerald text-emerald"} ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.42, letterSpacing: "-0.02em", borderRadius: 2 }}
        aria-label="VerifiCasa"
      >
        VC
      </span>
    );
  }

  const fs = Math.round(size * 0.56);
  return (
    <span className={`inline-flex min-w-0 flex-col leading-none ${className}`} aria-label="VerifiCasa">
      <span
        className="truncate font-body font-black"
        style={{ fontSize: fs, letterSpacing: "-0.025em" }}
      >
        <span className={inkCls}>Verifi</span>
        <span className={casaCls}>Casa</span>
      </span>
      {tagline && (
        <span className={`mt-1 text-[10px] font-semibold ${tone === "light" ? "text-white/70" : "text-muted-foreground"}`}>
          Inspecții și verificări imobiliare
        </span>
      )}
    </span>
  );
}
