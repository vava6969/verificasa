import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import HeroPhoto from "@/components/HeroPhoto";
import LaunchCountdown from "@/components/LaunchCountdown";
import InspectieModal from "@/components/InspectieModal";
import ListeazaPopup from "@/components/ListeazaPopup";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles, ShieldCheck, BadgePercent, Play, ArrowRight,
  Video, FileText, Lock, TrainFront, Volume2, Wifi, CheckCircle2, Search as SearchIcon, Home,
} from "lucide-react";

const VALUE_PROPS = [
  {
    icon: Video,
    title: "Tur Interactiv AI 360°",
    desc: "Explorează proprietatea ca și cum ai fi acolo. Te plimbi virtual prin fiecare colț al apartamentului direct din telefon sau laptop, economisind timp prețios.",
  },
  {
    icon: ShieldCheck,
    title: "Verificare Fizică pe Teren",
    desc: "Agentul VerifiCasa inspectează personal proprietatea. Primești un raport clar despre stare, zgomot, presiunea apei și acte, pentru transparență 100%.",
  },
  {
    icon: Lock,
    title: "Comisioane Corecte & Siguranță",
    desc: "Fără taxe ascunse sau garanții exagerate. Oferim condiții transparente și un pachet avantajos atât pentru vânzare, cât și pentru închiriere.",
  },
];

const COMFORT_CHIPS = [
  { icon: TrainFront, label: "Drum la metrou (min)" },
  { icon: Volume2, label: "Scor liniște (dB)" },
  { icon: Wifi, label: "Viteză internet (Mbps)" },
];

export default function Landing() {
  const { country } = useCountry();
  const [properties, setProperties] = useState(null);
  const [showInspectie, setShowInspectie] = useState(false);
  const [showListeaza, setShowListeaza] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.Property.list("-created_date", 100);
        if (cancelled) return;
        setProperties(all.filter((p) => p.country === "RO"));
      } catch (e) {
        if (!cancelled) setProperties([]);
      }
    })();
    return () => { cancelled = true; };
  }, [country]);

  const display = (properties || []).slice(0, 6);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[660px] overflow-hidden">
        <HeroPhoto />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pb-40 pt-24 text-center sm:px-6 sm:pb-48 sm:pt-28 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" /> 🇷🇴 Platformă Verificată de Închirieri
          </span>

          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Chirii verificate pe teren și online.
            <br />
            <span className="text-gold">Fără surprize neplăcute.</span>
          </h1>

          <p className="mt-5 max-w-2xl rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-base text-white/85 backdrop-blur-md sm:text-lg">
            VerifiCasa transformă închirierile: tururi AI immersive, inspecții fizice verificate de agenți
            și garanții care protejează chiriașul și proprietarul.
          </p>

          <div className="mt-8 w-full max-w-4xl">
            <SearchBar />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/70">
            {COMFORT_CHIPS.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md">
                <c.icon className="h-3.5 w-3.5 text-emerald" /> {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* COUNTDOWN BANNER */}
      <LaunchCountdown />

      {/* VALUE PROPOSITION BAR */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {VALUE_PROPS.map((v, i) => (
            <div key={i} className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-soft text-emerald">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-navy">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section id="featured" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald">Proprietăți recomandate</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy sm:text-3xl">Verificate și gata de închiriat</h2>
          </div>
          <Link to="/search" className="hidden items-center gap-1 text-sm font-semibold text-emerald hover:underline sm:flex">
            Vezi toate <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {properties === null ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : display.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <Home className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 font-heading text-lg font-semibold text-navy">Nicio proprietate momentan</p>
            <p className="text-sm text-muted-foreground">Adaugă prima proprietate verificată.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {display.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>

      {/* SOLICITĂ O INSPECȚIE CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl gradient-navy p-8 text-white shadow-soft sm:p-12">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald/20 blur-2xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-3 py-1 text-xs font-semibold text-gold">
              <ShieldCheck className="h-3.5 w-3.5" /> Pentru Proprietari
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold leading-tight">Ești proprietar? Închiriază sau vinde fără bătăi de cap!</h2>
            <p className="mt-3 text-white/75">
              Noi ne ocupăm de verificarea pe teren, turul virtual 360° și selectarea clienților potriviți, astfel încât tu să nu pierzi timp cu vizionări inutile.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setShowInspectie(true)} className="gap-1.5 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
                <ShieldCheck className="h-4 w-4" /> Solicită Inspecție
              </Button>
              <Button onClick={() => setShowListeaza(true)} variant="outline" className="gap-1.5 rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10">
                <FileText className="h-4 w-4" /> Listează proprietate
              </Button>
            </div>

            <p className="mt-5 text-xs text-white/55">
              Detaliile legate de pachete, comisioane și contracte se discută direct cu agenții noștri VerifiCasa pe WhatsApp sau Email.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: ShieldCheck, t: "Verificat pe Teren" },
                { icon: Volume2, t: "Măsurători reale" },
                { icon: FileText, t: "Raport PDF" },
                { icon: CheckCircle2, t: "Acte verificate" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/80">
                  <b.icon className="h-4 w-4 text-emerald" /> {b.t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <InspectieModal open={showInspectie} onClose={() => setShowInspectie(false)} />
      <ListeazaPopup open={showListeaza} onClose={() => setShowListeaza(false)} />
    </div>
  );
}