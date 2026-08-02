import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, MessageCircle, Bell, Bookmark, Search, Plus, Home,
  Settings as SettingsIcon, ShieldCheck, LogOut, Moon, Sun, Check,
} from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];

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

  const en = lang === "en";
  const options = [
    { icon: LayoutDashboard, label: en ? "Home" : "Acasă", path: "/" },
    { icon: MessageCircle, label: en ? "Chat" : "Mesaje", path: "/messages" },
    { icon: Bell, label: en ? "Alerts" : "Alerte", path: "/settings", badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null },
    { icon: Bookmark, label: en ? "Saved" : "Salvate", path: "/saved" },
    { icon: Search, label: en ? "Searches" : "Căutări", path: "/searches" },
    { icon: Plus, label: en ? "Add" : "Adaugă", path: "/owner" },
    { icon: Home, label: en ? "Listings" : "Anunțuri", path: "/my-properties" },
    { icon: SettingsIcon, label: en ? "Settings" : "Setări", path: "/settings" },
    ...(canAdmin ? [{ icon: ShieldCheck, label: "Admin", path: "/admin", admin: true }] : []),
  ];

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
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <Link
                key={opt.label}
                to={opt.path}
                className="group flex flex-col items-center gap-1.5 text-center"
              >
                <span className="relative">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full border transition group-hover:scale-105 ${opt.admin ? "border-gold/50 bg-gold-soft text-gold-deep" : "border-emerald/40 bg-emerald-soft text-emerald"}`}>
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
          })}
        </div>
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
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><span>🎨</span> Tema</p>
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
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><span>💰</span> {t("hdr_currency")}</p>
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
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><span>🗣️</span> {t("hdr_language")}</p>
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
        </div>
      </section>
    </div>
  );
}