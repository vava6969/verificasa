import React from "react";
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

const CITY_LINKS = [
  { labelKey: "city_iasi", city: "Iași" },
  { labelKey: "city_husi", city: "Huși" },
];

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];

export default function Header() {
  const { currency, setCurrency, lang, setLang, t } = useCountry();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const greeting = user?.full_name || user?.email || (lang === "en" ? "user" : "utilizator");
  const role = (user?.role || "").toUpperCase();
  const canAdmin = ADMIN_ROLES.includes(role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/85 backdrop-blur-xl dark:bg-navy-deep/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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

        <div className="flex items-center gap-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-xs font-bold text-navy shadow-soft transition hover:border-emerald/50 dark:bg-navy dark:text-foreground">
                <Globe className="h-4 w-4 text-emerald" />
                <span>{currency === "EUR" ? "🇬🇧" : "🇷🇴"} {currency}</span>
                <span className="text-muted-foreground">·</span>
                <span>{lang === "ro" ? "🇷🇴" : "🇬🇧"} {lang.toUpperCase()}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t("hdr_currency")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setCurrency("EUR")} className="cursor-pointer font-semibold">
                <span className="mr-2">🇬🇧</span> EUR
                {currency === "EUR" && <Check className="ml-auto h-4 w-4 text-emerald" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrency("RON")} className="cursor-pointer font-semibold">
                <span className="mr-2">🇷🇴</span> RON
                {currency === "RON" && <Check className="ml-auto h-4 w-4 text-emerald" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t("hdr_language")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setLang("ro")} className="cursor-pointer font-semibold">
                <span className="mr-2">🇷🇴</span> RO
                {lang === "ro" && <Check className="ml-auto h-4 w-4 text-emerald" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("en")} className="cursor-pointer font-semibold">
                <span className="mr-2">🇬🇧</span> EN
                {lang === "en" && <Check className="ml-auto h-4 w-4 text-emerald" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Button asChild className="hidden rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90 sm:flex">
                <Link to="/owner"><Plus className="h-4 w-4" /> {t("hdr_add")}</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative flex h-9 items-center gap-2 rounded-full border border-border bg-white px-3 text-sm font-semibold text-navy shadow-soft transition hover:border-emerald/50 dark:bg-navy dark:text-foreground">
                    {user?.avatar_url ? (
                      <UIImage src={user.avatar_url} fittingType="fill" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                        <User className="h-4 w-4" />
                      </span>
                    )}
                    <span className="hidden max-w-[120px] truncate sm:inline">{greeting.split(" ")[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
            </>
          ) : (
            <>
              <Link to="/login" className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground/80 transition hover:text-emerald dark:bg-navy dark:border-navy">
                <User className="h-4 w-4" /> {t("hdr_login")}
              </Link>
              <Button asChild className="rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
                <Link to="/register"><Heart className="h-4 w-4" /> <span className="hidden sm:inline">{t("hdr_register")}</span></Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5 overflow-x-auto border-t border-border/50 px-4 py-2 md:hidden">
        <Link to="/" className="whitespace-nowrap text-xs font-bold text-emerald">{t("hdr_home")}</Link>
        <Link to="/about" className="whitespace-nowrap text-xs font-semibold text-foreground/70">{t("hdr_about")}</Link>
        {isAuthenticated && <Link to="/my-properties" className="whitespace-nowrap text-xs font-semibold text-foreground/70">{t("hdr_myprops")}</Link>}
      </div>
    </header>
  );
}