import React, { useState, useEffect, useRef } from "react";
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

  const menuRef = useRef(null);

  useEffect(() => {
    // On mobile the profile header pushes the menu grid below the fold;
    // auto-scroll the options section into view so the menu is visible.
    const t = setTimeout(() => {
      menuRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(t);
  }, []);

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

  const options = [
    { icon: LayoutDashboard, label: t("hdr_dashboard"), path: "/" },
    { icon: MessageCircle, label: t("hdr_messages"), path: "/messages" },
    { icon: Bell, label: "Notificări", path: "/settings", badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null },
    { icon: Bookmark, label: t("hdr_saved"), path: "/saved" },
    { icon: Search, label: t("hdr_searches"), path: "/searches" },
    { icon: Plus, label: t("hdr_add_listing"), path: "/owner" },
    { icon: Home, label: t("hdr_myprops"), path: "/my-properties" },
    { icon: SettingsIcon, label: t("hdr_settings"), path: "/settings" },
    ...(canAdmin ? [{ icon: ShieldCheck, label: t("hdr_admin"), path: "/admin", admin: true }] : []),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
        <VerifiCasaLogo size={56} tagline={false} />
        <div>
          <h1 className="text-xl font-bold">{greeting}</h1>
          <p className="text-sm text-muted-foreground">{t("hdr_myaccount")}</p>
        </div>
      </div>

      {/* Account options grid */}
      <section ref={menuRef} className="mb-8 scroll-mt-20">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("hdr_myaccount")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <Link
                key={opt.label}
                to={opt.path}
                className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-soft transition hover:border-emerald/50 hover:bg-emerald-soft/40"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${opt.admin ? "bg-gold-soft text-gold-deep" : "bg-emerald-soft text-emerald"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                {opt.badge && (
                  <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {opt.badge}
                  </span>
                )}
                <span className="text-sm font-semibold">{opt.label}</span>
              </Link>
            );
          })}
        </div>
        <Button
          variant="outline"
          className="mt-3 w-full"
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