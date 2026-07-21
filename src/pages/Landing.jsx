import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles, Clock, ShieldCheck, BadgePercent, Play, ArrowRight,
  Camera, FileText, TrendingUp, Users, PawPrint, Car, Home, MapPin, Search as SearchIcon,
} from "lucide-react";

const STATS = [
  { icon: TrendingUp, label: "Mai puține vizionări inutile", value: "-70%" },
  { icon: Clock, label: "Timp decizie chiriaș", value: "-50%" },
  { icon: BadgePercent, label: "Creștere conversie Pet-Friendly (UK)", value: "+35%" },
];

const VALUE_PROPS = [
  { icon: Sparkles, title: "Tururi AI Immersive", desc: "Vizualizează proprietatea realist din telefon — transformăm pozele 2D într-un tur video ghidat cu tranziții fluide generate de AI." },
  { icon: ShieldCheck, title: "Verificare & Încredere", desc: "Proprietari verificați, tururi AI validate teren și chiriași pre-calificați. Scade timpul de decizie cu 50%." },
  { icon: BadgePercent, title: "Comisioane Corecte", desc: "RO: comision redus 30-50% din prima chirie. UK: 0 fee pentru chiriași, conform Tenant Fees Act 2019." },
];

export default function Landing() {
  const { country, legalInfo } = useCountry();
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.Property.list("-created_date", 100);
        if (cancelled) return;
        setProperties(all.filter((p) => p.country === country));
      } catch (e) {
        if (!cancelled) setProperties([]);
      }
    })();
    return () => { cancelled = true; };
  }, [country]);

  const featured = (properties || []).filter((p) => p.featured).slice(0, 6);
  const display = featured.length ? featured : (properties || []).slice(0, 6);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-navy">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-mint blur-3xl" />
          <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-mint/40 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-mint backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AI Virtual Walkthrough · {country === "UK" ? "0 Fees for Tenants" : "Comision Redus pentru Chiriași"}
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Închiriază inteligent.<br />
              <span className="text-mint">Vizionează din telefon.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/70 sm:text-lg">
              Prima platformă PropTech cu tururi AI immersive. Economisește 70% din vizionările inutile și găsește casa potrivită mai repede.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <SearchBar />
          </div>

          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
            {[
              { label: "Garsoniere", to: "/search?type=Garsonieră" },
              { label: "2 Camere", to: "/search?type=2 Camere" },
              { label: country === "UK" ? "Pet Friendly" : "Pet Friendly", to: "/search" },
              { label: "Cu Parcare", to: "/search" },
              { label: country === "UK" ? "0 Fees" : "Fără Comision", to: "/search" },
            ].map((f, i) => (
              <Link
                key={i}
                to={f.to}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-mint"
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 px-4 sm:px-6 lg:px-8">
          {STATS.map((s, i) => (
            <div key={i} className="flex items-center gap-4 py-6 sm:justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-soft">
                <s.icon className="h-6 w-6 text-navy" />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-navy">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="bg-secondary/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-mint">De ce EstateAI</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">O experiență de închiriere reinventată</h2>
            <p className="mt-3 text-muted-foreground">Tehnologie AI, încredere și comisioane corecte — totul într-o singură platformă.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {VALUE_PROPS.map((v, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-mint">
                  <v.icon className="h-6 w-6 text-navy" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-navy">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section id="featured" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-mint">Proprietăți recomandate</span>
              <h2 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">Cu Tur AI inclus</h2>
            </div>
            <Link to="/search" className="hidden items-center gap-1 text-sm font-semibold text-navy hover:text-mint sm:flex">
              Vezi toate <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {properties === null ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : display.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <Home className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3">Nicio proprietate momentan în {country === "UK" ? "UK" : "România"}.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {display.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* AI MODULE HIGHLIGHT */}
      <section className="bg-navy-deep py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-mint">
              <Camera className="h-3.5 w-3.5" /> AI Virtual Walkthrough
            </span>
            <h2 className="mt-5 font-heading text-3xl font-bold leading-tight sm:text-4xl">
              Transformăm 5-10 poze 2D într-un tur video 3D immersive
            </h2>
            <p className="mt-4 text-white/70">
              Proprietarul încarcă fotografii simple, iar AI-ul generează un tur ghidat cu tranziții fluide, cameră cu cameră. Chiriașul vizualizează totul din telefon, înainte de a programa o vizionare reală.
            </p>
            <ul className="mt-6 space-y-3">
              {["Tranziții fluide generate de AI între camere", "Preview tur livrat în câteva minute", "Badge „Tur AI Verificat Teren” după validare", "Redu vizionările inutile cu 70%"].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint/20">
                    <Sparkles className="h-3.5 w-3.5 text-mint" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 gradient-mint text-navy shadow-soft hover:opacity-90">
              <Link to="/owner" className="gap-1.5">
                <Camera className="h-4 w-4" /> Creează un Tur AI
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-mint/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-mint shadow-glow">
                    <Play className="ml-1 h-9 w-9 fill-navy text-navy" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-navy/80 px-3 py-1.5 text-xs font-semibold text-mint backdrop-blur">AI Walkthrough</span>
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy">02:14</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-white p-4 shadow-soft sm:block">
              <p className="text-xs text-muted-foreground">Vizionări AI Tour</p>
              <p className="font-heading text-2xl font-bold text-navy">+1,284</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-mint">Cum funcționează</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">3 pași simpli</h2>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-8 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-soft font-heading font-bold text-navy">A</span>
                <h3 className="font-heading text-xl font-bold text-navy">Pentru Chiriași</h3>
              </div>
              <ol className="mt-6 space-y-5">
                {[
                  { icon: SearchIcon, t: "Caută & filtrează", d: "Folosește filtrele rapide: Garsoniere, 2 Camere, Pet-Friendly, Cu Parcare, Fără Comision." },
                  { icon: Play, t: "Vizionează Turul AI", d: "Explorează proprietatea realist din telefon. Economisești timp — fără vizionări inutile." },
                  { icon: FileText, t: "Pre-calificare & Programare", d: "Completezi un formular scurt (ocupație, venit, data mutării) și programezi vizionarea." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-mint">
                      <s.icon className="h-5 w-5 text-navy" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-navy">{i + 1}. {s.t}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-border bg-white p-8 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-soft font-heading font-bold text-navy">B</span>
                <h3 className="font-heading text-xl font-bold text-navy">Pentru Proprietari</h3>
              </div>
              <ol className="mt-6 space-y-5">
                {[
                  { icon: Camera, t: "Încarcă 5-10 poze 2D", d: "Adaugă fotografii simple ale proprietății din interfața de proprietar." },
                  { icon: Sparkles, t: "Generează Turul AI", d: "AI-ul procesează imaginile și livrează un tur video ghidat cu tranziții fluide." },
                  { icon: TrendingUp, t: "Primește lead-uri calificate", d: "Dashboard cu vizualizări, cereri de vizionare și contracte PDF descărcabile." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-mint">
                      <s.icon className="h-5 w-5 text-navy" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-navy">{i + 1}. {s.t}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">Listează gratuit proprietatea ta</h2>
          <p className="mt-3 text-muted-foreground">Primești un Tur AI premium și contracte conforme legislației {country === "UK" ? "din UK" : "din România"}.</p>
          <Button asChild className="mt-6 gradient-mint text-navy shadow-soft hover:opacity-90">
            <Link to="/owner" className="gap-1.5"><Sparkles className="h-4 w-4" /> Adaugă Anunț Gratuit</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}