import React from "react";
import { useCountry } from "@/components/CountryContext";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

// „De ce VerifiCasa" — iconițele lucioase ale aplicației și titlul. Atât.
// Cele nouă paragrafe explicative au dispărut: nimeni nu le citea, iar
// clientul a cerut mai puține cuvinte și mai multe imagini. Descrierea rămâne
// doar ca tooltip pentru cine chiar vrea detaliul.
const ITEMS = [
  { key: "vp2", img: "/images/generated/icon-shield-check.png" },
  { key: "vp4", img: "/images/generated/icon-document-check.png" },
  { key: "vp8", img: "/images/generated/icon-percent-badge.png" },
  { key: "vp1", img: "/images/generated/icon-video.png" },
  { key: "vp3", img: "/images/generated/icon-coins.png" },
  { key: "vp7", img: "/images/generated/icon-clock.png" },
  { key: "vp5", img: "/images/generated/icon-users-check.png" },
  { key: "vp6", img: "/images/generated/icon-flag.png" },
  { key: "vp9", img: "/images/generated/icon-chat.png" },
];

export default function ValueProps() {
  const { t, lang } = useCountry();
  const en = lang === "en";

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
        {en ? "Why VerifiCasa" : "De ce VerifiCasa"}
      </h2>

      <RevealGroup
        stagger={0.05}
        className="mt-5 grid grid-cols-3 gap-x-3 gap-y-6 sm:mt-7 sm:grid-cols-3 sm:gap-6 lg:grid-cols-9"
      >
        {ITEMS.map((item) => (
          <RevealItem key={item.key} className="flex flex-col items-center text-center">
            <img
              src={item.img}
              alt=""
              aria-hidden="true"
              title={t(`${item.key}_d`)}
              className="h-14 w-14 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-110 sm:h-16 sm:w-16"
              loading="lazy"
            />
            <p className="mt-2 text-[11px] font-bold leading-tight text-foreground sm:text-xs">
              {t(`${item.key}_t`)}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
