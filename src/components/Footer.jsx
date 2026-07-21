import React from "react";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { useCountry } from "@/components/CountryContext";

export default function Footer() {
  const { country, legalInfo } = useCountry();
  return (
    <footer className="border-t border-border bg-navy-deep text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Building2 className="h-5 w-5 text-mint" />
              </div>
              <span className="font-heading text-lg font-bold text-white">EstateAI.tour</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Platformă internațională de închirieri imobiliare cu tururi AI immersive. România & Marea Britanie.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">Platformă</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><a href="#featured" className="hover:text-mint">Caută chirii</a></li>
              <li><a href="#how-it-works" className="hover:text-mint">Cum funcționează</a></li>
              <li><a href="/owner" className="hover:text-mint">Pentru Proprietari</a></li>
              <li><a href="#" className="hover:text-mint">Tururi AI</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">Legal & Încredere</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-mint" />{legalInfo.legal1}</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-mint" />{legalInfo.legal2}</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-mint" />{legalInfo.commission}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-mint" /> hello@estateai.tour</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-mint" /> {country === "UK" ? "+44 20 1234 5678" : "+40 21 123 4567"}</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-mint" /> {country === "UK" ? "London, UK" : "București, RO"}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© 2026 EstateAI.tour — Toate drepturile rezervate.</p>
          <p>AI Walkthrough · PropTech · {country === "UK" ? "Tenant Fees Act 2019 Compliant" : "ANPC Compliant"}</p>
        </div>
      </div>
    </footer>
  );
}