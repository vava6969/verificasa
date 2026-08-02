import React from "react";
import {
  ShieldCheck, Video, FileText, Home, Users, Building2,
  UserCheck, Search, Briefcase, Mail,
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
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
      {/* Despre VerifiCasa */}
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald">Despre VerifiCasa</p>
        <h2 className="mt-1 font-heading text-xl font-bold text-navy dark:text-foreground sm:text-3xl">
          Platforma de inspecții și verificări imobiliare
        </h2>
        <p className="mx-auto mt-2.5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
          VerifiCasa este o platformă online dedicată gestionării inspecțiilor și verificărilor
          imobiliare. Platforma permite administrarea proprietăților, organizarea rapoartelor de
          inspecție, gestionarea documentelor și colaborarea într-un mediu securizat.
        </p>
      </div>

      {/* Servicii */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-4">
        {services.map((s, i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-border bg-white p-4 shadow-soft dark:bg-card sm:p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-soft text-emerald sm:h-11 sm:w-11">
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h3 className="mt-3 font-heading text-sm font-bold text-navy dark:text-foreground sm:mt-4 sm:text-base">{s.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Cui se adresează */}
      <div className="mt-7 rounded-2xl border border-border bg-secondary/40 p-5 sm:mt-12 sm:p-8">
        <h3 className="text-center font-heading text-base font-bold text-navy dark:text-foreground sm:text-lg">
          Cui se adresează
        </h3>
        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-6 sm:gap-3">
          {audience.map((a, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-soft dark:bg-card dark:text-foreground sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
              <a.icon className="h-3.5 w-3.5 text-emerald sm:h-4 sm:w-4" /> {a.label}
            </div>
          ))}
        </div>
      </div>

      {/* Contact rapid */}
      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground sm:mt-8">
        <Mail className="h-4 w-4 text-emerald" />
        Contact:{" "}
        <a href="mailto:birou@verificasa.site" className="font-semibold text-emerald hover:underline">
          birou@verificasa.site
        </a>
      </div>
    </section>
  );
}