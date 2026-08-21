import React from "react";
import { ExternalLink } from "lucide-react";

/**
 * Legal compliance badges for the footer (ANPC SAL + EU ODR).
 * Small, transparent, clickable cards that blend with the dark navy footer.
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
    <div className="mt-5 space-y-2.5">
      {badges.map((b) => (
        <a
          key={b.href}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-left transition hover:border-emerald/60 hover:bg-white/10"
        >
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
              {b.tag}
            </span>
            <span className="text-[11px] font-semibold text-white/75">
              {b.line}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded bg-emerald/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white transition group-hover:bg-emerald">
            Detalii <ExternalLink className="h-3 w-3" />
          </span>
        </a>
      ))}
    </div>
  );
}