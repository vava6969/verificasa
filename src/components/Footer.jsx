import React from "react";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { useCountry } from "@/components/CountryContext";

export default function Footer() {
  const { country, lang, t, legalInfo } = useCountry();
  return (
    <footer className="border-t border-white/10 bg-navy-deep text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Building2 className="h-5 w-5 text-mint" />
              </div>
              <span className="font-heading text-lg font-bold text-white">EstateAI.tour</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{t("footer_desc")}</p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">{t("f_platform")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><a href="#featured" className="hover:text-mint">{t("f_search")}</a></li>
              <li><a href="#how-it-works" className="hover:text-mint">{t("f_how")}</a></li>
              <li><a href="/owner" className="hover:text-mint">{t("f_owners")}</a></li>
              <li><a href="#" className="hover:text-mint">{t("f_aitours")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">{t("f_legal")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />{legalInfo.legal1}</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />{legalInfo.legal2}</li>
              <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />{legalInfo.commission}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">{t("f_contact")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-mint" /> hello@estateai.tour</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-mint" /> {country === "UK" ? "+44 20 1234 5678" : "+40 21 123 4567"}</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-mint" /> {country === "UK" ? "London, UK" : "București, RO"}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>{t("f_rights")}</p>
          <p>{t("f_compliant_ro")}</p>
        </div>
      </div>
    </footer>
  );
}