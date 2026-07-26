import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Plus, Home, LogOut, Heart, MessageCircle, Settings, ShieldCheck,
  LayoutDashboard, Bookmark, Search, ChevronDown, Globe, Check, Bell,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Image as UIImage } from "@/components/ui/image";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import ThemeToggle from "@/components/ThemeToggle";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];

export default function Header() {
  const { currency, setCurrency, lang, setLang, t } = useCountry();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const greeting = user?.full_name || user?.email || (lang === "en" ? "user" : "utilizator");
  const role = (user?.role || "").toUpperCase();
  const canAdmin = ADMIN_ROLES.includes(role);

  // Hide the entire header on scroll-down, reveal on scroll-up.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 140 && y > lastY.current + 6) setHidden(true);
      else if (y < lastY.current - 6) setHidden(false);
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
          {compact && <span className="md:hidden">{currency}</span>}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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

  // Shared profile dropdown trigger + content (used in both desktop and mobile rows).
  const ProfileMenu = ({ mobile = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-9 items-center gap-2 rounded-full border border-border bg-white px-2.5 text-sm font-semibold text-navy shadow-soft transition hover:border-emerald/50 dark:bg-navy dark:text-foreground">
          {user?.avatar_url ? (
            <UIImage src={user.avatar_url} fittingType="fill" className="h-7 w-7 rounded-full object-cover" />
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/owner")}><Plus className="mr-2 h-4 w-4" /> {t("hdr_add_listing")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my-properties")}><Home className="mr-2 h-4 w-4" /> {t("hdr_myprops")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}><Settings className="mr-2 h-4 w-4" /> {t("hdr_settings")}</DropdownMenuItem>
        {canAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin")}><ShieldCheck className="mr-2 h-4 w-4" /> {t("hdr_admin")}</DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}><LogOut className="mr-2 h-4 w-4" /> {t("hdr_logout")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/60 bg-white/85 backdrop-blur-xl transition-transform duration-300 dark:bg-navy-deep/85 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <VerifiCasaLogo size={44} tagline={false} />
            <span className="hidden rounded-full border border-gold/40 bg-gold-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-deep lg:inline dark:bg-gold/10 dark:text-gold">
              {t("hdr_tag")}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm font-semibold text-foreground/80 transition hover:text-emerald">{t("hdr_home")}</Link>
            <Link to="/about" className="text-sm font-semibold text-foreground/80 transition hover:text-emerald">{t("hdr_about")}</Link>
          </nav>

          {/* Top-right actions — desktop keeps full buttons, mobile keeps only currency + theme. */}
          <div className="flex items-center gap-2.5">
            <CurrencySwitch />
            <div className="hidden md:block"><ThemeToggle /></div>

            {isAuthenticated ? (
              <>
                <Button asChild className="hidden rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90 md:flex">
                  <Link to="/owner"><Plus className="h-4 w-4" /> {t("hdr_add")}</Link>
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

        {/* Mobile compact action row — small buttons so they never overflow. */}
        <div className="flex items-center justify-between gap-2 border-t border-border/50 py-2 md:hidden">
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link to="/owner" className="flex h-8 items-center gap-1 rounded-full bg-emerald px-2.5 text-[11px] font-bold text-white shadow-soft">
                  <Plus className="h-3.5 w-3.5" /> {t("hdr_add")}
                </Link>
                <ProfileMenu mobile />
              </>
            ) : (
              <Link to="/login" className="flex h-8 items-center gap-1 rounded-full border border-border bg-white px-2.5 text-[11px] font-bold text-foreground/80 dark:bg-navy dark:border-navy">
                <User className="h-3.5 w-3.5" /> {t("hdr_login")}
              </Link>
            )}
            {!isAuthenticated && (
              <Button asChild className="h-8 rounded-full bg-emerald px-2.5 text-[11px] font-bold text-white shadow-soft hover:bg-emerald/90">
                <Link to="/register"><Heart className="h-3.5 w-3.5" /> {t("hdr_register")}</Link>
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
            <Link to="/" className="whitespace-nowrap text-xs font-bold text-emerald">{t("hdr_home")}</Link>
            <Link to="/about" className="whitespace-nowrap text-xs font-semibold text-foreground/70">{t("hdr_about")}</Link>
            {isAuthenticated && <Link to="/my-properties" className="whitespace-nowrap text-xs font-semibold text-foreground/70">{t("hdr_myprops")}</Link>}
          </div>
        </div>
      </div>
    </header>
  );
}