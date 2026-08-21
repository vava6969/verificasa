import React from "react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

// Despre — un titlu, un link și cele cinci publicuri ca iconițe. Paragraful
// explicativ și fișa cu cinci rânduri de descriere au ieșit: clientul a cerut
// mai puține cuvinte, iar pagina /about le spune deja pe toate.
export default function AboutVerifiCasa() {
  const { lang } = useCountry();
  const en = lang === "en";

  const audience = [
    { label: en ? "Owners" : "Proprietari", img: "/images/generated/icon-proprietari.png" },
    { label: en ? "Tenants" : "Chiriași", img: "/images/generated/icon-chiriasi.png" },
    { label: en ? "Managers" : "Administratori", img: "/images/generated/icon-administratori.png" },
    { label: en ? "Buyers" : "Cumpărători", img: "/images/generated/icon-cumparatori.png" },
    { label: en ? "Agents" : "Agenți", img: "/images/generated/icon-agenti.png" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Reveal>
        <h2 className="max-w-[18ch] text-2xl font-bold leading-tight text-foreground sm:text-4xl">
          {en ? "Verified before it goes live." : "Verificat înainte de publicare."}
        </h2>
        <Link
          to="/about"
          className="mt-3 inline-flex min-h-[44px] items-center text-sm font-bold text-emerald transition-transform hover:translate-x-0.5"
        >
          {en ? "How it works" : "Cum funcționează"}
          <span className="ml-1" aria-hidden="true">→</span>
        </Link>
      </Reveal>

      {/* Cui se adresează — o singură linie per public, cu iconița lui. */}
      <RevealGroup
        stagger={0.05}
        className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-5 sm:gap-4"
      >
        {audience.map((a) => (
          <RevealItem
            key={a.label}
            className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3 sm:flex-col sm:gap-2 sm:p-4 sm:text-center"
          >
            <img
              src={a.img}
              alt=""
              aria-hidden="true"
              className="h-9 w-9 shrink-0 object-contain drop-shadow-sm sm:h-12 sm:w-12"
              loading="lazy"
            />
            <p className="text-[13px] font-bold leading-tight text-foreground sm:text-sm">{a.label}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
