import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Gauge, MessageSquare, Video, ArrowRight,
  Home, Users, Building2, UserCheck, Briefcase,
} from "lucide-react";

export default function AboutVerifiCasa() {
  const [activeAudience, setActiveAudience] = useState(0);
  const services = [
    { icon: ShieldCheck, title: "Verificare online", desc: "Verificăm fiecare anunț înainte de publicare: poze, acte de proprietate și corectitudinea prețului." },
    { icon: Gauge, title: "Scor de încredere", desc: "Fiecare proprietate primește automat un scor de încredere, calculat din completitudinea și calitatea anunțului." },
    { icon: MessageSquare, title: "Recenzii & comunitate", desc: "Chiriașii pot lăsa recenzii, ca să știi la ce te aștepți încă înainte să suni proprietarul." },
    { icon: Video, title: "Tur 3D opțional", desc: "Proprietarii pot adăuga un tur virtual Matterport al locuinței, disponibil prin Plan Pro." },
  ];

  const audience = [
    { img: "/images/generated/icon-proprietari.png", label: "Proprietari", desc: "Publici anunțul și primești automat un scor de încredere." },
    { img: "/images/generated/icon-chiriasi.png", label: "Chiriași", desc: "Cauți sigur, cu recenzii reale de la alți chiriași." },
    { img: "/images/generated/icon-administratori.png", label: "Administratori", desc: "Gestionezi mai multe proprietăți dintr-un singur cont." },
    { img: "/images/generated/icon-cumparatori.png", label: "Cumpărători", desc: "Vezi doar anunțuri verificate, fără timp pierdut." },
    { img: "/images/generated/icon-agenti.png", label: "Profesioniști imobiliari", desc: "Îiți listezi portofoliul și construiești reputație online." },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-16 lg:px-8">
      {/* Despre VerifiCasa */}
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald sm:text-xs">Despre VerifiCasa</p>
        <h2 className="mt-1.5 font-heading text-lg font-bold leading-snug text-navy dark:text-foreground sm:text-3xl">
          Piața online pentru chirii verificate
        </h2>
        <p className="mx-auto mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
          Proprietarii își publică singuri anunțurile, iar VerifiCasa verifică online fiecare
          anunț — poze, acte și preț — și calculează automat un scor de încredere. Chiriașii pot
          lăsa recenzii, iar un tur 3D al locuinței este disponibil opțional, prin Plan Pro.
        </p>
      </div>

      {/* Servicii — carduri cu iconițe, hover lift */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {services.map((s, i) => (
          <div
            key={i}
            className="group relative flex flex-col overflow-hidden rounded-3xl surface-card p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-15px_rgba(16,24,40,0.28)] sm:p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-soft text-emerald transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12">
              <s.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="mt-3 font-heading text-sm font-bold text-navy dark:text-foreground sm:text-base">{s.title}</h3>
            <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{s.desc}</p>
            <Link
              to="/about"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald transition-all duration-200 group-hover:gap-2 sm:text-sm"
            >
              Află mai multe <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Cui se adresează — panou glassmorphism interactiv */}
      <div className="relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-deep to-navy p-5 sm:mt-12 sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald/30 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-gold/25 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="pointer-events-none absolute right-1/3 top-1/2 h-28 w-28 rounded-full bg-mint/20 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

        <h3 className="relative text-center font-heading text-base font-bold text-white sm:text-2xl">
          Cui se adresează
        </h3>

        <div className="relative mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-5 sm:gap-4">
          {audience.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveAudience(i)}
              className={`group flex flex-col items-center gap-2 rounded-2xl border p-3 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 sm:p-4 ${
                activeAudience === i
                  ? "border-white/40 bg-white/20"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-soft transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14">
                <img src={a.img} alt="" className="h-full w-full object-contain" />
              </span>
              <span className="text-[11px] font-semibold text-white sm:text-sm">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs text-white/80 backdrop-blur-xl transition-all duration-300 sm:mt-6 sm:text-sm">
          {audience[activeAudience].desc}
        </div>
      </div>

      {/* Contact rapid */}
      <div className="mt-4 flex justify-center sm:mt-8">
        <Link
          to="/contact"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-emerald/90 sm:text-sm"
        >
          Contactează-ne <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}