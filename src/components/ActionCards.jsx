import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCountry } from "@/components/CountryContext";

// Bloc principal de navigare pe homepage, în genul "Buy a home / Rent a home /
// Sell a home" de la Zillow: trei căi clare, fiecare cu ilustrație de brand,
// titlu bold și un singur CTA. Înlocuiește navigarea prin text cu navigare
// vizuală, imediat sub hero.
export default function ActionCards({ onRequestInspection }) {
  const { t, lang } = useCountry();
  const en = lang === "en";

  const cards = [
    {
      img: "/images/illustrations/action-search.svg",
      title: en ? "Find a verified rental" : "Caută o chirie verificată",
      desc: en
        ? "Browse listings that have been checked on-site, with real photos and honest pricing."
        : "Răsfoiește anunțuri verificate pe teren, cu poze reale și prețuri corecte.",
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
      title: en ? "Request an inspection" : "Solicită o inspecție pe teren",
      desc: en
        ? "Our team verifies the property in person, so you rent with no surprises."
        : "Echipa noastră verifică proprietatea la fața locului, fără surprize la mutare.",
      cta: en ? "Request inspection" : "Solicită inspecție",
      to: null,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {cards.map((c, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-3xl surface-card p-6 text-center sm:p-7"
          >
            <img src={c.img} alt="" className="h-28 w-28 object-contain sm:h-32 sm:w-32" />
            <h3 className="mt-4 font-heading text-lg font-bold text-navy dark:text-foreground sm:text-xl">
              {c.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            {c.to ? (
              <Link
                to={c.to}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full border-2 border-navy/15 bg-white px-5 py-2 text-sm font-semibold text-navy transition hover:border-emerald hover:text-emerald dark:border-white/15 dark:bg-white/5 dark:text-foreground"
              >
                {c.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onRequestInspection}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full border-2 border-navy/15 bg-white px-5 py-2 text-sm font-semibold text-navy transition hover:border-emerald hover:text-emerald dark:border-white/15 dark:bg-white/5 dark:text-foreground"
              >
                {c.cta} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
