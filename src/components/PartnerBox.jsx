import React from "react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import { Stamp } from "@/components/fisa";
import { PARTNERS } from "@/lib/partners";

// „Nu ne crezi pe cuvânt?" — caseta partenerului, sub Contactează & Programează.
// Cererea clientului (Andrei), scrisă ca la carte: verificare independentă,
// codul VerifiCasa, logo în ramă neutră ca verdele lor să nu se bată cu al
// nostru, link extern etichetat cu ref ca traficul să fie demonstrabil.
export default function PartnerBox({ partnerId = "residence-vertical", className = "" }) {
  const { lang } = useCountry();
  const en = lang === "en";
  const partner = PARTNERS.find((p) => p.id === partnerId);
  if (!partner) return null;

  return (
    <aside className={`border border-border bg-card ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold text-foreground">
            {en ? "Don't take our word for it" : "Nu ne crezi pe cuvânt?"}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {en ? "Independent check, by our partners" : "Verificare independentă, prin partenerii noștri"}
          </p>
        </div>
        <div className="flex h-10 w-20 shrink-0 items-center justify-center border border-border bg-white p-1.5">
          <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain" loading="lazy" />
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {en
            ? "Check the property yourself through Residence Vertical: developer and ANAF status, seismic risk, building permits, real area pricing."
            : "Verifică proprietatea independent, prin Residence Vertical: dezvoltator și statut ANAF, risc seismic, autorizații de construire, prețul real al zonei."}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Stamp tone="verde">{en ? "Code" : "Cod"} {partner.code}</Stamp>
          <span className="text-sm font-semibold text-foreground">{partner.discount}</span>
        </div>

        <a
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded bg-emerald px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90"
        >
          {en ? "Check on residencevertical.ro" : "Verifică pe residencevertical.ro"}{" "}
          <span className="ml-1.5" aria-hidden="true">↗</span>
        </a>

        <Link
          to="/parteneri"
          className="mt-2 block text-center text-xs font-semibold text-emerald transition-colors hover:text-foreground"
        >
          {en ? "All partners" : "Toți partenerii"} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  );
}
