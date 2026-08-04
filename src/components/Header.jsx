import React, { useEffect, useState } from "react";
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
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-soft transition hover:border-emerald/50 dark:bg-card" aria-label={`${t("hdr_currency")} / ${t("hdr_language")}`}>
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
        <DropdownMenuItem onClick={() => navigate("/post-property")}><Plus className="mr-2 h-4 w-4" /> {t("hdr_add_listing")}</DropdownMenuItem>
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
        <div className="flex h-14 items-center justify-between gap-2">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <VerifiCasaLogo size={36} tagline={false} />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className={navItemCls("/")}>{t("hdr_home")}</Link>
            <Link to="/search" className={navItemCls("/search")}>{t("sb_btn")}</Link>
            <Link to="/about" className={navItemCls("/about")}>{t("hdr_about")}</Link>
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
                <ProfileMenu />
              </>
            ) : (
              <Link
                to="/login"
                className="flex h-9 items-center gap-1.5 rounded-full bg-emerald px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald/90"
              >
                <User className="h-4 w-4" />
                <span>{t("hdr_login")}</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}