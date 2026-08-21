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
      <Reveal className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald sm:text-xs">Despre VerifiCasa</p>
        <h2 className="mt-1.5 font-heading text-lg font-bold leading-snug text-navy dark:text-foreground sm:text-3xl">
          Piața online pentru chirii verificate
        </h2>
        <p className="mx-auto mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
          Proprietarii își publică singuri anunțurile, iar VerifiCasa verifică online fiecare
          anunț — poze, acte și preț — și calculează automat un scor de încredere. Chiriașii pot
          lăsa recenzii, iar un tur 3D al locuinței este disponibil opțional, prin Plan Pro.
        </p>
      </Reveal>

      {/* Servicii — carduri cu iconițe, hover lift */}
      <RevealGroup className="mt-5 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {services.map((s, i) => (
          <RevealItem
            key={i}
            className="group relative flex flex-col overflow-hidden rounded surface-card p-4 transition-colors hover:shadow-[0_20px_45px_-15px_rgba(16,24,40,0.28)] sm:p-5"
          >
            <div className="relative flex h-11 w-11 items-center justify-center sm:h-12 sm:w-12">
              <span className="absolute inset-0 rounded-full transition-transform duration-300 group-" />
              <img src={s.img} alt="" className="relative h-full w-full object-contain drop-shadow-[0_4px_10px_rgba(16,24,40,0.16)] transition-transform duration-300 group-" />
            </div>
            <h3 className="mt-3 font-heading text-sm font-bold text-navy dark:text-foreground sm:text-base">{s.title}</h3>
            <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{s.desc}</p>
            <Link
              to="/about"
              className="mt-3 inline-flex min-h-[44px] items-center text-xs font-bold text-emerald transition-colors sm:min-h-0 sm:text-sm"
            >
              Află mai multe <span className="ml-1" aria-hidden="true">→</span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Cui se adresează — panou glassmorphism interactiv */}
      <Reveal className="relative mt-5 overflow-hidden rounded bg-gradient-to-br from-navy via-navy-deep to-navy p-5 sm:mt-12 sm:p-10">

        <h3 className="relative text-center font-heading text-base font-bold text-white sm:text-2xl">
          Cui se adresează
        </h3>

        <div className="relative mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-5 sm:gap-4">
          {audience.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveAudience(i)}
              className={`group flex flex-col items-center gap-2 rounded border p-3 text-center transition-colors sm:p-4 ${
                activeAudience === i
                  ? "border-white/40 bg-white/20"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded bg-white p-1.5 shadow-soft transition-transform duration-300 group- sm:h-14 sm:w-14">
                <img src={a.img} alt="" className="h-full w-full object-contain" />
              </span>
              <span className="text-[11px] font-semibold text-white sm:text-sm">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="relative mt-4 rounded border border-white/10 bg-white/5 px-4 py-3 text-center text-xs text-white/80 transition-colors sm:mt-6 sm:text-sm">
          {audience[activeAudience].desc}
        </div>
      </Reveal>

      {/* Contact rapid */}
      <div className="mt-4 flex justify-center sm:mt-8">
        <Link
          to="/contact"
          className="inline-flex min-h-[44px] items-center rounded bg-emerald px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90"
        >
          Contactează-ne <span className="ml-1.5" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}