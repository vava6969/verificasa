import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Video, FileText, Home, Users, Building2,
  UserCheck, Search, Briefcase, ArrowRight,
} from "lucide-react";

export default function AboutVerifiCasa() {
  const services = [
    { icon: Video, title: "Tururi 3D & AI", desc: "Tururi virtuale Matterport și randări AI pentru proprietăți imobiliare.", image: "/images/about/tururi-3d.webp" },
    { icon: ShieldCheck, title: "Inspecții & Verificări", desc: "Audit profesional de proprietăți, rapoarte de inspecție și verificări on-site.", image: "/images/about/inspectii.webp" },
    { icon: FileText, title: "Gestionare documente", desc: "Administrarea rapoartelor, contractelor și documentelor într-un mediu securizat.", image: "/images/about/documente.webp" },
    { icon: Search, title: "Căutare & listare", desc: "Platformă de listare și descoperire a proprietăților cu filtre avansate.", image: "/images/about/cautare.webp" },
  ];

  const audience = [
    { icon: ShieldCheck, label: "Inspectori" },
    { icon: Home, label: "Proprietari" },
    { icon: Building2, label: "Administratori" },
    { icon: UserCheck, label: "Cumpărători" },
    { icon: Users, label: "Chiriași" },
    { icon: Briefcase, label: "Profesioniști imobiliari" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-16 lg:px-8">
      {/* Despre VerifiCasa */}
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald sm:text-xs">Despre VerifiCasa</p>
        <h2 className="mt-1.5 font-heading text-lg font-bold leading-snug text-navy dark:text-foreground sm:text-3xl">
          Platforma de inspecții și verificări imobiliare
        </h2>
        <p className="mx-auto mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
          VerifiCasa este o platformă online dedicată gestionării inspecțiilor și verificărilor
          imobiliare. Platforma permite administrarea proprietăților, organizarea rapoartelor de
          inspecție, gestionarea documentelor și colaborarea într-un mediu securizat.
        </p>
      </div>

      {/* Servicii — imagine tematică + Read More, card interactiv cu hover lift */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {services.map((s, i) => (
          <div
            key={i}
            className="group relative flex flex-col overflow-hidden rounded-3xl surface-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-15px_rgba(16,24,40,0.28)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={s.image}
                alt={s.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/55 via-navy-deep/0 to-navy-deep/0" />
              <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-emerald shadow-soft backdrop-blur">
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="font-heading text-sm font-bold text-navy dark:text-foreground sm:text-base">{s.title}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{s.desc}</p>
              <Link
                to="/about"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald transition-all duration-200 group-hover:gap-2 sm:text-sm"
              >
                Află mai multe <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Cui se adresează */}
      <div className="mt-5 rounded-2xl surface-card p-4 sm:mt-12 sm:p-8">
        <h3 className="text-center font-heading text-sm font-bold text-navy dark:text-foreground sm:text-lg">
          Cui se adresează
        </h3>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:mt-6 sm:gap-3">
          {audience.map((a, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-navy dark:bg-white/5 dark:text-foreground sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
              <a.icon className="h-3 w-3 text-emerald sm:h-4 sm:w-4" /> {a.label}
            </div>
          ))}
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