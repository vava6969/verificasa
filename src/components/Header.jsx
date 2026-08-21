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
import NotificationBell from "@/components/NotificationBell";

// Registry chrome: the header is a solid paper bar with a hairline rule —
// the document's frame, identical on every page. No glass, no gradient
// scrim; the hero photograph starts UNDER the bar, not behind it.
export default function Header() {
  const { currency, setCurrency, lang, setLang, t } = useCountry();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isActive = (to) => location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  const navItemCls = (to) =>
    `text-sm font-semibold transition-colors hover:text-emerald ${isActive(to) ? "text-emerald" : "text-foreground/75"}`;

  // Header shows only at the very top of the page (existing behavior kept).
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY >= 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const CurrencySwitch = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded border border-border bg-card text-foreground transition-colors hover:border-emerald"
          aria-label={`${t("hdr_currency")} / ${t("hdr_language")}`}
        >
          <Globe className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t("hdr_currency")}</DropdownMenuLabel>
        {["EUR", "RON"].map((c) => (
          <DropdownMenuItem key={c} onClick={() => setCurrency(c)} className="cursor-pointer font-semibold">
            {c}
            {currency === c && <Check className="ml-auto h-4 w-4 text-emerald" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t("hdr_language")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setLang("ro")} className="cursor-pointer font-semibold">
          Română
          {lang === "ro" && <Check className="ml-auto h-4 w-4 text-emerald" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("en")} className="cursor-pointer font-semibold">
          English
          {lang === "en" && <Check className="ml-auto h-4 w-4 text-emerald" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border bg-background transition-transform duration-300 ${hidden ? "-translate-y-[calc(100%+4px)] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2">
          <Link to="/" className="flex min-w-0 items-center">
            <VerifiCasaLogo size={38} tagline={false} />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className={navItemCls("/")}>{t("hdr_home")}</Link>
            <Link to="/search" className={navItemCls("/search")}>{t("sb_btn")}</Link>
            <Link to="/about" className={navItemCls("/about")}>{t("hdr_about")}</Link>
            <Link to="/upgrade" className={navItemCls("/upgrade")}>{t("hdr_upgrade")}</Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden md:block"><CurrencySwitch /></div>
            <div className="hidden md:block"><ThemeToggle /></div>
            <NotificationBell />

            {isAuthenticated ? (
              <>
                <Link
                  to="/post-property"
                  aria-label={t("hdr_add")}
                  className="flex h-9 items-center justify-center gap-1 rounded bg-emerald px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90 md:px-4"
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
                  className="flex h-9 items-center gap-1.5 rounded bg-emerald px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90"
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
