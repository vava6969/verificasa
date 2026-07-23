import React from "react";
import { Link } from "react-router-dom";
import { User, Plus, Home, LogOut, Heart } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";

// Platform serves only Iași and Huși.
const CITY_LINKS = [
  { label: "Chirii Iași", city: "Iași" },
  { label: "Chirii Huși", city: "Huși" },
];

export default function Header() {
  const { currency, setCurrency } = useCountry();
  const { user, isAuthenticated, logout } = useAuth();
  const greeting = user?.full_name || user?.email || "utilizator";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <VerifiCasaLogo size={44} tagline={false} />
          <span className="hidden rounded-full border border-gold/40 bg-gold-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-deep lg:inline">
            Iași · Huși · Verificat
          </span>
        </Link>

        {/* Center: city quick links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-semibold text-foreground/80 transition hover:text-emerald">Acasă</Link>
          {CITY_LINKS.map((c) => (
            <Link
              key={c.city}
              to={`/search?city=${encodeURIComponent(c.city)}`}
              className="text-sm font-medium text-foreground/70 transition hover:text-emerald"
            >
              {c.label}
            </Link>
          ))}
        </nav>

        {/* Right: dynamic auth nav */}
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center rounded-full border border-border bg-white p-0.5 shadow-soft sm:flex">
            {["EUR", "RON"].map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  currency === cur ? "bg-navy text-white" : "text-foreground/60 hover:text-navy"
                }`}
              >
                <span className="mr-1">{cur === "EUR" ? "🇬🇧" : "🇷🇴"}</span>{cur}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <>
              <Link to="/owner" className="hidden items-center gap-1.5 text-sm font-semibold text-foreground/80 transition hover:text-emerald sm:flex">
                <Plus className="h-4 w-4" /> Adaugă Anunț
              </Link>
              <Link to="/my-properties" className="hidden items-center gap-1.5 text-sm font-semibold text-foreground/80 transition hover:text-emerald sm:flex">
                <Home className="h-4 w-4" /> Proprietățile Mele
              </Link>
              <Button
                onClick={() => logout()}
                variant="outline"
                className="gap-1.5 rounded-full border-border"
                title={`Deconectare (${greeting})`}
              >
                <LogOut className="h-4 w-4" /> <span className="hidden max-w-[120px] truncate lg:inline">Salut, {greeting}</span>
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground/80 transition hover:text-emerald"
              >
                <User className="h-4 w-4" /> Autentificare
              </Link>
              <Button asChild className="rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
                <Link to="/register"><Heart className="h-4 w-4" /> <span className="hidden sm:inline">Înregistrare</span></Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile city row */}
      <div className="flex items-center gap-5 overflow-x-auto border-t border-border/50 px-4 py-2 md:hidden">
        <Link to="/" className="whitespace-nowrap text-xs font-bold text-emerald">Acasă</Link>
        {CITY_LINKS.map((c) => (
          <Link
            key={c.city}
            to={`/search?city=${encodeURIComponent(c.city)}`}
            className="whitespace-nowrap text-xs font-semibold text-foreground/70 transition hover:text-emerald"
          >
            {c.label}
          </Link>
        ))}
        {isAuthenticated && (
          <Link to="/my-properties" className="whitespace-nowrap text-xs font-semibold text-foreground/70">Proprietățile Mele</Link>
        )}
      </div>
    </header>
  );
}