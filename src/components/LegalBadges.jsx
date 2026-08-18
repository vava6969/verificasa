import React from "react";

/**
 * Legal compliance links for the footer (ANPC SAL + EU ODR).
 * Ruled rows in the registry register — mono tag, plain line, text arrow.
 */
export default function LegalBadges() {
  const badges = [
    {
      href: "https://anpc.ro/ce-este-sal/",
      tag: "ANPC",
      line: "Soluționarea alternativă a litigiilor",
    },
    {
      href: "https://consumer-redress.ec.europa.eu/site-relocation_en",
      tag: "ODR · UE",
      line: "Soluționarea online a litigiilor",
    },
  ];

  return (
    <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
      {badges.map((b) => (
        <a
          key={b.href}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-baseline justify-between gap-3 py-2.5 text-left"
        >
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="stamp-line text-white/45">{b.tag}</span>
            <span className="mt-0.5 text-[11px] text-white/70 transition-colors group-hover:text-white">{b.line}</span>
          </span>
          <span aria-hidden="true" className="shrink-0 text-xs text-white/40 transition-colors group-hover:text-white">↗</span>
        </a>
      ))}
    </div>
  );
}
