import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCountry } from "@/components/CountryContext";

// „De ce VerifiCasa" — nouă cipuri: iconița lucioasă, titlul și O singură
// linie de explicație. Iconițele sunt normalizate la aceeași umplere optică
// (scripts în scratchpad), deci cutia de 48px le randează egale.
//
// Mișcarea: fiecare cip sare în pagină cu un arc scurt (spring), decalat
// puțin — o singură mișcare jucăușă, nu confetti. Hover: iconița crește și
// se înclină un grad, ca o jucărie. Respectă prefers-reduced-motion.
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

const pop = {
  hidden: { opacity: 0, scale: 0.6, y: 14 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 22 },
  },
};

function Chip({ item, t, en, reduced }) {
  return (
    <motion.div
      variants={reduced ? undefined : pop}
      whileHover={reduced ? undefined : { y: -3 }}
      className="flex w-[210px] shrink-0 snap-start items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm sm:w-auto sm:p-4"
    >
      <motion.img
        src={item.img}
        alt=""
        aria-hidden="true"
        whileHover={reduced ? undefined : { scale: 1.12, rotate: -2 }}
        transition={{ type: "spring", stiffness: 380, damping: 16 }}
        className="h-12 w-12 shrink-0 object-contain drop-shadow-sm"
        loading="lazy"
      />
      <div className="min-w-0">
        <p className="text-[13px] font-bold leading-tight text-foreground sm:text-sm">{t(`${item.key}_t`)}</p>
        <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground sm:text-xs sm:whitespace-normal">
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

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
        {en ? "Why VerifiCasa" : "De ce VerifiCasa"}
      </h2>

      <motion.div
        initial={reduced ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-7 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
      >
        {ITEMS.map((item) => (
          <Chip key={item.key} item={item} t={t} en={en} reduced={reduced} />
        ))}
      </motion.div>
    </section>
  );
}
