import React from "react";

/**
 * ANPC SAL + EU ODR — obligatorii în subsol. Erau două carduri suprapuse cu
 * etichetă, descriere și buton „Detalii", aproape o sută de pixeli pentru două
 * linkuri: exact ce umfla subsolul. Acum sunt două pastile pe un rând.
 */
export default function LegalBadges() {
  const badges = [
    { href: "https://anpc.ro/ce-este-sal/", tag: "ANPC SAL" },
    { href: "https://consumer-redress.ec.europa.eu/site-relocation_en", tag: "ODR · UE" },
  ];

  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <a
          key={b.href}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white/70 transition-colors hover:border-emerald/60 hover:text-white"
        >
          {b.tag}
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
