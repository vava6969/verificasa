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
    <div className="flex flex-col items-center">
      <span className="font-heading text-lg font-bold tabular-nums text-white sm:text-2xl">
        <RollingDigits value={String(v).padStart(2, "0")} reduceMotion={reduceMotion} />
      </span>
      <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/50 sm:text-[9px]">{label}</span>
    </div>
  );

  return (
    <div className="mt-5 flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-md sm:mt-8 sm:flex-row sm:justify-between sm:px-6">
      <div className="text-center sm:text-left">
        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
          </span>
          {t("countdown_badge")}
        </span>
        <p className="mt-0.5 text-xs font-medium text-white/80 sm:text-sm">{t("countdown_h")}</p>
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-3 sm:gap-4">
          {unit(time.days, t("countdown_days"))}
          {unit(time.hours, t("countdown_hours"))}
          {unit(time.mins, t("countdown_mins"))}
          {unit(time.secs, "SEC")}
        </div>
        <Link
          to="/about"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/10"
          aria-label={t("countdown_btn")}
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}