import React from "react";
import { Link } from "react-router-dom";
import { User, Plus } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";

const CITY_LINKS = [
  { label: "Chirii București", city: "București" },
  { label: "Chirii Cluj-Napoca", city: "Cluj-Napoca" },
  { label: "Chirii Timișoara", city: "Timișoara" },
  { label: "Chirii Iași", city: "Iași" },
  { label: "Chirii Brașov", city: "Brașov" },
];

export default function Header() {
  const { currency, setCurrency } = useCountry();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: logo + tagline badge */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <VerifiCasaLogo size={44} tagline={false} />
          <span className="hidden rounded-full border border-gold/40 bg-gold-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-deep lg:inline">
            Platformă Verificată de Închirieri
          </span>
        </Link>

        {/* Center: top RO rental markets */}
        <nav className="hidden items-center gap-5 xl:flex">
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

        {/* Right: currency switch, profile, CTA */}
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

          <Link
            to="/login"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foreground/70 transition hover:text-emerald"
            title="Contul meu"
          >
            <User className="h-4 w-4" />
          </Link>

          <Button asChild className="gap-1.5 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
            <Link to="/owner">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Adaugă Anunț</span>
              <span className="hidden lg:inline"> / Solicită Inspecție</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile city row */}
      <div className="flex items-center gap-4 overflow-x-auto border-t border-border/50 px-4 py-2 xl:hidden">
        {CITY_LINKS.map((c) => (
          <Link
            key={c.city}
            to={`/search?city=${encodeURIComponent(c.city)}`}
            className="whitespace-nowrap text-xs font-semibold text-foreground/70 transition hover:text-emerald"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </header>
  );
}