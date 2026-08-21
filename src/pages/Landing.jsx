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

      {/* ——— PRIMA PAGINĂ A REGISTRULUI ———
          Două compoziții distincte, nu una strivită:
          · Desktop: pagină de gazetă — dateline riglat, titlu mare pe stânga,
            fotografia-fișă sângerează până la marginea ferestrei pe dreapta,
            iar banda de scanare 3D taie pagina pe toată lățimea, ca un
            seismograf. Fără eyebrow-pastilă, fără accent italic în titlu:
            ambele erau amprente de generator.
          · Telefon: unealtă, nu afiș — titlu la scară mică, căutarea imediat
            sub deget, fotografia și scanarea după. */}
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {/* dateline — informație, nu decor */}
        <div className="flex items-baseline justify-between gap-4 border-y border-border py-2">
          <p className="text-xs font-semibold text-foreground sm:text-sm">
            {en ? "The register of verified rentals" : "Registrul chiriilor verificate"}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {"România · " + new Date().toLocaleDateString(en ? "en-GB" : "ro-RO", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="mt-6 grid items-start gap-8 lg:mt-10 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-6">
            <h1 className="font-heading text-[2rem] font-medium leading-[calc(1.12em_+_3px)] tracking-[-0.02em] text-foreground sm:text-[2.6rem] lg:text-[3rem] xl:text-[3.4rem]">
              {t("hero_h1_a")}
              <br />
              {t("hero_h1_b")}
            </h1>
            <p className="mt-5 hidden max-w-[52ch] text-lg leading-relaxed text-muted-foreground lg:block">
              {en
                ? "Every listing is checked before it goes live: photos, paperwork, price. What you see is what you rent."
                : "Fiecare anunț e verificat înainte de publicare: poze, acte, preț. Ce vezi e ce închiriezi."}
            </p>

            <div className="mt-5 lg:mt-7">
              <HeroSearch />
            </div>

            {/* Acțiuni: bloc plin pe telefon, rând pe desktop */}
            <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
              <button
                type="button"
                onClick={() => setShowListeaza(true)}
                className="min-h-[48px] rounded bg-emerald px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90 sm:min-h-[44px]"
              >
                {t("hdr_add")}
              </button>
              <button
                type="button"
                onClick={() => setShowInspectie(true)}
                className="inline-flex min-h-[44px] items-center justify-center text-sm font-bold text-emerald transition-colors hover:text-foreground sm:justify-start"
              >
                {en ? "Request a verification" : "Solicită o verificare"} <span className="ml-1" aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* fotografia-fișă — pe desktop iese din container până la marginea
              ferestrei: fotografia e dovada, are voie să rupă rama */}
          <Reveal className="min-w-0 lg:col-span-6 lg:mr-[calc(-2rem_-_max(0px,(100vw_-_80rem)/2))]">
            <HeroPhoto className="aspect-[4/3] w-full lg:aspect-[16/9]" />
          </Reveal>
        </div>

        {/* banda de parcurgere — turul taie pagina dintr-o parte în alta */}
        <Reveal className="mt-3 overflow-hidden bg-navy-deep lg:mx-[calc(50%-50vw)] lg:mt-8">
          <div className="h-28 w-full sm:h-32 lg:h-36">
            <LoopVideo src="/videos/hero-walkthrough-v1.mp4" objectPosition="center 55%" />
          </div>
        </Reveal>

        <HeroCountdown className="mt-6 lg:mt-8" />
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
