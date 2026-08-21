import React, { useState } from "react";
import { useCountry } from "@/components/CountryContext";
import HeroSearch from "@/components/HeroSearch";
import HeroPhoto from "@/components/HeroPhoto";
import LoopVideo from "@/components/LoopVideo";
import HeroCountdown from "@/components/HeroCountdown";
import InspectieModal from "@/components/InspectieModal";
import ListeazaPopup from "@/components/ListeazaPopup";
import MapSearchCTA from "@/components/MapSearchCTA";
import ActionCards from "@/components/ActionCards";
import ValueProps from "@/components/ValueProps";
import BetaBanner from "@/components/BetaBanner";
import AboutVerifiCasa from "@/components/AboutVerifiCasa";
import RecommendedByPlanSection from "@/components/RecommendedByPlanSection";
import { Reveal } from "@/components/ui/reveal";

// Prima pagină, în forma cerută de client: fotografia ocupă ecranul, titlul e
// scurt, căutarea stă imediat sub deget. Fără dateline, fără paragraf de
// introducere, fără ștampile — nimeni nu citește prima pagină, o parcurge.
export default function Landing() {
  const { t, lang } = useCountry();
  const en = lang === "en";
  const [showInspectie, setShowInspectie] = useState(false);
  const [showListeaza, setShowListeaza] = useState(false);

  return (
    <div>
      <BetaBanner />

      {/* HERO — fotografie pe toată lățimea, text peste ea */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[440px] w-full overflow-hidden sm:h-[70vh] sm:min-h-[520px] lg:h-[76vh]">
          {/* Poziționarea vine din wrapper, nu din className-ul pasat: clasa
              `relative` proprie a HeroPhoto câștiga în cascadă peste `absolute`
              și împingea tot textul hero sub fotografie, tăiat de
              overflow-hidden. Telefonul vedea doar poza. */}
          <div className="absolute inset-0">
            <HeroPhoto rounded={false} className="h-full w-full" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/80" />

          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8 lg:pb-16">
            <Reveal>
              <h1 className="max-w-[15ch] text-[2.4rem] font-bold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl">
                {t("hero_h1_a")}
              </h1>
              <p className="mt-2 max-w-[22ch] text-lg font-semibold text-white/85 sm:text-2xl">
                {t("hero_h1_b")}
              </p>
            </Reveal>

            <Reveal delay={0.12} className="mt-6 w-full sm:mt-8 lg:max-w-4xl">
              <HeroSearch />
            </Reveal>

            <Reveal delay={0.2} className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowListeaza(true)}
                className="min-h-[48px] rounded-full bg-emerald px-6 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.03]"
              >
                {t("hdr_add")}
              </button>
              <button
                type="button"
                onClick={() => setShowInspectie(true)}
                className="inline-flex min-h-[48px] items-center rounded-full border border-white/50 px-6 text-sm font-bold text-white transition-colors hover:bg-white/15"
              >
                {en ? "Request a check" : "Cere o verificare"}
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* THE THREE WAYS IN */}
      <ActionCards onRequestInspection={() => setShowInspectie(true)} />

      {/* ANUNȚURI RECOMANDATE — sus, e ce vine lumea să vadă */}
      <div id="featured" className="pt-2">
        <Reveal className="mx-auto mb-4 max-w-7xl px-4 sm:mb-6 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{t("featured_h")}</h2>
        </Reveal>
        <RecommendedByPlanSection />
      </div>

      {/* BANDA VIDEO — turul taie pagina dintr-o parte în alta */}
      <Reveal className="overflow-hidden bg-navy-deep">
        <div className="h-36 w-full sm:h-44 lg:h-56">
          <LoopVideo
            src="/videos/hero-walkthrough-v2.mp4"
            poster="/images/hero/villa-living-1.webp"
            objectPosition="center 55%"
            crossfade={0.4}
          />
        </div>
      </Reveal>

      {/* DE CE — iconițe, nu paragrafe */}
      <ValueProps />

      {/* HARTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <Reveal>
          <MapSearchCTA />
        </Reveal>
      </section>

      <HeroCountdown className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8" />

      {/* DESPRE */}
      <AboutVerifiCasa />

      {/* OWNER CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-2xl">
          <img
            src="/images/generated/owner-cta-bg-mobile-v1.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[65%_center] sm:hidden"
            loading="lazy"
          />
          <img
            src="/images/generated/owner-cta-bg-v1.png"
            alt=""
            className="absolute inset-0 hidden h-full w-full object-cover sm:block"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-deep/30" />

          <div className="relative max-w-2xl p-6 sm:p-12">
            <h2 className="text-2xl font-bold leading-tight text-white sm:text-4xl">{t("owner_h")}</h2>

            <div className="mt-5 flex flex-wrap gap-3 sm:mt-7">
              <button
                type="button"
                onClick={() => setShowInspectie(true)}
                className="min-h-[48px] rounded-full bg-emerald px-6 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                {t("owner_btn_inspectie")}
              </button>
              <button
                type="button"
                onClick={() => setShowListeaza(true)}
                className="min-h-[48px] rounded-full border border-white/50 px-6 text-sm font-bold text-white transition-colors hover:bg-white/15"
              >
                {t("owner_btn_listeaza")}
              </button>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-x-6 border-t border-white/20 pt-4 sm:mt-8 sm:grid-cols-4">
              {[t("b_verified"), t("b_measure"), t("b_report"), t("b_docs")].map((b) => (
                <li key={b} className="py-1.5 text-xs font-semibold text-white/85">
                  <span className="mr-1.5 text-emerald" aria-hidden="true">✓</span>{b}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <InspectieModal open={showInspectie} onClose={() => setShowInspectie(false)} />
      <ListeazaPopup open={showListeaza} onClose={() => setShowListeaza(false)} />
    </div>
  );
}
