import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User, Plus, Home, LogOut, Heart, MessageCircle, Settings, ShieldCheck,
  LayoutDashboard, Bookmark, Search, ChevronDown, Globe, Check, Bell, Moon, Sun, Flag,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import ThemeToggle from "@/components/ThemeToggle";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];

export default function Header() {
  const { currency, setCurrency, lang, setLang, t } = useCountry();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (to) => location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  const navItemCls = (to) =>
    `text-sm font-semibold transition hover:text-emerald ${isActive(to) ? "text-emerald" : "text-foreground/80"}`;
  const navItemClsMobile = (to) =>
    `text-xs font-bold transition ${isActive(to) ? "text-emerald" : "text-foreground/70"}`;
  const greeting = user?.full_name || user?.email || (lang === "en" ? "user" : "utilizator");
  const role = (user?.role || "").toUpperCase();
  const canAdmin = ADMIN_ROLES.includes(role);

  // Hide the entire header on scroll-down, reveal on scroll-up.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Always visible at the very top of the page.
      if (y < 8) { setHidden(false); lastY.current = y; return; }
      if (y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Shared currency / language switcher (compact on mobile, full on desktop).
  const CurrencySwitch = ({ compact = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-xs font-bold text-navy shadow-soft transition hover:border-emerald/50 dark:bg-navy dark:text-foreground">
          <Globe className="h-4 w-4 text-emerald" />
          <span className="hidden md:inline">💰 {currency === "EUR" ? "🇪🇺" : "🇷🇴"} {currency}</span>
          <span className="hidden md:inline text-muted-foreground">·</span>
          <span className="hidden md:inline">🗣️ {lang === "ro" ? "🇷🇴" : "🇬🇧"} {lang.toUpperCase()}</span>
          <span className="md:hidden">{currency === "EUR" ? "💶" : "💵"}</span>
          <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground md:inline" />
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

  // Inline theme toggle rendered inside the account dropdown.
  const ThemeMenuItem = () => {
    const [theme, setTheme] = useState(() => (typeof window !== "undefined" && localStorage.getItem("vc_theme")) || "light");
    const isDark = theme === "dark";
    return (
      <DropdownMenuItem
        className="cursor-pointer font-semibold"
        onClick={() => {
          const next = isDark ? "light" : "dark";
          setTheme(next);
          localStorage.setItem("vc_theme", next);
          if (next === "dark") document.documentElement.classList.add("dark");
          else document.documentElement.classList.remove("dark");
        }}
      >
        {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
        {isDark ? "Tema deschisă" : "Tema întunecată"}
      </DropdownMenuItem>
    );
  };

  // Shared profile dropdown trigger + content (used in both desktop and mobile rows).
  const ProfileMenu = ({ mobile = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-9 items-center gap-2 rounded-full border border-border bg-white px-2.5 text-sm font-semibold text-navy shadow-soft transition hover:border-emerald/50 dark:bg-navy dark:text-foreground">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-soft text-emerald">
              <User className="h-4 w-4" />
            </span>
          )}
          {!mobile && <span className="hidden max-w-[120px] truncate sm:inline">{greeting.split(" ")[0]}</span>}
          {!mobile && <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-navy-deep">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t("hdr_myaccount")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigate("/")}><LayoutDashboard className="mr-2 h-4 w-4" /> {t("hdr_dashboard")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/messages")}><MessageCircle className="mr-2 h-4 w-4" /> {t("hdr_messages")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Bell className="mr-2 h-4 w-4" /> Notificări
          {unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/saved")}><Bookmark className="mr-2 h-4 w-4" /> {t("hdr_saved")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/searches")}><Search className="mr-2 h-4 w-4" /> {t("hdr_searches")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my-reports")}><Flag className="mr-2 h-4 w-4" /> Rapoartele mele</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.open("/post-property", "_blank", "noopener,noreferrer")}><Plus className="mr-2 h-4 w-4" /> {t("hdr_add_listing")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my-properties")}><Home className="mr-2 h-4 w-4" /> {t("hdr_myprops")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}><Settings className="mr-2 h-4 w-4" /> {t("hdr_settings")}</DropdownMenuItem>
        {canAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin")}><ShieldCheck className="mr-2 h-4 w-4" /> {t("hdr_admin")}</DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { document.getElementById("account-menu")?.scrollIntoView({ behavior: "smooth", block: "start" }); navigate("/account#account-menu"); }}><Settings className="mr-2 h-4 w-4" /> Preferințe cont</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}><LogOut className="mr-2 h-4 w-4" /> {t("hdr_logout")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/60 bg-white/85 backdrop-blur-xl transition-all duration-300 ease-out dark:bg-navy-deep/85 ${hidden ? "-translate-y-[calc(100%+4px)] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <VerifiCasaLogo size={44} tagline={false} />
            <span className="hidden rounded-full border border-gold/40 bg-gold-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-deep lg:inline dark:bg-gold/10 dark:text-gold">
              {t("hdr_tag")}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className={navItemCls("/")}>{t("hdr_home")}</Link>
            <Link to="/search" className={navItemCls("/search")}>{t("sb_btn")}</Link>
            <Link to="/about" className={navItemCls("/about")}>{t("hdr_about")}</Link>
          </nav>

          {/* Top-right actions — desktop keeps currency + theme; mobile reaches them via the account menu. */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:block"><CurrencySwitch /></div>
            <div className="hidden md:block"><ThemeToggle /></div>

            {isAuthenticated ? (
              <>
                <Button asChild className="hidden rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90 md:flex">
                  <a href="/post-property" target="_blank" rel="noopener noreferrer"><Plus className="h-4 w-4" /> {t("hdr_add")}</a>
                </Button>
                <div className="hidden md:block"><ProfileMenu /></div>
              </>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/login" className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground/80 transition hover:text-emerald dark:bg-navy dark:border-navy">
                  <User className="h-4 w-4" /> {t("hdr_login")}
                </Link>
                <Button asChild className="rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
                  <Link to="/register"><Heart className="h-4 w-4" /> {t("hdr_register")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile compact action row — nav links left, action group right. */}
        <div className="flex items-center justify-between gap-2 border-t border-border/50 py-1.5 md:hidden">
          <nav className="flex items-center gap-3.5 overflow-x-auto whitespace-nowrap">
            <Link to="/" className={navItemClsMobile("/")}>{t("hdr_home")}</Link>
            <Link to="/search" className={navItemClsMobile("/search")}>{t("sb_btn")}</Link>
            <Link to="/about" className={navItemClsMobile("/about")}>{t("hdr_about")}</Link>
            {isAuthenticated && <Link to="/my-properties" className={navItemClsMobile("/my-properties")}>{t("hdr_myprops")}</Link>}
            {isAuthenticated && <Link to="/messages" className={navItemClsMobile("/messages")}>{t("hdr_messages")}</Link>}
            {isAuthenticated && <Link to="/saved" className={navItemClsMobile("/saved")}>{t("hdr_saved")}</Link>}
          </nav>
          <div className="flex items-center gap-1.5 shrink-0">
            {isAuthenticated ? (
              <>
                <a href="/post-property" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-white shadow-soft" aria-label={t("hdr_add")}>
                  <Plus className="h-4 w-4" />
                </a>
                <ProfileMenu mobile />
              </>
            ) : (
              <Link to="/login" className="flex h-8 items-center gap-1 rounded-full border border-border bg-white px-2.5 text-[11px] font-bold text-foreground/80 dark:bg-navy dark:border-navy">
                <User className="h-3.5 w-3.5" /> {t("hdr_login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}