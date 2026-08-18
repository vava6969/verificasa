import React from "react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import LegalBadges from "@/components/LegalBadges";

// Registry footer: ink field, ruled columns, mono labels. Links are plain
// text — external ones carry a text arrow, not an icon.
export default function Footer() {
  const { t } = useCountry();

  const platform = [
    { to: "/search", label: t("f_search") },
    { to: "/about", label: t("footer_about") },
    { to: "/search?ai=1", label: t("footer_aitours") },
    { to: "/search?field=1", label: t("footer_field") },
    { to: "/owner", label: t("nav_owners") },
  ];

  const legal = [
    { to: "/terms", label: t("footer_terms") },
    { to: "/privacy", label: t("footer_privacy") },
    { to: "/data-deletion", label: "Ștergerea Datelor" },
    { to: "/cookies", label: "Politica de Cookies" },
    { to: "/contact", label: "Contact" },
  ];

  const social = [
    { href: "mailto:contact@verificasa.ro", label: "contact@verificasa.ro", external: false },
    { href: "https://instagram.com/verificasaro", label: "Instagram — @verificasaro", external: true },
    { href: "https://tiktok.com/@verificasaro", label: "TikTok — @verificasaro", external: true },
  ];

  return (
    <footer className="bg-navy-deep text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-4">
          <div>
            <VerifiCasaLogo size={44} tagline={false} tone="light" />
            <p className="mt-4 text-sm leading-relaxed text-white/55">{t("footer_desc_vc")}</p>
            <p className="stamp-line mt-4 text-white/60">{t("footer_inspectii")}</p>
          </div>

          <div>
            <p className="kicker text-white/45">{t("f_platform")}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              {platform.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="kicker text-white/45">{t("f_legal")}</p>
            <p className="mt-4 text-xs leading-relaxed text-white/45">{t("footer_anpc")}</p>
            <ul className="mt-3 space-y-2.5 text-sm text-white/65">
              {legal.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
            <LegalBadges />
          </div>

          <div>
            <p className="kicker text-white/45">{t("f_contact")}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              {social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="transition-colors hover:text-white"
                  >
                    {s.label}
                    {s.external && <span aria-hidden="true" className="ml-1 text-white/40">↗</span>}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-white/45">{t("footer_coverage")}</p>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/40">{t("footer_copy")}</p>
          <p className="stamp-line text-white/35">{t("footer_compliance")}</p>
        </div>
      </div>
    </footer>
  );
}
