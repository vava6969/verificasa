import React, { useState } from "react";
import { useCountry } from "@/components/CountryContext";
import HeroSearch from "@/components/HeroSearch";
import HeroPhoto from "@/components/HeroPhoto";
import Hero3DScan from "@/components/Hero3DScan";
import HeroCountdown from "@/components/HeroCountdown";
import InspectieModal from "@/components/InspectieModal";
import ListeazaPopup from "@/components/ListeazaPopup";
import MapSearchCTA from "@/components/MapSearchCTA";
import ActionCards from "@/components/ActionCards";
import BetaBanner from "@/components/BetaBanner";
import AboutVerifiCasa from "@/components/AboutVerifiCasa";
import RecommendedByPlanSection from "@/components/RecommendedByPlanSection";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Stamp, Kicker } from "@/components/fisa";

// Homepage as the registry's front sheet. The hero is asymmetric: the claim
// and the search on the left, the evidence on the right — a real photograph
// carrying the inspection layer, and the live 3D scan underneath it.
export default function Landing() {
  const { t, lang } = useCountry();
  const en = lang === "en";
  const [showInspectie, setShowInspectie] = useState(false);
  const [showListeaza, setShowListeaza] = useState(false);

  const valueProps = [
    ["vp1_t", "vp1_d"], ["vp2_t", "vp2_d"], ["vp3_t", "vp3_d"],
    ["vp4_t", "vp4_d"], ["vp5_t", "vp5_d"], ["vp6_t", "vp6_d"],
    ["vp7_t", "vp7_d"], ["vp8_t", "vp8_d"], ["vp9_t", "vp9_d"],
  ];

  return (
    <div>
      <BetaBanner />

      {/* HERO — claim left, evidence right */}
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="max-w-xl">
            <Stamp tone="verde">{en ? "Verified rentals, 100% online" : "Chirii verificate, 100% online"}</Stamp>
            <h1 className="mt-4 font-heading text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl lg:text-[3.4rem]">
              {t("hero_h1_a")}{" "}
              <em className="font-medium italic text-emerald">{t("hero_h1_b")}</em>
            </h1>
            <p className="mt-4 max-w-[48ch] text-base text-muted-foreground sm:text-lg">
              {en
                ? "Every listing is checked before it goes live: photos, paperwork, price. What you see is what you rent."
                : "Fiecare anunț e verificat înainte de publicare: poze, acte, preț. Ce vezi e ce închiriezi."}
            </p>

            <div className="mt-6">
              <HeroSearch />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setShowListeaza(true)}
                className="rounded bg-emerald px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90"
              >
                {t("hdr_add")}
              </button>
              <button
                type="button"
                onClick={() => setShowInspectie(true)}
                className="text-sm font-bold text-emerald transition-colors hover:text-foreground"
              >
                {en ? "Request a verification" : "Solicită o verificare"} <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* the evidence column */}
          <Reveal className="flex flex-col gap-3">
            <HeroPhoto className="aspect-[4/3] w-full" />
            <Hero3DScan className="h-44 w-full sm:h-52" />
          </Reveal>
        </div>

        <HeroCountdown className="mt-8" />
      </section>

      {/* THE THREE WAYS IN */}
      <ActionCards onRequestInspection={() => setShowInspectie(true)} />

      {/* WHY — ruled ledger, two columns, type does the work */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Reveal className="mb-5">
          <Kicker>{en ? "Why VerifiCasa" : "De ce VerifiCasa"}</Kicker>
          <h2 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {en ? "Transparency, step by step" : "Transparență, pas cu pas"}
          </h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 border-t border-border md:grid-cols-2 md:gap-x-12">
          {valueProps.map(([tt, dd]) => (
            <RevealItem key={tt} className="border-b border-border py-4">
              <h3 className="font-body text-[15px] font-bold text-foreground">{t(tt)}</h3>
              <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{t(dd)}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* DESPRE */}
      <AboutVerifiCasa />

      {/* MAP */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <Reveal>
          <MapSearchCTA />
        </Reveal>
      </section>

      {/* ANUNȚURI RECOMANDATE */}
      <div id="featured">
        <Reveal className="mx-auto mb-5 max-w-7xl px-4 sm:mb-8 sm:px-6 lg:px-8">
          <Kicker>{t("featured_kicker")}</Kicker>
          <h2 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">{t("featured_h")}</h2>
        </Reveal>
        <RecommendedByPlanSection />
      </div>

      {/* OWNER CTA — photograph + ruled claims */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
        <Reveal className="relative overflow-hidden border border-border">
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
            <Stamp tone="verde">{t("owner_badge")}</Stamp>
            <h2 className="mt-3 font-heading text-2xl font-semibold leading-tight text-white sm:mt-4 sm:text-3xl">{t("owner_h")}</h2>
            <p className="mt-2 text-sm text-white/80 sm:mt-3 sm:text-base">{t("owner_d")}</p>

            <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
              <button
                type="button"
                onClick={() => setShowInspectie(true)}
                className="rounded bg-emerald px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90"
              >
                {t("owner_btn_inspectie")}
              </button>
              <button
                type="button"
                onClick={() => setShowListeaza(true)}
                className="rounded border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                {t("owner_btn_listeaza")}
              </button>
            </div>

            <p className="mt-4 text-xs text-white/55 sm:mt-5">{t("owner_note")}</p>

            <ul className="mt-5 grid grid-cols-2 gap-x-6 border-t border-white/20 pt-4 sm:mt-8 sm:grid-cols-4">
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
