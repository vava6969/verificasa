import React from "react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

// Cele trei drumuri în aplicație. Fiecare e o fotografie cu un singur rând de
// text peste ea — se aleg din privire, nu din citit. Paragrafele explicative
// au ieșit; dacă un card are nevoie de trei rânduri ca să se explice, atunci
// cardul e greșit, nu textul prea scurt.
export default function ActionCards({ onRequestInspection }) {
  const { lang } = useCountry();
  const en = lang === "en";

  const cards = [
    {
      title: en ? "Find a rental" : "Caută o chirie",
      img: "/images/properties/interior-01.webp",
      to: "/search",
    },
    {
      title: en ? "List your place" : "Listează gratuit",
      img: "/images/properties/exterior-03.webp",
      to: "/post-property",
    },
    {
      title: en ? "Get it verified" : "Cere o verificare",
      img: "/images/properties/interior-05.webp",
      to: null,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
      <RevealGroup className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {cards.map((c) => {
          const inner = (
            <span className="group relative flex h-32 items-end overflow-hidden rounded-2xl sm:h-44">
              <img
                src={c.img}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <span className="relative flex w-full items-center justify-between gap-2 p-4 sm:p-5">
                <span className="text-lg font-bold text-white sm:text-xl">{c.title}</span>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald text-lg leading-none text-primary-foreground transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </span>
          );
          return (
            <RevealItem key={c.title}>
              {c.to ? (
                <Link to={c.to} className="block">{inner}</Link>
              ) : (
                <button type="button" onClick={onRequestInspection} className="block w-full text-left">
                  {inner}
                </button>
              )}
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
