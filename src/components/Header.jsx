import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Sparkles, ChevronDown } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { country, setCountry, currency, legalInfo } = useCountry();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-navy">
            <Building2 className="h-5 w-5 text-mint" />
          </div>
          <div className="leading-none">
            <span className="font-heading text-lg font-bold tracking-tight text-navy">EstateAI</span>
            <span className="ml-1 align-top text-[10px] font-semibold text-mint">.tour</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link to="/" className="text-sm font-medium text-foreground/70 transition hover:text-navy">Închiriază</Link>
          <a href="#how-it-works" className="text-sm font-medium text-foreground/70 transition hover:text-navy">Cum funcționează</a>
          <a href="#featured" className="text-sm font-medium text-foreground/70 transition hover:text-navy">Proprietăți</a>
          <Link to="/owner" className="text-sm font-medium text-foreground/70 transition hover:text-navy">Pentru Proprietari</Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-border bg-mint-soft px-3 py-1.5 sm:flex">
            <span className="text-[11px] font-semibold text-navy/70">{country}</span>
            <span className="text-[11px] font-bold text-navy">{currency}</span>
            <span className="mx-1 h-3 w-px bg-border" />
            <span className="text-[11px] font-medium text-navy/60">{legalInfo.legal1}</span>
          </div>

          <div className="flex items-center rounded-full border border-border bg-white p-0.5">
            {["RO", "UK"].map((c) => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  country === c ? "bg-navy text-white" : "text-foreground/60 hover:text-navy"
                }`}
              >
                {c === "RO" ? "🇷🇴 RO" : "🇬🇧 UK"}
              </button>
            ))}
          </div>

          <Button
            asChild
            className="hidden gradient-mint text-navy shadow-soft hover:opacity-90 sm:flex"
          >
            <Link to="/owner" className="gap-1.5">
              <Sparkles className="h-4 w-4" /> Adaugă Anunț
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}