import React from "react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import LegalBadges from "@/components/LegalBadges";
import { Reveal } from "@/components/ui/reveal";

// Registry footer: ink ground, ruled columns, typed links. No blobs, no
// gradient washes, no icon decoration — external links carry a text arrow.
export default function Footer() {
  const { t } = useCountry();

  // Subsolul e informație de serviciu, nu o secțiune de sine stătătoare: rânduri
  // strânse, un singur pas de spațiu, text mic. Ocupa cât o pagină întreagă.
  const col = "space-y-0.5 text-[13px]";
  const link = "flex min-h-[32px] items-center text-white/60 transition-colors hover:text-white";
  const head = "text-[13px] font-bold text-white";

  return (
    <footer className="bg-navy-deep text-white/70">
      <Reveal className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 border-b border-white/15 pb-6 sm:gap-8 md:grid-cols-4">
          <div>
            <VerifiCasaLogo size={34} tone="light" />
            <p className="mt-2.5 max-w-[36ch] text-[13px] leading-relaxed text-white/55">{t("footer_desc_vc")}</p>
            <p className="mt-2.5 text-xs font-semibold text-white/70">{t("footer_inspectii")}</p>
          </div>

          <div>
            <h4 className={head}>{t("f_platform")}</h4>
            <ul className={`mt-2 ${col}`}>
              <li><Link to="/search" className={link}>{t("f_search")}</Link></li>
              <li><Link to="/map" className={link}>Hartă</Link></li>
              <li><Link to="/about" className={link}>{t("footer_about")}</Link></li>
              <li><Link to="/upgrade" className={link}>Planuri</Link></li>
              <li><Link to="/parteneri" className={link}>Parteneri</Link></li>
              <li><Link to="/owner" className={link}>{t("nav_owners")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={head}>{t("f_legal")}</h4>
            <ul className={`mt-2 ${col}`}>
              <li><Link to="/terms" className={link}>{t("footer_terms")}</Link></li>
              <li><Link to="/privacy" className={link}>{t("footer_privacy")}</Link></li>
              <li><Link to="/data-deletion" className={link}>Ștergerea datelor</Link></li>
              <li><Link to="/cookies" className={link}>Politica de cookies</Link></li>
              <li><Link to="/contact" className={link}>Contact</Link></li>
            </ul>
            <p className="mt-2.5 text-xs text-white/45">{t("footer_anpc")}</p>
            <LegalBadges />
          </div>

          <div>
            <h4 className={head}>{t("f_contact")}</h4>
            <ul className={`mt-2 ${col}`}>
              <li>
                <a href="mailto:contact@verificasa.ro" className={link}>contact@verificasa.ro</a>
              </li>
              <li>
                <a href="https://instagram.com/verificasaro" target="_blank" rel="noopener noreferrer" className={link}>
                  Instagram <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href="https://tiktok.com/@verificasaro" target="_blank" rel="noopener noreferrer" className={link}>
                  TikTok <span aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
            <p className="mt-2.5 text-xs text-white/45">{t("footer_coverage")}</p>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-1 pt-4 text-[11px] text-white/40 sm:flex-row">
          <p>{t("footer_copy")}</p>
          <p>{t("footer_compliance")}</p>
        </div>
      </Reveal>
    </footer>
  );
}
