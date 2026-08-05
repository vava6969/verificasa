import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Video, FileText, Home, Users, Building2,
  UserCheck, Search, Briefcase, ArrowRight,
} from "lucide-react";

export default function AboutVerifiCasa() {
  const services = [
    { icon: Video, title: "Tururi 3D & AI", desc: "Tururi virtuale Matterport și randări AI pentru proprietăți imobiliare." },
    { icon: ShieldCheck, title: "Inspecții & Verificări", desc: "Audit profesional de proprietăți, rapoarte de inspecție și verificări on-site." },
    { icon: FileText, title: "Gestionare documente", desc: "Administrarea rapoartelor, contractelor și documentelor într-un mediu securizat." },
    { icon: Search, title: "Căutare & listare", desc: "Platformă de listare și descoperire a proprietăților cu filtre avansate." },
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

      {/* Servicii — compact rows on mobile, cards from sm up */}
      <div className="mt-5 grid gap-2.5 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {services.map((s, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl surface-card p-3.5 sm:flex-col sm:p-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-soft text-emerald sm:h-11 sm:w-11">
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading text-sm font-bold text-navy dark:text-foreground sm:mt-4 sm:text-base">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">{s.desc}</p>
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