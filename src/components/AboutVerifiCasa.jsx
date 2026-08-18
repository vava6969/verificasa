import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

export default function AboutVerifiCasa() {
  const [activeAudience, setActiveAudience] = useState(0);
  const services = [
    { img: "/images/generated/icon-shield-check.png", title: "Verificare online", desc: "Verificăm fiecare anunț înainte de publicare: poze, acte de proprietate și corectitudinea prețului." },
    { img: "/images/generated/icon-gauge.png", title: "Scor de încredere", desc: "Fiecare proprietate primește automat un scor de încredere, calculat din completitudinea și calitatea anunțului." },
    { img: "/images/generated/icon-chat.png", title: "Recenzii & comunitate", desc: "Chiriașii pot lăsa recenzii, ca să știi la ce te aștepți încă înainte să suni proprietarul." },
    { img: "/images/generated/icon-video.png", title: "Tur 3D opțional", desc: "Proprietarii pot adăuga un tur virtual al locuinței, realizat cu aplicația noastră integrată, disponibil prin Plan Pro." },
  ];

  const audience = [
    { img: "/images/generated/icon-proprietari.png", label: "Proprietari", desc: "Publici anunțul și primești automat un scor de încredere." },
    { img: "/images/generated/icon-chiriasi.png", label: "Chiriași", desc: "Cauți sigur, cu recenzii reale de la alți chiriași." },
    { img: "/images/generated/icon-administratori.png", label: "Administratori", desc: "Gestionezi mai multe proprietăți dintr-un singur cont." },
    { img: "/images/generated/icon-cumparatori.png", label: "Cumpărători", desc: "Vezi doar anunțuri verificate, fără timp pierdut." },
    { img: "/images/generated/icon-agenti.png", label: "Profesioniști imobiliari", desc: "Îți listezi portofoliul și construiești reputație online." },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-16 lg:px-8">
      {/* Despre VerifiCasa */}
      <Reveal className="border-t border-border pt-6 sm:pt-8">
        <p className="kicker text-emerald">Despre VerifiCasa</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_1.2fr] sm:gap-10">
          <h2 className="font-heading text-xl leading-snug text-navy dark:text-foreground sm:text-3xl">
            Piața online pentru chirii verificate
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Proprietarii își publică singuri anunțurile, iar VerifiCasa verifică online fiecare
            anunț — poze, acte și preț — și calculează automat un scor de încredere. Chiriașii pot
            lăsa recenzii, iar un tur 3D al locuinței este disponibil opțional, prin Plan Pro.
          </p>
        </div>
      </Reveal>

      {/* Servicii — coloane pe riglă, fără carduri decorate */}
      <RevealGroup className="mt-8 grid grid-cols-1 divide-y divide-border border-y border-border sm:mt-10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {services.map((s, i) => (
          <RevealItem key={i} className="flex flex-col py-5 lg:px-5 lg:first:pl-0 lg:last:pr-0">
            <div className="flex items-center justify-between gap-3">
              <p className="kicker">{String(i + 1).padStart(2, "0")}</p>
              <img src={s.img} alt="" className="h-9 w-9 object-contain" />
            </div>
            <h3 className="mt-2.5 font-heading text-base text-navy dark:text-foreground">{s.title}</h3>
            <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{s.desc}</p>
            <Link
              to="/about"
              className="mt-3 inline-flex items-baseline gap-1 text-xs font-semibold text-emerald transition hover:text-emerald/80 sm:text-sm"
            >
              Află mai multe <span aria-hidden="true">→</span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Cui se adresează — panou ink, plat */}
      <Reveal className="mt-8 rounded-lg bg-navy-deep p-5 sm:mt-12 sm:p-10">
        <h3 className="font-heading text-lg text-white sm:text-2xl">
          Cui se adresează
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:grid-cols-5 sm:gap-3">
          {audience.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveAudience(i)}
              aria-pressed={activeAudience === i}
              className={`flex flex-col items-center gap-2 rounded-md border p-3 text-center transition-colors sm:p-4 ${
                activeAudience === i
                  ? "border-emerald bg-white/10"
                  : "border-white/10 bg-transparent hover:border-white/30"
              }`}
            >
              <img src={a.img} alt="" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
              <span className="text-[11px] font-semibold text-white sm:text-sm">{a.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 border-t border-white/10 pt-4 text-center text-xs text-white/75 sm:mt-6 sm:text-sm">
          {audience[activeAudience].desc}
        </p>
      </Reveal>

      {/* Contact rapid */}
      <div className="mt-6 flex justify-center sm:mt-8">
        <Link
          to="/contact"
          className="inline-flex items-baseline gap-1.5 text-sm font-semibold text-emerald transition hover:text-emerald/80"
        >
          Contactează-ne <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
