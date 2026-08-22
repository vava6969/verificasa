import React from "react";

// Sigla oficială VerifiCasa, fișierele primite de la client.
//
// Marca e un lockup „VC": V-ul e bifa din stânga, C-ul din dreapta cuprinde o
// casă cu fereastră. Nu conține text — cuvântul „VerifiCasa" se scrie alături,
// aici, cu fontul aplicației.
//
// Două fișiere, nu unul recolorat: alb pentru fundaluri închise (subsol, peste
// fotografii), negru pentru hârtie. Se folosesc CA ATARE, prin <img> — nu le
// recolorăm și nu le redesenăm, ca să rămână exact artwork-ul oficial.
//
// viewBox-ul fișierelor din public/ e strâns pe conturul desenului
// (58.3 102.9 345 230.2, măsurat cu getBBox pe fiecare formă vizibilă).
// Originalele aveau pânza de 432×432 cu desenul descentrat în ea, deci sigla
// s-ar fi văzut la ~53% din casetă și lipită spre dreapta. Raportul e 3:2.

const MARK_DARK = "/images/brand/verificasa-mark.svg";
const MARK_LIGHT = "/images/brand/verificasa-mark-white.svg";

// lățime / înălțime, din viewBox-ul de mai sus
const MARK_RATIO = 345 / 230.2;

export default function VerifiCasaLogo({
  size = 40,
  withWordmark = true,
  wordmark, // alias vechi — wordmark={false} înseamnă doar sigla
  tagline = false,
  tone = "dark", // dark = tuș pe hârtie, light = alb peste fotografie/fundal închis
  className = "",
}) {
  const showWordmark = wordmark === false ? false : withWordmark;
  const src = tone === "light" ? MARK_LIGHT : MARK_DARK;

  // Sigla e lată (3:2), deci înălțimea o dă `size`, nu lățimea — altfel ar
  // crește peste rândul în care stă.
  const markH = Math.round(size * 0.62);
  const markW = Math.round(markH * MARK_RATIO);

  const Mark = (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={markW}
      height={markH}
      className="shrink-0 object-contain"
      style={{ width: markW, height: markH }}
    />
  );

  // Doar sigla — acolo unde spațiul e strâns (avatarul din conversații).
  if (!showWordmark) {
    return (
      <span
        className={`inline-flex items-center justify-center ${className}`}
        role="img"
        aria-label="VerifiCasa"
      >
        {Mark}
      </span>
    );
  }

  const inkCls = tone === "light" ? "text-white" : "text-foreground";
  const casaCls = tone === "light" ? "text-white/80" : "text-emerald";
  const fs = Math.round(size * 0.52);

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-2 ${className}`}
      role="img"
      aria-label="VerifiCasa"
    >
      {Mark}
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-body font-black" style={{ fontSize: fs, letterSpacing: "-0.025em" }}>
          <span className={inkCls}>Verifi</span>
          <span className={casaCls}>Casa</span>
        </span>
        {tagline && (
          <span
            className={`mt-1 text-[10px] font-semibold ${tone === "light" ? "text-white/70" : "text-muted-foreground"}`}
          >
            Inspecții și verificări imobiliare
          </span>
        )}
      </span>
    </span>
  );
}
