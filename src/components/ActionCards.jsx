import React from "react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

// The three ways in — as one ruled block, not three floating cards. Each entry
// is typed: title, plain sentence, contextual action. Divided by hairlines,
// columns on desktop, rows on mobile.
export default function ActionCards({ onRequestInspection }) {
  const { lang } = useCountry();
  const en = lang === "en";

  const cards = [
    {
      title: en ? "Find a verified rental" : "Caută o chirie verificată",
      desc: en
        ? "Browse listings that have been verified online, with real photos and honest pricing."
        : "Răsfoiește anunțuri verificate online, cu poze reale și prețuri corecte.",
      cta: en ? "Search properties" : "Caută proprietăți",
      to: "/search",
    },
    {
      title: en ? "List your property" : "Listează-ți proprietatea",
      desc: en
        ? "Post your listing for free and reach tenants looking for verified homes."
        : "Publică anunțul gratuit și ajungi la chiriași care caută locuințe verificate.",
      cta: en ? "List for free" : "Listează gratuit",
      to: "/post-property",
    },
    {
      title: en ? "Request a verification" : "Solicită o verificare",
      desc: en
        ? "We verify the listing online: photos, paperwork and price, so you rent with no surprises."
        : "Verificăm anunțul online: poze, acte și preț, ca să închiriezi fără surprize.",
      cta: en ? "Request verification" : "Solicită verificare",
      to: null,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <RevealGroup className="grid grid-cols-1 divide-y divide-border border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {cards.map((c, i) => (
          <RevealItem key={i} className="flex flex-col p-6 sm:p-7">
            <h3 className="font-heading text-xl font-semibold text-foreground">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            {c.to ? (
              <Link to={c.to} className="mt-5 inline-flex min-h-[44px] items-center text-sm font-bold text-emerald transition-colors hover:text-foreground sm:min-h-0">
                {c.cta} <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={onRequestInspection}
                className="mt-5 text-left inline-flex min-h-[44px] items-center text-sm font-bold text-emerald transition-colors hover:text-foreground sm:min-h-0"
              >
                {c.cta} <span aria-hidden="true">→</span>
              </button>
            )}
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
