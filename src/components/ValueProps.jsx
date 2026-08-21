import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCountry } from "@/components/CountryContext";

// „De ce VerifiCasa" — nouă cipuri: iconița lucioasă, titlul și O singură
// linie de explicație. Iconițele sunt normalizate la aceeași umplere optică,
// deci cutia pătrată le randează egale.
//
// Pe telefon banda se plimbă singură, încet, la nesfârșit, și se oprește în
// clipa în care omul o atinge — nu-i smulge degetul de pe ecran. Pe desktop
// e o grilă statică, unde nu are ce să câștige din mișcare.
const ITEMS = [
  { key: "vp2", img: "/images/generated/icon-shield-check.png", cap: { ro: "Poze, acte și preț, verificate", en: "Photos, papers and price, checked" } },
  { key: "vp4", img: "/images/generated/icon-document-check.png", cap: { ro: "Măsurători și acte, la dosar", en: "Measurements and papers on file" } },
  { key: "vp8", img: "/images/generated/icon-percent-badge.png", cap: { ro: "Comparat cu piața locală", en: "Compared with the local market" } },
  { key: "vp1", img: "/images/generated/icon-video.png", cap: { ro: "Vezi locuința din telefon", en: "Walk it from your phone" } },
  { key: "vp3", img: "/images/generated/icon-coins.png", cap: { ro: "Fără taxe ascunse", en: "No hidden fees" } },
  { key: "vp7", img: "/images/generated/icon-clock.png", cap: { ro: "Vezi totul înainte de drum", en: "See it all before you go" } },
  { key: "vp5", img: "/images/generated/icon-users-check.png", cap: { ro: "Doar cereri serioase", en: "Serious requests only" } },
  { key: "vp6", img: "/images/generated/icon-flag.png", cap: { ro: "Semnalezi, verificăm direct", en: "You flag it, we check it" } },
  { key: "vp9", img: "/images/generated/icon-chat.png", cap: { ro: "Experiențe reale, nefiltrate", en: "Real, unfiltered experiences" } },
];

function Chip({ item, t, en, reduced }) {
  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -3 }}
      className="flex w-[152px] shrink-0 items-center gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-sm sm:w-auto sm:gap-3 sm:p-4"
    >
      <motion.img
        src={item.img}
        alt=""
        aria-hidden="true"
        whileHover={reduced ? undefined : { scale: 1.12, rotate: -2 }}
        transition={{ type: "spring", stiffness: 380, damping: 16 }}
        className="h-9 w-9 shrink-0 object-contain drop-shadow-sm sm:h-12 sm:w-12"
        loading="lazy"
      />
      <div className="min-w-0">
        <p className="text-[11.5px] font-bold leading-tight text-foreground sm:text-sm">{t(`${item.key}_t`)}</p>
        <p className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground sm:text-xs sm:whitespace-normal">
          {en ? item.cap.en : item.cap.ro}
        </p>
      </div>
    </motion.div>
  );
}

export default function ValueProps() {
  const { t, lang } = useCountry();
  const en = lang === "en";
  const reduced = useReducedMotion();
  const railRef = useRef(null);
  // Pauza stă într-un ref, nu în state: dacă ar fi state, fiecare atingere ar
  // reporni efectul, iar un `mouseenter` rămas agățat ar opri banda definitiv.
  const pausedRef = useRef(false);

  // Derulare continuă pe telefon. Lista e dublată, iar când prima copie s-a
  // consumat sărim înapoi la zero — bucla nu se vede.
  useEffect(() => {
    if (reduced) return undefined;
    const rail = railRef.current;
    if (!rail) return undefined;
    const phone = window.matchMedia("(max-width: 639px)");
    if (!phone.matches) return undefined;

    const TICK = 40;   // ms
    const SPEED = 26;  // px pe secundă — lent, nu distrage de la conținut
    let carry = 0;     // scrollLeft e întreg; acumulăm subunitățile

    const id = setInterval(() => {
      if (pausedRef.current) return;
      const half = rail.scrollWidth / 2;
      if (half <= 0) return;
      carry += (SPEED * TICK) / 1000;
      if (carry < 1) return;
      const whole = Math.floor(carry);
      carry -= whole;
      const next = rail.scrollLeft + whole;
      rail.scrollLeft = next >= half ? next - half : next;
    }, TICK);
    return () => clearInterval(id);
  }, [reduced]);

  // Doar atingerea reală oprește banda. Fără pauză pe hover: pe desktop asta e
  // oricum o grilă, iar un hover agățat ar îngheța-o pe telefon.
  const hold = () => { pausedRef.current = true; };
  const release = () => {
    // scurt răgaz după ce ridici degetul, ca inerția de scroll să se stingă
    setTimeout(() => { pausedRef.current = false; }, 900);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h2 className="text-xl font-bold text-foreground sm:text-3xl">
        {en ? "Why VerifiCasa" : "De ce VerifiCasa"}
      </h2>

      <motion.div
        ref={railRef}
        onPointerDown={hold}
        onPointerUp={release}
        onPointerCancel={release}
        onTouchStart={hold}
        onTouchEnd={release}
        className="vc-rail -mx-4 mt-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-7 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
      >
        {ITEMS.map((item) => (
          <Chip key={item.key} item={item} t={t} en={en} reduced={reduced} />
        ))}
        {/* Copia care face bucla continuă. Ascunsă pe desktop, unde e o grilă. */}
        {ITEMS.map((item) => (
          <div key={`loop-${item.key}`} aria-hidden="true" className="contents sm:hidden">
            <Chip item={item} t={t} en={en} reduced={reduced} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
