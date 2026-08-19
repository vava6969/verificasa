import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCountry } from "@/components/CountryContext";

const TARGET = new Date("2026-08-28T10:00:00");

function diff() {
  const now = new Date();
  let d = TARGET - now;
  if (d < 0) d = 0;
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    mins: Math.floor((d % 3600000) / 60000),
    secs: Math.floor((d % 60000) / 1000),
  };
}

// Cifră unică cu tranziție tip "odometru" (inspirat din NumberFlow) — cifra
// veche alunecă în sus și dispare, cea nouă intră de jos, fără să schimbe
// dimensiunea sau layout-ul existent al countdown-ului.
function RollingDigit({ char, reduceMotion }) {
  if (reduceMotion) {
    return <span className="tabular-nums">{char}</span>;
  }
  return (
    <span className="relative inline-grid w-[0.62em] overflow-hidden text-center align-top">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="tabular-nums"
          style={{ gridArea: "1 / 1" }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function RollingDigits({ value, reduceMotion }) {
  return (
    <span className="inline-flex">
      {String(value).split("").map((char, i) => (
        <RollingDigit key={i} char={char} reduceMotion={reduceMotion} />
      ))}
    </span>
  );
}

// Slim launch strip that lives inside the hero section.
export default function HeroCountdown() {
  const { t } = useCountry();
  const [time, setTime] = useState(diff());
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const id = setInterval(() => setTime(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const unit = (v, label) => (
    <div className="flex flex-col items-center gap-1.5">
      <span className="flex h-11 min-w-[2.4rem] items-center justify-center rounded-xl border border-white/15 bg-gradient-to-b from-white/[0.14] to-white/[0.04] px-1.5 font-heading text-2xl font-extrabold tabular-nums text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] sm:h-14 sm:min-w-[3.1rem] sm:text-4xl">
        <RollingDigits value={String(v).padStart(2, "0")} reduceMotion={reduceMotion} />
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:text-[10px]">{label}</span>
    </div>
  );

  return (
    <div className="mt-5 flex w-full max-w-2xl flex-col items-center gap-4 rounded-3xl border border-white/15 bg-black/30 px-5 py-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md sm:mt-8 sm:flex-row sm:justify-between sm:px-7 sm:py-5">
      <div className="text-center sm:text-left">
        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
          </span>
          {t("countdown_badge")}
        </span>
        <p className="mt-1 text-sm font-semibold text-white sm:text-base">{t("countdown_h")}</p>
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-2 sm:gap-3">
          {unit(time.days, t("countdown_days"))}
          <span className="pb-4 font-heading text-xl font-bold text-white/25 sm:text-2xl">:</span>
          {unit(time.hours, t("countdown_hours"))}
          <span className="pb-4 font-heading text-xl font-bold text-white/25 sm:text-2xl">:</span>
          {unit(time.mins, t("countdown_mins"))}
          <span className="pb-4 font-heading text-xl font-bold text-white/25 sm:text-2xl">:</span>
          {unit(time.secs, "SEC")}
        </div>
        <Link
          to="/about"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 text-white transition hover:border-emerald hover:bg-emerald/20 sm:h-10 sm:w-10"
          aria-label={t("countdown_btn")}
        >
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
      </div>
    </div>
  );
}