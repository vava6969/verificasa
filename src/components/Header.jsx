import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Plus, Home, LogOut, Heart, MessageCircle, Settings, ShieldCheck,
  LayoutDashboard, Bookmark, Search, ChevronDown,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Image as UIImage } from "@/components/ui/image";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import ThemeToggle from "@/components/ThemeToggle";

const CITY_LINKS = [
  { label: "Chirii Iași", city: "Iași" },
  { label: "Chirii Huși", city: "Huși" },
];

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];

export default function Header() {
  const { currency, setCurrency } = useCountry();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const greeting = user?.full_name || user?.email || "utilizator";
  const role = (user?.role || "").toUpperCase();
  const canAdmin = ADMIN_ROLES.includes(role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/85 backdrop-blur-xl dark:bg-navy-deep/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <VerifiCasaLogo size={44} tagline={false} />
          <span className="hidden rounded-full border border-gold/40 bg-gold-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-deep lg:inline dark:bg-gold/10 dark:text-gold">
            Iași · Huși · Verificat
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-semibold text-foreground/80 transition hover:text-emerald">Acasă</Link>
          {CITY_LINKS.map((c) => (
            <Link key={c.city} to={`/search?city=${encodeURIComponent(c.city)}`} className="text-sm font-medium text-foreground/70 transition hover:text-emerald">
              {c.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center rounded-full border border-border bg-white p-0.5 shadow-soft sm:flex dark:bg-navy">
            {["EUR", "RON"].map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${currency === cur ? "bg-navy text-white dark:bg-emerald" : "text-foreground/60 hover:text-navy"}`}
              >
                <span className="mr-1">{cur === "EUR" ? "🇬🇧" : "🇷🇴"}</span>{cur}
              </button>
            ))}
          </div>

          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Button asChild className="hidden rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90 sm:flex">
                <Link to="/owner"><Plus className="h-4 w-4" /> Adaugă Anunț</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-navy shadow-soft transition hover:border-emerald/50 dark:bg-navy dark:text-foreground">
                    {user?.avatar_url ? (
                      <UIImage src={user.avatar_url} fittingType="fill" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                        <User className="h-4 w-4" />
                      </span>
                    )}
                    <span className="hidden max-w-[120px] truncate sm:inline">{greeting.split(" ")[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Contul meu</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate("/")}><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")}><MessageCircle className="mr-2 h-4 w-4" /> Mesajele mele</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/saved")}><Bookmark className="mr-2 h-4 w-4" /> Anunțuri salvate</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/searches")}><Search className="mr-2 h-4 w-4" /> Căutări salvate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/owner")}><Plus className="mr-2 h-4 w-4" /> Adaugă anunț</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-properties")}><Home className="mr-2 h-4 w-4" /> Anunțurile mele</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}><Settings className="mr-2 h-4 w-4" /> Setări cont</DropdownMenuItem>
                  {canAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}><ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel</DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}><LogOut className="mr-2 h-4 w-4" /> Deconectare ({greeting.split(" ")[0]})</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login" className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground/80 transition hover:text-emerald dark:bg-navy dark:border-navy">
                <User className="h-4 w-4" /> Autentificare
              </Link>
              <Button asChild className="rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
                <Link to="/register"><Heart className="h-4 w-4" /> <span className="hidden sm:inline">Înregistrare</span></Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5 overflow-x-auto border-t border-border/50 px-4 py-2 md:hidden">
        <Link to="/" className="whitespace-nowrap text-xs font-bold text-emerald">Acasă</Link>
        {CITY_LINKS.map((c) => (
          <Link key={c.city} to={`/search?city=${encodeURIComponent(c.city)}`} className="whitespace-nowrap text-xs font-semibold text-foreground/70">{c.label}</Link>
        ))}
        {isAuthenticated && <Link to="/my-properties" className="whitespace-nowrap text-xs font-semibold text-foreground/70">Proprietățile Mele</Link>}
      </div>
    </header>
  );
}