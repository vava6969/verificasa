import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Plus, Globe, Check } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import ThemeToggle from "@/components/ThemeToggle";
import SiteNavMenu from "@/components/SiteNavMenu";

export default function Header() {
  const { currency, setCurrency, lang, setLang, t } = useCountry();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isActive = (to) => location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  const isLanding = location.pathname === "/";
  // Pagina de anunț își întinde galeria de poze până sub header — header-ul
  // devine transparent/glassmorphic acolo la fel ca pe homepage, ca imaginea
  // să se vadă prin el în loc de o dungă albă solidă.
  const isHeroHeader = isLanding || location.pathname.startsWith("/property/");
  const navItemCls = (to) =>
    `text-sm font-semibold transition hover:text-emerald ${isActive(to) ? "text-emerald" : isHeroHeader ? "text-white/90" : "text-foreground/80"}`;
  const navItemClsMobile = (to) =>
    `text-xs font-bold transition ${isActive(to) ? "text-emerald" : isHeroHeader ? "text-white/80" : "text-foreground/70"}`;

  // Top menu only appears at the very top of the page — hidden anywhere else
  // (no reveal on scroll-up), so users must scroll all the way up to reach it.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 8) setHidden(false);
      else setHidden(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Shared currency / language switcher (compact on mobile, full on desktop).
  const CurrencySwitch = ({ compact = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-white/60 text-foreground shadow-soft backdrop-blur-md transition hover:border-emerald/50 dark:bg-card/60" aria-label={`${t("hdr_currency")} / ${t("hdr_language")}`}>
          <Globe className="h-4 w-4 text-emerald" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">💰 {t("hdr_currency")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setCurrency("EUR")} className="cursor-pointer font-semibold">
          <span className="mr-2">🇪🇺 💶</span> EUR
          {currency === "EUR" && <Check className="ml-auto h-4 w-4 text-emerald" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("RON")} className="cursor-pointer font-semibold">
          <span className="mr-2">🇷🇴 💵</span> RON
          {currency === "RON" && <Check className="ml-auto h-4 w-4 text-emerald" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">🗣️ {t("hdr_language")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setLang("ro")} className="cursor-pointer font-semibold">
          <span className="mr-2">🇷🇴</span> Română
          {lang === "ro" && <Check className="ml-auto h-4 w-4 text-emerald" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("en")} className="cursor-pointer font-semibold">
          <span className="mr-2">🇬🇧</span> English
          {lang === "en" && <Check className="ml-auto h-4 w-4 text-emerald" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out ${isHeroHeader ? "bg-gradient-to-b from-black/30 to-transparent" : "border-b border-border/30 bg-white/55 backdrop-blur-2xl dark:bg-navy-deep/40"} ${hidden ? "-translate-y-[calc(100%+4px)] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <VerifiCasaLogo size={36} tagline={false} tone={isHeroHeader ? "light" : "dark"} />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className={navItemCls("/")}>{t("hdr_home")}</Link>
            <Link to="/search" className={navItemCls("/search")}>{t("sb_btn")}</Link>
            <Link to="/about" className={navItemCls("/about")}>{t("hdr_about")}</Link>
            <Link to="/upgrade" className={navItemCls("/upgrade")}>{t("hdr_upgrade")}</Link>
          </nav>

          {/* Top-right actions — shared by desktop and mobile. */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden md:block"><CurrencySwitch /></div>
            <div className="hidden md:block"><ThemeToggle /></div>

            {isAuthenticated ? (
              <>
                <Link
                  to="/post-property"
                  aria-label={t("hdr_add")}
                  className="flex h-9 items-center justify-center gap-1 rounded-full bg-emerald px-3 text-white shadow-soft transition hover:bg-emerald/90 md:px-4"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">{t("hdr_add")}</span>
                </Link>
                <SiteNavMenu />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex h-9 items-center gap-1.5 rounded-full bg-emerald px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald/90"
                >
                  <User className="h-4 w-4" />
                  <span>{t("hdr_login")}</span>
                </Link>
                <SiteNavMenu />
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}