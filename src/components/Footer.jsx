import React from "react";
import { Mail, MapPin, ShieldCheck, Instagram, Music2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import LegalBadges from "@/components/LegalBadges";

export default function Footer() {
  const { t, lang } = useCountry();
  const en = lang === "en";
  const stats = [
    { value: "100+", label: en ? "verified properties" : "proprietăți verificate" },
    { value: "100%", label: en ? "on-site inspected" : "verificate pe teren" },
    { value: "2", label: en ? "cities, expanding nationwide" : "orașe, extindere națională" },
  ];
  return (
    <footer className="bg-navy-deep text-white/80">
      <div className="h-20 bg-gradient-to-b from-background to-transparent" />

      {/* TRUST STATS — dovadă socială directă, ca la Zillow */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-4 py-8 sm:px-6 lg:px-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-heading text-2xl font-bold text-white sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-[11px] text-white/55 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <VerifiCasaLogo size={44} tagline={false} tone="light" />
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
              <li><Link to="/data-deletion" className="hover:text-emerald">Ștergerea Datelor</Link></li>
              <li><Link to="/cookies" className="hover:text-emerald">Politica de Cookies</Link></li>
              <li><Link to="/contact" className="hover:text-emerald">Contact</Link></li>
            </ul>
            <LegalBadges />
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold">{t("f_contact")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald" />
                <a href="mailto:contact@verificasa.site" className="hover:text-emerald">contact@verificasa.site</a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-emerald" />
                <a href="https://instagram.com/verificasaro" target="_blank" rel="noopener noreferrer" className="hover:text-emerald">@verificasaro</a>
              </li>
              <li className="flex items-center gap-2">
                <Music2 className="h-4 w-4 text-emerald" />
                <a href="https://tiktok.com/@verificasaro" target="_blank" rel="noopener noreferrer" className="hover:text-emerald">verificasaro</a>
              </li>
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