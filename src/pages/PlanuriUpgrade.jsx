import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { base44 } from "@/api/base44Client";
import { Reveal as HouseReveal } from "@/components/ui/reveal";
import { PLANS, BOOST_PACKS, BOOST_DURATION_DAYS, boostUnitPrice } from "@/lib/plans";

// ---------------------------------------------------------------------------
// Pagina de planuri, în forma cerută de client: cardurile albastre cu insignă
// în colț, comutatorul Lunar/Anual cu pastilă animată și prețul care se
// rostogolește. Iconițele de beneficii sunt PNG-urile lucioase din
// public/images/generated — aceeași limbă vizuală ca insignele, fără line art.
//
// Boost-urile stau sub planuri, în același stil, iar primul pachet e „1 boost"
// pentru că un proprietar trebuie să poată cumpăra exact unul.
// ---------------------------------------------------------------------------

// Această pagină încă folosea `whileInView` — tiparul retras în 672f244 tocmai
// pentru că ascundea secțiuni întregi. Problema nu e de stil:
// starea de repaus era `opacity: 0`, iar singurul lucru care aducea conținutul
// înapoi era un cadru de animație. Când bucla de cadre e sugrumată — filă în
// fundal, iframe-ul editorului Base44, telefon încetinit — tween-ul nu pornește
// niciodată, iar planurile, comutatorul de facturare și TOATE pachetele de
// boost rămân desenate la opacitate zero, ocupându-și înălțimea. Pagina arată
// goală, nu stricată, deci nimeni nu raportează o eroare: pur și simplu nu
// găsești de unde să cumperi.
//
// Shim-ul de mai jos păstrează semnătura veche (`as`, `index`), ca să nu fie
// nevoie să rescriu cele zece locuri care o folosesc, dar dedesubt e Reveal-ul
// casei: starea de repaus e cea VIZIBILĂ, iar ascunderea se aplică doar după ce
// avem dovada că un IntersectionObserver e viu și raportează.
//
// Mai rămâne un caz de rezolvat: EmailDirectory (pe /contact) are același tipar
// pe cardurile de email și pe avertismentul de securitate. Nu l-am mutat odată
// cu ăsta pentru că acolo clasele care contează pentru grilă (`sm:col-span-2`)
// stau chiar pe elementul animat, deci mutarea cere și rearanjarea grilei.
function Reveal({ as = "div", index = 0, className, children }) {
  const delay = index * 0.08;
  if (as === "div") {
    return (
      <HouseReveal delay={delay} className={className}>
        {children}
      </HouseReveal>
    );
  }
  const Tag = as;
  return (
    <HouseReveal delay={delay}>
      <Tag className={className}>{children}</Tag>
    </HouseReveal>
  );
}

function PricingSwitch({ annual, onSwitch, en }) {
  const opts = [
    { value: false, label: en ? "Monthly" : "Lunar" },
    { value: true, label: en ? "Yearly" : "Anual", note: en ? "Save 20%" : "Economisești 20%" },
  ];
  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full border border-gray-200 bg-neutral-50 p-1 dark:border-white/10 dark:bg-white/5">
        {opts.map((opt) => {
          const active = annual === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onSwitch(opt.value)}
              aria-pressed={active}
              className={`relative z-10 h-11 flex-shrink-0 rounded-full px-4 py-1 font-medium transition-colors sm:h-12 sm:px-6 sm:py-2 ${
                active ? "text-white" : "text-muted-foreground hover:text-black dark:hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="planSwitchPill"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute left-0 top-0 h-11 w-full rounded-full border-4 border-emerald bg-gradient-to-t from-emerald via-emerald/85 to-emerald shadow-sm shadow-emerald/60 sm:h-12"
                />
              )}
              <span className="relative flex items-center gap-2 whitespace-nowrap">
                {opt.label}
                {opt.note && (
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-emerald">
                    {opt.note}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Iconițele lucioase existente, mapate pe beneficiile fiecărui plan.
const FEATURE_ICONS = {
  basic: ["/images/generated/icon-document.png", "/images/generated/icon-video.png", "/images/generated/icon-shield-check.png"],
  pro: ["/images/generated/icon-users-check.png", "/images/generated/icon-camera-verify.png", "/images/generated/icon-gauge.png"],
  agent: ["/images/generated/icon-agenti.png", "/images/generated/icon-lock.png", "/images/generated/icon-handshake.png"],
};

const INCLUDES_LABEL = {
  basic: { ro: "Include gratuit:", en: "Included free:" },
  pro: { ro: "Tot ce e în Basic, plus:", en: "Everything in Basic, plus:" },
  agent: { ro: "Tot ce e în Pro, plus:", en: "Everything in Pro, plus:" },
};

function Tick() {
  return (
    <span
      aria-hidden="true"
      className="mr-3 grid h-6 w-6 shrink-0 place-content-center rounded-full bg-gradient-to-t from-emerald to-emerald/80 text-[13px] font-bold leading-none text-white shadow-sm shadow-emerald/50"
    >
      ✓
    </span>
  );
}

function PlanCard({ plan, annual, onSelect, checkingOut, en }) {
  const popular = plan.id === "pro";
  const price = annual ? plan.yearly : plan.monthly;
  const decimals = price % 1 !== 0;
  const icons = FEATURE_ICONS[plan.id] || [];
  const bens = en && plan.benefits_en ? plan.benefits_en : plan.benefits;
  const headline = bens.slice(0, 3);
  const includes = bens.slice(3);
  const label = INCLUDES_LABEL[plan.id] || INCLUDES_LABEL.basic;

  return (
    <Card
      className={`relative flex h-full flex-col overflow-visible border-neutral-200 dark:border-white/10 ${
        popular ? "bg-emerald/5 ring-2 ring-emerald dark:bg-emerald/10" : "bg-white dark:bg-neutral-900"
      }`}
    >
      {plan.badgeImg && (
        <img
          src={plan.badgeImg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 z-20 h-12 w-12 object-contain drop-shadow-lg sm:-right-4 sm:-top-9 sm:h-[5.5rem] sm:w-[5.5rem]"
        />
      )}

      <CardHeader className="text-left">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {plan.iconImg && (
              <img
                src={plan.iconImg}
                alt=""
                aria-hidden="true"
                className="h-12 w-12 shrink-0 object-contain drop-shadow sm:h-14 sm:w-14"
              />
            )}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-[1.75rem]">{plan.name}</h3>
          </div>
          {popular && (
            <span className="shrink-0 rounded-full bg-emerald px-3 py-1 text-sm font-semibold text-white">
              Popular
            </span>
          )}
        </div>
        <p className="mb-4 min-h-[2.5rem] text-sm text-gray-600 dark:text-neutral-400">{en && plan.description_en ? plan.description_en : plan.description}</p>
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            <NumberFlow
              value={price}
              locales="ro-RO"
              format={decimals ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 }}
              className="text-4xl font-bold"
            />
            <span className="ml-1 align-top text-xl">RON</span>
          </span>
          <span className="ml-1 text-gray-600 dark:text-neutral-400">/{annual ? (en ? "year" : "an") : (en ? "month" : "lună")}</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pt-0">
        <button
          type="button"
          onClick={() => onSelect(plan)}
          disabled={checkingOut === plan.id}
          className={`mb-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl p-4 text-lg font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
            popular
              ? "border border-emerald/70 bg-gradient-to-t from-emerald to-emerald/85 text-white shadow-lg shadow-emerald/50"
              : "border border-neutral-700 bg-gradient-to-t from-neutral-900 to-neutral-600 text-white shadow-lg shadow-neutral-900/40"
          }`}
        >
          {checkingOut === plan.id ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> {en ? "Opening checkout" : "Se deschide plata"}</>
          ) : (
            en ? "Choose plan" : "Alege planul"
          )}
        </button>

        <ul className="space-y-3 py-4">
          {headline.map((text, i) => (
            <li key={text} className="flex items-center">
              {icons[i] ? (
                <img src={icons[i]} alt="" aria-hidden="true" className="mr-3 h-7 w-7 shrink-0 object-contain drop-shadow-sm" />
              ) : (
                <Tick />
              )}
              <span className="text-sm font-semibold text-gray-700 dark:text-neutral-300">{text}</span>
            </li>
          ))}
        </ul>

        {includes.length > 0 && (
          <div className="mt-auto space-y-3 border-t border-neutral-200 pt-4 dark:border-white/10">
            <h4 className="mb-3 text-base font-medium text-gray-900 dark:text-white">{en ? label.en : label.ro}</h4>
            <ul className="space-y-2">
              {includes.map((item) => (
                <li key={item} className="flex items-center">
                  <Tick />
                  <span className="text-sm text-gray-600 dark:text-neutral-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BoostCard({ pack, cheapestUnit, onBuy, pending, en }) {
  const unit = boostUnitPrice(pack);
  const best = Math.abs(unit - cheapestUnit) < 0.001;
  const decimals = pack.priceRon % 1 !== 0;

  return (
    <Card
      className={`relative flex h-full flex-col overflow-visible border-neutral-200 dark:border-white/10 ${
        pack.popular ? "bg-emerald/5 ring-2 ring-emerald dark:bg-emerald/10" : "bg-white dark:bg-neutral-900"
      }`}
    >
      {best && (
        <span className="absolute -top-3 left-4 z-20 rounded-full bg-gradient-to-t from-emerald to-emerald/80 px-3 py-1 text-xs font-semibold text-white shadow shadow-emerald/50">
          {en ? "Best rate" : "Cel mai bun preț"}
        </span>
      )}
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <img
            src="/images/generated/icon-coins.png"
            alt=""
            aria-hidden="true"
            className="h-10 w-10 shrink-0 object-contain drop-shadow"
          />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {pack.boosts} <span className="text-base font-semibold">{pack.boosts === 1 ? "boost" : "boost-uri"}</span>
          </p>
        </div>

        <p className="mt-4 flex items-baseline text-3xl font-bold text-gray-900 dark:text-white">
          <NumberFlow
            value={pack.priceRon}
            locales="ro-RO"
            format={decimals ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 }}
          />
          <span className="ml-1 align-top text-base">RON</span>
        </p>
        <p className="mt-1 text-xs text-gray-600 dark:text-neutral-400">
          {unit.toFixed(2).replace(".", ",")} RON {en ? "per boost" : "pe boost"}
        </p>

        <button
          type="button"
          onClick={() => onBuy(pack)}
          disabled={pending === pack.id}
          className={`mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
            pack.popular || pack.single
              ? "border border-emerald/70 bg-gradient-to-t from-emerald to-emerald/85 text-white shadow-lg shadow-emerald/50"
              : "border border-neutral-700 bg-gradient-to-t from-neutral-900 to-neutral-600 text-white shadow-lg shadow-neutral-900/40"
          }`}
        >
          {pending === pack.id ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {en ? "Opening" : "Se deschide"}</>
          ) : (
            en ? "Buy" : "Cumpără"
          )}
        </button>
      </CardContent>
    </Card>
  );
}

export default function PlanuriUpgrade() {
  const [annual, setAnnual] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null);
  const [boostPending, setBoostPending] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { lang } = useCountry();
  const navigate = useNavigate();
  const en = lang === "en";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const boost = params.get("boost");
    const sessionId = params.get("session_id");
    if (checkout === "success") {
      toast({
        title: en ? "Payment successful" : "Plată reușită",
        description: en ? "Your plan is active. Thank you!" : "Abonamentul tău a fost activat. Îți mulțumim!",
      });
      if (sessionId) base44.functions.invoke("VerifyCheckoutSession", { session_id: sessionId }).catch(() => {});
    } else if (checkout === "cancelled" || boost === "cancelled") {
      toast({
        title: en ? "Payment cancelled" : "Plată anulată",
        description: en ? "You were not charged." : "Nicio sumă nu a fost taxată.",
      });
    }
    if (checkout || boost) {
      params.delete("checkout"); params.delete("boost"); params.delete("session_id");
      const qs = params.toString();
      window.history.replaceState({}, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectPlan = async (plan) => {
    if (!user) { navigate("/login"); return; }
    setCheckingOut(plan.id);
    try {
      const res = await base44.functions.invoke("CreateCheckoutSession", {
        plan_id: plan.id, interval: annual ? "yearly" : "monthly",
      });
      const url = res?.data?.url || res?.url;
      if (url) { window.location.href = url; return; }
      toast({
        title: en ? "Could not start the payment" : "Nu am putut porni plata",
        description: res?.data?.error || res?.error || (en ? "Try again in a few minutes." : "Încearcă din nou în câteva minute."),
        variant: "destructive",
      });
    } catch (e) {
      toast({
        title: en ? "Could not start the payment" : "Nu am putut porni plata",
        description: en ? "Try again in a few minutes." : "Încearcă din nou în câteva minute.",
        variant: "destructive",
      });
    } finally {
      setCheckingOut(null);
    }
  };

  const buyBoosts = async (pack) => {
    if (!user) { navigate("/login"); return; }
    setBoostPending(pack.id);
    try {
      const res = await base44.functions.invoke("CreateBoostCheckout", { pack_id: pack.id });
      const url = res?.data?.url || res?.url;
      if (url) { window.location.href = url; return; }
      toast({
        title: en ? "Could not start the payment" : "Nu am putut porni plata",
        description: res?.data?.error || res?.error || (en ? "Try again in a few minutes." : "Încearcă din nou în câteva minute."),
        variant: "destructive",
      });
    } catch (e) {
      toast({
        title: en ? "Could not start the payment" : "Nu am putut porni plata",
        description: en ? "Try again in a few minutes." : "Încearcă din nou în câteva minute.",
        variant: "destructive",
      });
    } finally {
      setBoostPending(null);
    }
  };

  const cheapestUnit = Math.min(...BOOST_PACKS.map(boostUnitPrice));

  return (
    <div className="relative mx-auto min-h-screen overflow-hidden bg-neutral-100 px-4 pb-24 pt-14 dark:bg-neutral-950 sm:pt-20">
      {/* Glow radial albastru — semnătura paginii, în forma cerută de client */}
      <div
        className="pointer-events-none absolute left-[10%] right-[10%] top-0 z-0 h-full w-[80%] dark:hidden"
        style={{
          backgroundImage: "radial-gradient(circle at center, #1F7048 0%, transparent 70%)",
          opacity: 0.35,
          mixBlendMode: "multiply",
        }}
      />
      <div
        className="pointer-events-none absolute left-[10%] right-[10%] top-0 z-0 hidden h-full w-[80%] dark:block"
        style={{
          backgroundImage: "radial-gradient(circle at center, #37A06B 0%, transparent 70%)",
          opacity: 0.18,
        }}
      />

      <div className="relative z-10">
        <div className="mx-auto mb-6 max-w-3xl text-center">
          <Reveal as="h1" index={0} className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-6xl">
            {en ? "Plans that fit " : "Planuri potrivite "}
            <span className="inline-block rounded-xl border border-dashed border-emerald bg-emerald/10 px-2 py-1 dark:bg-emerald/15">
              {en ? "you" : "pentru tine"}
            </span>
          </Reveal>
          <Reveal as="p" index={1} className="mx-auto w-[90%] text-sm text-gray-600 dark:text-neutral-400 sm:w-[70%] sm:text-base">
            {en
              ? "Pick how visible you want your listings to be. Verification stays free on every plan."
              : "Alege nivelul de vizibilitate potrivit pentru anunțurile tale. Verificarea de bază rămâne mereu gratuită, indiferent de plan."}
          </Reveal>
        </div>

        <Reveal as="div" index={2}>
          <PricingSwitch annual={annual} onSwitch={setAnnual} en={en} />
        </Reveal>

        <div className="mx-auto mt-2 grid max-w-7xl grid-cols-1 gap-5 py-8 sm:mt-6 md:grid-cols-3 md:gap-4">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} as="div" index={3 + i} className="h-full">
              <PlanCard
                plan={plan}
                annual={annual}
                onSelect={selectPlan}
                checkingOut={checkingOut}
                en={en}
              />
            </Reveal>
          ))}
        </div>

        {/* BOOST-URI — sub planuri, în aceeași limbă vizuală */}
        <div className="mx-auto max-w-7xl pt-6">
          <div className="mx-auto mb-6 max-w-3xl text-center">
            <Reveal as="h2" index={0} className="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl">
              {en ? "Boost a listing" : "Promovează un anunț"}
            </Reveal>
            <Reveal as="p" index={1} className="mx-auto w-[90%] text-sm text-gray-600 dark:text-neutral-400 sm:w-[75%] sm:text-base">
              {en
                ? `A boost lifts one listing above the rest of its band for ${BOOST_DURATION_DAYS} days. Buy a single one, or a pack if you list often.`
                : `Un boost ridică un anunț peste restul categoriei sale timp de ${BOOST_DURATION_DAYS} zile. Cumperi unul singur, sau un pachet dacă postezi des.`}
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {BOOST_PACKS.map((pack, i) => (
              <Reveal key={pack.id} as="div" index={2 + i} className="h-full">
                <BoostCard
                  pack={pack}
                  cheapestUnit={cheapestUnit}
                  onBuy={buyBoosts}
                  pending={boostPending}
                  en={en}
                />
              </Reveal>
            ))}
          </div>

          <Reveal as="p" index={2} className="mt-6 text-center text-sm text-gray-600 dark:text-neutral-400">
            {en ? "Got a code? Redeem it in " : "Ai un cod? Îl folosești în "}
            <a href="/account" className="font-semibold text-emerald hover:underline">
              {en ? "your account" : "Contul meu"}
            </a>
            {en ? " for bonus boosts." : " și primești boost-uri bonus."}
          </Reveal>

          <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-gray-500 dark:text-neutral-500">
            {en
              ? "Prices include VAT. Subscriptions renew automatically and can be cancelled at any time; boosts are a one-off purchase and do not expire until used."
              : "Prețurile includ TVA. Abonamentele se reînnoiesc automat și pot fi anulate oricând; boost-urile sunt o plată unică și nu expiră până nu sunt folosite."}
          </p>
        </div>
      </div>
    </div>
  );
}
