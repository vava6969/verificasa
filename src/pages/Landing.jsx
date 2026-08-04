import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import HeroSearch from "@/components/HeroSearch";
import PropertyCard from "@/components/PropertyCard";
import HeroPhoto from "@/components/HeroPhoto";
import HeroCountdown from "@/components/HeroCountdown";
import InspectieModal from "@/components/InspectieModal";
import ListeazaPopup from "@/components/ListeazaPopup";
import BetaBanner from "@/components/BetaBanner";
import AboutVerifiCasa from "@/components/AboutVerifiCasa";
import CircularCarousel from "@/components/ui/circular-carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck, ArrowRight, Video, FileText, Lock, Home, Plus,
  UserCheck, Flag, Clock, BadgePercent, MessageSquare,
} from "lucide-react";

export default function Landing() {
  const { country, t } = useCountry();
  const [properties, setProperties] = useState(null);
  const [showInspectie, setShowInspectie] = useState(false);
  const [showListeaza, setShowListeaza] = useState(false);

  const carouselItems = [
    { id: "1", icon: Video, title: t("vp1_t"), description: t("vp1_d") },
    { id: "2", icon: ShieldCheck, title: t("vp2_t"), description: t("vp2_d") },
    { id: "3", icon: Lock, title: t("vp3_t"), description: t("vp3_d") },
    { id: "4", icon: FileText, title: t("vp4_t"), description: t("vp4_d") },
    { id: "5", icon: UserCheck, title: t("vp5_t"), description: t("vp5_d") },
    { id: "6", icon: Flag, title: t("vp6_t"), description: t("vp6_d") },
    { id: "7", icon: Clock, title: t("vp7_t"), description: t("vp7_d") },
    { id: "8", icon: BadgePercent, title: t("vp8_t"), description: t("vp8_d") },
    { id: "9", icon: MessageSquare, title: t("vp9_t"), description: t("vp9_d") },
  ];
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.Property.list("-views_count", 100);
        if (cancelled) return;
        setProperties(all.filter((p) => p.country === "RO"));
      } catch (e) {
        if (!cancelled) setProperties([]);
      }
    })();
    return () => { cancelled = true; };
  }, [country]);

    const display = (properties || []).filter((p) => p.approval_status === "APPROVED").slice(0, 3);

  return (
    <div className="landing-dark">
      <BetaBanner />
      {/* HERO */}
      <section className="relative -mt-14 min-h-[520px] overflow-hidden sm:min-h-[660px]">
        <HeroPhoto />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pb-24 pt-24 text-center sm:px-6 sm:pb-48 sm:pt-36 lg:px-8">
          <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-white/90">
            VerifiCasa
          </p>
          <p className="mt-1 text-xs font-medium text-white/70">
            Inspecții & Verificări Imobiliare
          </p>

          <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-white sm:mt-4 sm:text-5xl lg:text-6xl">
            {t("hero_h1_a")}
            <br />
            <span className="text-gold-gradient">{t("hero_h1_b")}</span>
          </h1>

          <div className="mt-5 w-full max-w-4xl md:rounded-[26px] md:glass-panel md:p-3 sm:mt-8">
            <HeroSearch />
          </div>

          <Button asChild className="mt-4 gap-1.5 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90 sm:mt-6">
            <Link to="/post-property"><Plus className="h-4 w-4" /> {t("hdr_add")}</Link>
          </Button>

          <HeroCountdown />
        </div>
      </section>

      {/* VALUE PROPOSITION CAROUSEL */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-3 text-center sm:mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald">De ce VerifiCasa?</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-navy sm:text-2xl">Transparență și încredere, pas cu pas</h2>
        </div>
        <CircularCarousel items={carouselItems} />
      </section>

      {/* DESPRE VERIFICASA */}
      <AboutVerifiCasa />

      {/* FEATURED PROPERTIES */}
      <section id="featured" className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-16 lg:px-8">
        <div className="mb-5 flex items-end justify-between sm:mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald">{t("featured_kicker")}</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy sm:text-3xl">{t("featured_h")}</h2>
          </div>
          <Link to="/search" className="flex items-center gap-1 text-sm font-semibold text-emerald hover:underline">
            {t("view_all")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {properties === null ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : display.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <Home className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 font-heading text-lg font-semibold text-navy">{t("featured_none_t")}</p>
            <p className="text-sm text-muted-foreground">{t("featured_none_d")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {display.map((p) => <PropertyCard key={p.id} property={p} hot />)}
          </div>
        )}

        {display.length > 0 && (
          <div className="mt-5 flex justify-center sm:mt-8">
            <Button asChild className="gap-2 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
              <Link to="/search">{t("view_all")} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        )}
      </section>

      {/* SOLICITĂ O INSPECȚIE CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-emerald-soft to-gold-soft p-6 shadow-soft sm:p-12 dark:border-white/10 dark:gradient-navy">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald/25 blur-2xl animate-blob" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-gold/25 blur-2xl animate-blob" style={{ animationDelay: "2.5s" }} />
          <div className="absolute right-1/3 -bottom-8 h-32 w-32 rounded-full bg-emerald/20 blur-2xl animate-blob" style={{ animationDelay: "4s" }} />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/70 px-3 py-1 text-xs font-semibold text-gold-deep backdrop-blur-md dark:bg-white/10 dark:text-gold">
              <ShieldCheck className="h-3.5 w-3.5" /> {t("owner_badge")}
            </span>
            <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-navy sm:mt-4 sm:text-3xl dark:text-white">{t("owner_h")}</h2>
            <p className="mt-2 text-sm text-foreground/70 sm:mt-3 sm:text-base dark:text-white/75">{t("owner_d")}</p>
            <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
              <Button onClick={() => setShowInspectie(true)} className="gap-1.5 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
                <ShieldCheck className="h-4 w-4" /> {t("owner_btn_inspectie")}
              </Button>
              <Button onClick={() => setShowListeaza(true)} variant="outline" className="gap-1.5 rounded-full border-border/60 bg-white/70 text-navy backdrop-blur-md hover:bg-white dark:border-white/30 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                <FileText className="h-4 w-4" /> {t("owner_btn_listeaza")}
              </Button>
            </div>

            <p className="mt-4 text-xs text-foreground/55 sm:mt-5 dark:text-white/55">{t("owner_note")}</p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-4 sm:gap-3">
              {[
                { emoji: "🛡️", label: t("b_verified") },
                { emoji: "📐", label: t("b_measure") },
                { emoji: "📄", label: t("b_report") },
                { emoji: "✅", label: t("b_docs") },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-border/50 bg-white/60 px-3 py-2.5 text-xs font-semibold text-foreground/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                  <span className="text-base leading-none">{b.emoji}</span> {b.label}
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