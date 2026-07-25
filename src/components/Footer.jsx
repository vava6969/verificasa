import React from "react";
import { Mail, MapPin, ShieldCheck, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import LegalBadges from "@/components/LegalBadges";

export default function Footer() {
  const { t } = useCountry();
  return (
    <footer className="border-t border-gold/20 bg-navy-deep text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <VerifiCasaLogo size={44} tagline={false} />
            <p className="mt-4 text-sm leading-relaxed text-white/55">{t("footer_desc_vc")}</p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-gold/30 bg-white/5 px-3 py-2 text-xs font-semibold text-gold">
              <ShieldCheck className="h-4 w-4" /> {t("footer_inspectii")}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold">{t("f_platform")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><Link to="/search" className="hover:text-emerald">{t("f_search")}</Link></li>
              <li><Link to="/about" className="hover:text-emerald">{t("footer_about")}</Link></li>
              <li><Link to="/search?ai=1" className="hover:text-emerald">{t("footer_aitours")}</Link></li>
              <li><Link to="/search?field=1" className="hover:text-emerald">{t("footer_field")}</Link></li>
              <li><Link to="/owner" className="hover:text-emerald">{t("nav_owners")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold">{t("f_legal")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />{t("footer_anpc")}</li>
              <li><Link to="/terms" className="hover:text-emerald">{t("footer_terms")}</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald">{t("footer_privacy")}</Link></li>
            </ul>
            <LegalBadges />
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold">{t("f_contact")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald" /> hello@verificasa.ro</li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-emerald" />
                <a href="https://instagram.com/verificasaro" target="_blank" rel="noopener noreferrer" className="hover:text-emerald">@verificasaro</a>
              </li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald" /> București, România 🇷🇴</li>
            </ul>
            <p className="mt-4 flex items-start gap-2 text-xs font-semibold text-white/70">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" /> {t("footer_coverage")}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>{t("footer_copy")}</p>
          <p>{t("footer_compliance")}</p>
        </div>
      </div>
    </footer>
  );
}