import React from "react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

// Cele trei căi principale (caută / listează / verifică), numerotate ca într-un
// registru. Cardurile stau pe aceeași linie de bază: conținutul variază,
// butonul rămâne ancorat jos.
export default function ActionCards({ onRequestInspection }) {
  const { lang } = useCountry();
  const en = lang === "en";

  const cards = [
    {
      img: "/images/illustrations/action-search.svg",
      title: en ? "Find a verified rental" : "Caută o chirie verificată",
      desc: en
        ? "Browse listings that have been verified online, with real photos and honest pricing."
        : "Răsfoiește anunțuri verificate online, cu poze reale și prețuri corecte.",
      cta: en ? "Search properties" : "Caută proprietăți",
      to: "/search",
    },
    {
      img: "/images/illustrations/action-list.svg",
      title: en ? "List your property" : "Listează-ți proprietatea",
      desc: en
        ? "Post your listing for free and reach tenants looking for verified homes."
        : "Publică anunțul gratuit și ajungi la chiriași care caută locuințe verificate.",
      cta: en ? "List for free" : "Listează gratuit",
      to: "/post-property",
    },
    {
      img: "/images/illustrations/action-inspect.svg",
      title: en ? "Request a verification" : "Solicită o verificare",
      desc: en
        ? "Our team verifies the listing online — photos, paperwork and price — so you rent with no surprises."
        : "Echipa noastră verifică anunțul online — poze, acte și preț — fără surprize la mutare.",
      cta: en ? "Request verification" : "Solicită verificare",
      to: null,
    },
  ];

  const ctaCls =
    "mt-auto inline-flex items-baseline gap-1.5 pt-5 text-sm font-semibold text-emerald transition hover:text-emerald/80";

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {cards.map((c, i) => (
          <RevealItem
            key={i}
            className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-soft sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="kicker">{String(i + 1).padStart(2, "0")}</p>
              <img src={c.img} alt="" className="h-20 w-20 shrink-0 object-contain sm:h-24 sm:w-24" />
            </div>
            <h3 className="mt-3 font-heading text-lg text-navy dark:text-foreground sm:text-xl">
              {c.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            {c.to ? (
              <Link to={c.to} className={ctaCls}>
                {c.cta} <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <button type="button" onClick={onRequestInspection} className={`${ctaCls} text-left`}>
                {c.cta} <span aria-hidden="true">→</span>
              </button>
            )}
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
