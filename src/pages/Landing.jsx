import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import HeroSearch from "@/components/HeroSearch";
import HeroPhoto from "@/components/HeroPhoto";
import HeroCountdown from "@/components/HeroCountdown";
import InspectieModal from "@/components/InspectieModal";
import ListeazaPopup from "@/components/ListeazaPopup";
import MapSearchCTA from "@/components/MapSearchCTA";
import ActionCards from "@/components/ActionCards";
import BetaBanner from "@/components/BetaBanner";
import AboutVerifiCasa from "@/components/AboutVerifiCasa";
import RecommendedByPlanSection from "@/components/RecommendedByPlanSection";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function iconImg(src) {
  return function IconImg({ className = "" }) {
    return <img src={src} alt="" className={`object-contain ${className}`} />;
  };
}

export default function Landing() {
  const { t, lang } = useCountry();
  const [showInspectie, setShowInspectie] = useState(false);
  const [showListeaza, setShowListeaza] = useState(false);

  const valueProps = [
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
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/85">
            VerifiCasa
          </p>
          <p className="mt-1 text-xs font-medium text-white/70">
            {lang === "en" ? "Verified rentals, 100% online" : "Chirii verificate, 100% online"}
          </p>

          <h1 className="mt-3 font-heading text-3xl leading-tight text-white sm:mt-4 sm:text-5xl lg:text-6xl">
            {t("hero_h1_a")}
            <br />
            <span className="text-gold-gradient">{t("hero_h1_b")}</span>
          </h1>

          <div className="mt-5 w-full max-w-4xl md:rounded-lg md:glass-panel md:p-3 sm:mt-8">
            <HeroSearch />
          </div>

          <p className="stamp-line mt-3 text-white/70">
            {lang === "en" ? "Every listing verified before it's published" : "Fiecare anunț, verificat înainte de publicare"}
          </p>

          <Button asChild className="mt-4 gap-1.5 sm:mt-6">
            <Link to="/post-property"><Plus className="h-4 w-4" /> {t("hdr_add")}</Link>
          </Button>

          <HeroCountdown />
        </div>
      </section>

      {/* CĂI PRINCIPALE — navigare vizuală */}
      <ActionCards onRequestInspection={() => setShowInspectie(true)} />

      {/* DE CE VERIFICASA — index numerotat, toate cele 9 puncte vizibile */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Reveal className="mb-5 border-t border-border pt-6 sm:mb-7 sm:pt-8">
          <p className="kicker text-emerald">De ce VerifiCasa?</p>
          <h2 className="mt-1.5 font-heading text-xl text-navy dark:text-foreground sm:text-2xl">Transparență și încredere, pas cu pas</h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-x-8 gap-y-0 divide-y divide-border border-y border-border sm:grid-cols-2 sm:gap-y-0 lg:grid-cols-3">
          {valueProps.map((vp) => {
            const Icon = vp.icon;
            return (
              <RevealItem key={vp.id} className="flex items-start gap-4 py-4 sm:py-5">
                <p className="kicker w-6 shrink-0 pt-0.5">{vp.id.padStart(2, "0")}</p>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-heading text-[15px] text-navy dark:text-foreground sm:text-base">{vp.title}</h3>
                    <Icon className="h-7 w-7 shrink-0" />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">{vp.description}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      {/* DESPRE VERIFICASA */}
      <AboutVerifiCasa />

      {/* MAP SEARCH CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <Reveal>
          <MapSearchCTA />
        </Reveal>
      </section>

      {/* ANUNȚURI RECOMANDATE — rânduri delimitate de planul postatorului */}
      <div id="featured">
        <Reveal className="mx-auto mb-5 max-w-7xl px-4 sm:px-6 sm:mb-8 lg:px-8">
          <p className="kicker text-emerald">{t("featured_kicker")}</p>
          <h2 className="mt-1.5 font-heading text-2xl text-navy dark:text-foreground sm:text-3xl">{t("featured_h")}</h2>
        </Reveal>
        <RecommendedByPlanSection />
      </div>

      {/* SOLICITĂ O INSPECȚIE CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-lg border border-white/10 p-6 shadow-soft sm:p-12">
          <img
            src="/images/generated/owner-cta-bg-mobile-v1.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[65%_center] sm:hidden"
          />
          <img
            src="/images/generated/owner-cta-bg-v1.png"
            alt=""
            className="absolute inset-0 hidden h-full w-full object-cover sm:block"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-deep/30" />
          <div className="relative max-w-2xl">
            <p className="stamp-line text-gold">{t("owner_badge")}</p>
            <h2 className="mt-3 font-heading text-2xl leading-tight text-white sm:mt-4 sm:text-3xl">{t("owner_h")}</h2>
            <p className="mt-2 text-sm text-white/80 sm:mt-3 sm:text-base">{t("owner_d")}</p>
            <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
              <Button onClick={() => setShowInspectie(true)}>
                {t("owner_btn_inspectie")}
              </Button>
              <Button onClick={() => setShowListeaza(true)} variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                {t("owner_btn_listeaza")}
              </Button>
            </div>

            <p className="mt-4 text-xs text-white/55 sm:mt-5">{t("owner_note")}</p>

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-white/15 pt-4 sm:mt-8 sm:grid-cols-4">
              {[t("b_verified"), t("b_measure"), t("b_report"), t("b_docs")].map((label, i) => (
                <p key={i} className="stamp-line text-white/75">
                  {label}
                </p>
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
