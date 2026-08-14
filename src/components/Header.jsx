import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User, Plus, Home, LogOut, MessageCircle, Settings, ShieldCheck,
  LayoutDashboard, Bookmark, Search, ChevronDown, Globe, Check, Bell, Moon, Sun, Flag,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
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
  const isLanding = location.pathname === "/";
  const navItemCls = (to) =>
    `text-sm font-semibold transition hover:text-emerald ${isActive(to) ? "text-emerald" : isLanding ? "text-white/90" : "text-foreground/80"}`;
  const navItemClsMobile = (to) =>
    `text-xs font-bold transition ${isActive(to) ? "text-emerald" : isLanding ? "text-white/80" : "text-foreground/70"}`;
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

  // One row inside the account dropdown: colored icon badge + label.
  const MenuRow = ({ onClick, icon: Icon, color, label, children }) => (
    <DropdownMenuItem onClick={onClick} className="cursor-pointer gap-2.5 rounded-lg py-2">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="font-medium">{label}</span>
      {children}
    </DropdownMenuItem>
  );

  // Shared profile dropdown trigger + content (used in both desktop and mobile rows).
  const ProfileMenu = ({ mobile = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-9 items-center gap-2 rounded-full border border-border/50 bg-white/60 px-2.5 text-sm font-semibold text-navy shadow-soft backdrop-blur-md transition hover:border-emerald/50 dark:bg-navy-deep/60 dark:text-foreground">
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
      <DropdownMenuContent align="end" className="w-64 origin-top-right p-1.5">
        <div className="flex items-center gap-2.5 px-2 py-2">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-soft text-emerald"><User className="h-4.5 w-4.5" /></span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-navy dark:text-foreground">{greeting}</p>
            <p className="text-[11px] text-muted-foreground">{t("hdr_myaccount")}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <MenuRow onClick={() => navigate("/")} icon={LayoutDashboard} color="bg-sky-500/15 text-sky-600 dark:text-sky-400" label={t("hdr_dashboard")} />
        <MenuRow onClick={() => navigate("/messages")} icon={MessageCircle} color="bg-emerald/15 text-emerald" label={t("hdr_messages")} />
        <MenuRow onClick={() => navigate("/settings")} icon={Bell} color="bg-amber-500/15 text-amber-600 dark:text-amber-400" label="Notificări">
          {unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </MenuRow>
        <MenuRow onClick={() => navigate("/saved")} icon={Bookmark} color="bg-rose-500/15 text-rose-500" label={t("hdr_saved")} />
        <MenuRow onClick={() => navigate("/searches")} icon={Search} color="bg-violet-500/15 text-violet-600 dark:text-violet-400" label={t("hdr_searches")} />
        <MenuRow onClick={() => navigate("/my-reports")} icon={Flag} color="bg-orange-500/15 text-orange-600 dark:text-orange-400" label="Rapoartele mele" />
        <DropdownMenuSeparator />
        <MenuRow onClick={() => navigate("/post-property")} icon={Plus} color="bg-emerald/15 text-emerald" label={t("hdr_add_listing")} />
        <MenuRow onClick={() => navigate("/my-properties")} icon={Home} color="bg-navy/10 text-navy dark:bg-white/10 dark:text-foreground" label={t("hdr_myprops")} />
        <MenuRow onClick={() => navigate("/settings")} icon={Settings} color="bg-slate-500/15 text-slate-600 dark:text-slate-400" label={t("hdr_settings")} />
        {canAdmin && (
          <>
            <DropdownMenuSeparator />
            <MenuRow onClick={() => navigate("/admin")} icon={ShieldCheck} color="bg-gold/20 text-gold-deep dark:text-gold" label={t("hdr_admin")} />
          </>
        )}
        <DropdownMenuSeparator />
        <MenuRow onClick={() => { document.getElementById("account-menu")?.scrollIntoView({ behavior: "smooth", block: "start" }); navigate("/account#account-menu"); }} icon={Settings} color="bg-navy/10 text-navy dark:bg-white/10 dark:text-foreground" label="Preferințe cont" />
        <DropdownMenuSeparator />
        <MenuRow onClick={() => logout()} icon={LogOut} color="bg-rose-500/15 text-rose-500" label={t("hdr_logout")} />
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out ${isLanding ? "bg-gradient-to-b from-black/30 to-transparent" : "border-b border-border/30 bg-white/55 backdrop-blur-2xl dark:bg-navy-deep/40"} ${hidden ? "-translate-y-[calc(100%+4px)] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <VerifiCasaLogo size={36} tagline={false} tone={isLanding ? "light" : "dark"} />
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