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
import MapSearchCTA from "@/components/MapSearchCTA";
import ActionCards from "@/components/ActionCards";
import BetaBanner from "@/components/BetaBanner";
import AboutVerifiCasa from "@/components/AboutVerifiCasa";
import RecommendedByPlanSection from "@/components/RecommendedByPlanSection";
import CircularCarousel from "@/components/ui/circular-carousel";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, FileText, Plus,
} from "lucide-react";

function iconImg(src) {
  return function IconImg({ className = "" }) {
    return <img src={src} alt="" className={`object-contain ${className}`} />;
  };
}

export default function Landing() {
  const { t, lang } = useCountry();
  const [showInspectie, setShowInspectie] = useState(false);
  const [showListeaza, setShowListeaza] = useState(false);

  const carouselItems = [
    { id: "1", icon: iconImg("/images/generated/icon-video.png"), title: t("vp1_t"), description: t("vp1_d") },
    { id: "2", icon: iconImg("/images/generated/icon-shield-check.png"), title: t("vp2_t"), description: t("vp2_d") },
    { id: "3", icon: iconImg("/images/generated/icon-lock.png"), title: t("vp3_t"), description: t("vp3_d") },
    { id: "4", icon: iconImg("/images/generated/icon-document.png"), title: t("vp4_t"), description: t("vp4_d") },
    { id: "5", icon: iconImg("/images/generated/icon-user-check.png"), title: t("vp5_t"), description: t("vp5_d") },
    { id: "6", icon: iconImg("/images/generated/icon-flag.png"), title: t("vp6_t"), description: t("vp6_d") },
    { id: "7", icon: iconImg("/images/generated/icon-clock.png"), title: t("vp7_t"), description: t("vp7_d") },
    { id: "8", icon: iconImg("/images/generated/icon-percent-badge.png"), title: t("vp8_t"), description: t("vp8_d") },
    { id: "9", icon: iconImg("/images/generated/icon-chat.png"), title: t("vp9_t"), description: t("vp9_d") },
  ];
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
            {lang === "en" ? "Verified rentals, 100% online" : "Chirii verificate, 100% online"}
          </p>

          <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-white sm:mt-4 sm:text-5xl lg:text-6xl">
            {t("hero_h1_a")}
            <br />
            <span className="text-gold-gradient">{t("hero_h1_b")}</span>
          </h1>

          <div className="mt-5 w-full max-w-4xl md:rounded-[26px] md:glass-panel md:p-3 sm:mt-8">
            <HeroSearch />
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-white/70">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            {lang === "en" ? "Every listing verified before it's published" : "Fiecare anunț, verificat înainte de publicare"}
          </p>

          <Button asChild className="mt-4 gap-1.5 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90 sm:mt-6">
            <Link to="/post-property"><Plus className="h-4 w-4" /> {t("hdr_add")}</Link>
          </Button>

          <HeroCountdown />
        </div>
      </section>

      {/* CĂI PRINCIPALE — navigare vizuală, stil Zillow (Buy/Rent/Sell) */}
      <ActionCards onRequestInspection={() => setShowInspectie(true)} />

      {/* VALUE PROPOSITION CAROUSEL */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <Reveal className="mb-3 text-center sm:mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald">De ce VerifiCasa?</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-navy sm:text-2xl">Transparență și încredere, pas cu pas</h2>
        </Reveal>
        <CircularCarousel items={carouselItems} />
      </section>

      {/* DESPRE VERIFICASA */}
      <AboutVerifiCasa />

      {/* MAP SEARCH CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <Reveal>
          <MapSearchCTA />
        </Reveal>
      </section>

      {/* ANUNȚURI RECOMANDATE — 4 rânduri distincte, delimitate de planul postatorului */}
      <div id="featured">
        <Reveal className="mx-auto mb-5 max-w-7xl px-4 sm:px-6 sm:mb-8 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald">{t("featured_kicker")}</p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-navy sm:text-3xl">{t("featured_h")}</h2>
        </Reveal>
        <RecommendedByPlanSection />
      </div>

      {/* SOLICITĂ O INSPECȚIE CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
        <Reveal className="group relative overflow-hidden rounded-3xl border border-white/10 p-6 shadow-[0_30px_80px_-30px_rgba(16,24,40,0.5)] sm:p-12">
          <img
            src="/images/generated/owner-cta-bg-mobile-v1.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[65%_center] transition-transform duration-700 ease-out group-hover:scale-105 sm:hidden"
          />
          <img
            src="/images/generated/owner-cta-bg-v1.png"
            alt=""
            className="absolute inset-0 hidden h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:block"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/92 via-navy-deep/75 to-navy-deep/25" />
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald/20 blur-2xl animate-blob" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-gold/15 blur-2xl animate-blob" style={{ animationDelay: "2.5s" }} />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-3 py-1 text-xs font-semibold text-gold backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" /> {t("owner_badge")}
            </span>
            <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-white sm:mt-4 sm:text-3xl">{t("owner_h")}</h2>
            <p className="mt-2 text-sm text-white/80 sm:mt-3 sm:text-base">{t("owner_d")}</p>
            <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
              <Button onClick={() => setShowInspectie(true)} className="gap-1.5 rounded-full bg-emerald text-white shadow-soft transition-transform duration-200 hover:scale-[1.03] hover:bg-emerald/90 active:scale-95">
                <ShieldCheck className="h-4 w-4" /> {t("owner_btn_inspectie")}
              </Button>
              <Button onClick={() => setShowListeaza(true)} variant="outline" className="gap-1.5 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-md transition-transform duration-200 hover:scale-[1.03] hover:bg-white/20 active:scale-95">
                <FileText className="h-4 w-4" /> {t("owner_btn_listeaza")}
              </Button>
            </div>

            <p className="mt-4 text-xs text-white/55 sm:mt-5">{t("owner_note")}</p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-4 sm:gap-3">
              {[
                { icon: iconImg("/images/generated/icon-shield-check.png"), label: t("b_verified") },
                { icon: iconImg("/images/generated/icon-gauge.png"), label: t("b_measure") },
                { icon: iconImg("/images/generated/icon-document.png"), label: t("b_report") },
                { icon: iconImg("/images/generated/icon-document-check.png"), label: t("b_docs") },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-semibold text-white/85 backdrop-blur-md transition-colors duration-200 hover:bg-white/15">
                  <b.icon className="h-6 w-6 shrink-0 drop-shadow-[0_2px_5px_rgba(16,24,40,0.4)]" />
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <InspectieModal open={showInspectie} onClose={() => setShowInspectie(false)} />
      <ListeazaPopup open={showListeaza} onClose={() => setShowListeaza(false)} />
    </div>
  );
}