import React from "react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Kicker } from "@/components/fisa";

// Despre — the registry explains itself once, in plain sentences, then names
// who it is for as a ruled index. The four icon cards are gone: the ledger
// above already carries that content, and they repeated it with generated
// icons, identical hover-lift and four links to the same page. The audience
// panel was the last gradient-and-glass survivor on the homepage.
export default function AboutVerifiCasa() {
  const { lang } = useCountry();
  const en = lang === "en";

  const audience = [
    {
      label: en ? "Owners" : "Proprietari",
      desc: en
        ? "You publish the listing yourself and it is scored for trust automatically."
        : "Publici anunțul și primești automat un scor de încredere.",
    },
    {
      label: en ? "Tenants" : "Chiriași",
      desc: en
        ? "You search safely, with real reviews from tenants who lived there."
        : "Cauți sigur, cu recenzii reale de la alți chiriași.",
    },
    {
      label: en ? "Property managers" : "Administratori",
      desc: en
        ? "You run several properties from a single account."
        : "Gestionezi mai multe proprietăți dintr-un singur cont.",
    },
    {
      label: en ? "Buyers" : "Cumpărători",
      desc: en
        ? "You see verified listings only, with no time wasted."
        : "Vezi doar anunțuri verificate, fără timp pierdut.",
    },
    {
      label: en ? "Estate professionals" : "Profesioniști imobiliari",
      desc: en
        ? "You list your portfolio and build a reputation online."
        : "Îți listezi portofoliul și construiești reputație online.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
      <Reveal className="max-w-[62ch]">
        <Kicker>{en ? "About VerifiCasa" : "Despre VerifiCasa"}</Kicker>
        <h2 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          {en ? "The online market for verified rentals" : "Piața online pentru chirii verificate"}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {en
            ? "Owners publish their own listings, and VerifiCasa checks each one online — photos, paperwork and price — then calculates a trust score automatically. Tenants can leave reviews, and a 3D tour of the home is available as an option on the Pro plan."
            : "Proprietarii își publică singuri anunțurile, iar VerifiCasa verifică online fiecare anunț — poze, acte și preț — și calculează automat un scor de încredere. Chiriașii pot lăsa recenzii, iar un tur 3D al locuinței este disponibil opțional, prin Plan Pro."}
        </p>
        <Link
          to="/about"
          className="mt-4 inline-flex min-h-[44px] items-center text-sm font-bold text-emerald transition-colors hover:text-foreground sm:min-h-0"
        >
          {en ? "How verification works" : "Cum funcționează verificarea"}
          <span className="ml-1" aria-hidden="true">→</span>
        </Link>
      </Reveal>

      <Reveal className="mt-8 sm:mt-12">
        <h3 className="font-heading text-lg font-semibold text-foreground sm:text-xl">
          {en ? "Who it is for" : "Cui se adresează"}
        </h3>
      </Reveal>
      <RevealGroup className="mt-3 border-t border-border">
        {audience.map((a) => (
          <RevealItem
            key={a.label}
            className="flex flex-col gap-0.5 border-b border-border py-3 sm:flex-row sm:items-baseline sm:gap-8"
          >
            <p className="font-body text-[15px] font-bold text-foreground sm:w-60 sm:shrink-0">{a.label}</p>
            <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
