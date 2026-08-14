import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageCircle, Bell, Bookmark, Search, Plus, Home,
  Settings as SettingsIcon, ShieldCheck, LogOut, Moon, Sun, Check, Cookie,
  ChevronDown, Palette, Coins, Languages,
} from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];

const OPTION_COLORS = {
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-400",
  emerald: "border-emerald/40 bg-emerald-soft text-emerald",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-400",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-400",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-600 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-400",
  indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-400",
  slate: "border-slate-400/40 bg-slate-400/10 text-slate-600 dark:border-slate-400/30 dark:bg-slate-400/10 dark:text-slate-300",
  gold: "border-gold/50 bg-gold-soft text-gold-deep",
};

export default function Account() {
  const { t, lang, setLang, currency, setCurrency } = useCountry();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const role = (user?.role || "").toUpperCase();
  const canAdmin = ADMIN_ROLES.includes(role);
  const greeting = user?.full_name || user?.email || (lang === "en" ? "user" : "utilizator");

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("vc_theme") || "light";
  });
  const isDark = theme === "dark";
  const setThemeValue = (v) => {
    setTheme(v);
    localStorage.setItem("vc_theme", v);
    if (v === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const [menuExpanded, setMenuExpanded] = useState(false);

  const en = lang === "en";
  const options = [
    { icon: LayoutDashboard, label: en ? "Home" : "Acasă", path: "/", color: "sky" },
    { icon: MessageCircle, label: en ? "Chat" : "Mesaje", path: "/messages", color: "emerald" },
    { icon: Bell, label: en ? "Alerts" : "Alerte", path: "/settings", badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null, color: "amber" },
    { icon: Bookmark, label: en ? "Saved" : "Salvate", path: "/saved", color: "rose" },
    { icon: Search, label: en ? "Searches" : "Căutări", path: "/searches", color: "violet" },
    { icon: Plus, label: en ? "Add" : "Adaugă", path: "/owner", color: "teal" },
    { icon: Home, label: en ? "Listings" : "Anunțuri", path: "/my-properties", color: "indigo" },
    { icon: SettingsIcon, label: en ? "Settings" : "Setări", path: "/settings", color: "slate" },
    ...(canAdmin ? [{ icon: ShieldCheck, label: "Admin", path: "/admin", admin: true, color: "gold" }] : []),
  ];
  const primaryOptions = options.slice(0, 4);
  const secondaryOptions = options.slice(4);

  const renderOption = (opt) => {
    const Icon = opt.icon;
    return (
      <Link key={opt.label} to={opt.path} className="group flex flex-col items-center gap-1.5 text-center">
        <span className="relative">
          <span className={`flex h-12 w-12 items-center justify-center rounded-full border transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105 ${OPTION_COLORS[opt.color] || OPTION_COLORS.emerald}`}>
            <Icon className="h-5 w-5" />
          </span>
          {opt.badge && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
              {opt.badge}
            </span>
          )}
        </span>
        <span className="w-full truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{opt.label}</span>
      </Link>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      {/* Profile header */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft sm:p-4">
        <VerifiCasaLogo size={40} tagline={false} wordmark={false} />
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold sm:text-lg">{greeting}</h1>
          <p className="text-xs text-muted-foreground">{t("hdr_myaccount")}</p>
        </div>
      </div>

      {/* Account options grid */}
      <section id="account-menu" className="mb-6 scroll-mt-20 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("hdr_myaccount")}</h2>

        <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6">
          {primaryOptions.map(renderOption)}
        </div>

        {secondaryOptions.length > 0 && (
          <>
            <AnimatePresence initial={false}>
              {menuExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-4 gap-x-2 gap-y-4 pt-4 sm:grid-cols-6">
                    {secondaryOptions.map(renderOption)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setMenuExpanded((v) => !v)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70 transition hover:text-emerald active:scale-[0.98]"
            >
              {menuExpanded ? (en ? "Show less" : "Restrânge meniul") : (en ? "More options" : "Mai multe opțiuni")}
              <motion.span animate={{ rotate: menuExpanded ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex">
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
            </button>
          </>
        )}

        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => { logout("/"); }}
        >
          <LogOut className="mr-2 h-4 w-4" /> {t("hdr_logout")}
        </Button>
      </section>

      {/* Preferințe section */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Preferințe</h2>
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          {/* Tema */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Palette className="h-4 w-4 text-emerald" /> Tema</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setThemeValue("light")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${!isDark ? "border-emerald bg-emerald-soft text-emerald" : "border-border bg-background text-muted-foreground hover:border-emerald/50"}`}
              >
                <Sun className="h-4 w-4" /> Tema deschisă {!isDark && <Check className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setThemeValue("dark")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${isDark ? "border-emerald bg-emerald-soft text-emerald" : "border-border bg-background text-muted-foreground hover:border-emerald/50"}`}
              >
                <Moon className="h-4 w-4" /> Tema întunecată {isDark && <Check className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Monedă */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Coins className="h-4 w-4 text-emerald" /> {t("hdr_currency")}</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ v: "EUR", el: "🇪🇺 💶" }, { v: "RON", el: "🇷🇴 💵" }].map((c) => (
                <button
                  key={c.v}
                  onClick={() => setCurrency(c.v)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${currency === c.v ? "border-emerald bg-emerald-soft text-emerald" : "border-border bg-background text-muted-foreground hover:border-emerald/50"}`}
                >
                  <span>{c.el}</span> {c.v} {currency === c.v && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Limbă */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Languages className="h-4 w-4 text-emerald" /> {t("hdr_language")}</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ v: "ro", el: "🇷🇴", label: "Română" }, { v: "en", el: "🇬🇧", label: "English" }].map((l) => (
                <button
                  key={l.v}
                  onClick={() => setLang(l.v)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${lang === l.v ? "border-emerald bg-emerald-soft text-emerald" : "border-border bg-background text-muted-foreground hover:border-emerald/50"}`}
                >
                  <span>{l.el}</span> {l.label} {lang === l.v && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Cookie settings */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Cookie className="h-4 w-4 text-emerald" /> {en ? "Cookie settings" : "Setări cookies"}</p>
            <button
              onClick={() => window.dispatchEvent(new Event("vc-open-cookie-prefs"))}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-emerald/50 hover:text-emerald"
            >
              <Cookie className="h-4 w-4" /> {en ? "Manage cookie preferences" : "Gestionează preferințele cookies"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}