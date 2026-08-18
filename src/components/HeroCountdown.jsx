import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCountry } from "@/components/CountryContext";

const TARGET = new Date("2026-08-28T10:00:00");

function diff() {
  const now = new Date();
  let d = TARGET - now;
  if (d < 0) d = 0;
  return {
    over: TARGET - now <= 0,
    days: Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    mins: Math.floor((d % 3600000) / 60000),
    secs: Math.floor((d % 60000) / 1000),
  };
}

// Cifră unică cu tranziție tip "odometru" — cifra veche alunecă în sus,
// cea nouă intră de jos, fără să schimbe layout-ul.
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

// Launch strip in the hero: a flat ink panel with mono digits, set like a
// line in a registry. After launch it collapses into a dated stamp line.
export default function HeroCountdown() {
  const { t } = useCountry();
  const [time, setTime] = useState(diff());
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const id = setInterval(() => setTime(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const unit = (v, label) => (
    <div className="flex flex-col items-center gap-1">
      <span className="flex h-11 min-w-[2.4rem] items-center justify-center border-b border-white/25 px-1 font-mono text-2xl tabular-nums text-white sm:h-12 sm:min-w-[2.8rem] sm:text-3xl">
        <RollingDigits value={String(v).padStart(2, "0")} reduceMotion={reduceMotion} />
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/50 sm:text-[10px]">{label}</span>
    </div>
  );

  if (time.over) {
    return (
      <div className="mt-6 flex w-full max-w-2xl items-center justify-between gap-4 rounded-lg border border-white/15 bg-navy-deep/90 px-5 py-3.5 sm:mt-8">
        <p className="stamp-line text-emerald">{t("countdown_badge")}</p>
        <p className="font-mono text-xs text-white/70">28.08.2026 · 10:00</p>
      </div>
    );
  }

  return (
    <div className="mt-5 flex w-full max-w-2xl flex-col items-center gap-4 rounded-lg border border-white/15 bg-navy-deep/90 px-5 py-4 sm:mt-8 sm:flex-row sm:justify-between sm:px-7 sm:py-5">
      <div className="text-center sm:text-left">
        <span className="stamp-line inline-flex items-center gap-2 text-emerald">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald" aria-hidden="true" />
          {t("countdown_badge")}
        </span>
        <p className="mt-1 text-sm font-semibold text-white sm:text-base">{t("countdown_h")}</p>
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-2 sm:gap-3">
          {unit(time.days, t("countdown_days"))}
          <span className="pb-4 font-mono text-xl text-white/25">:</span>
          {unit(time.hours, t("countdown_hours"))}
          <span className="pb-4 font-mono text-xl text-white/25">:</span>
          {unit(time.mins, t("countdown_mins"))}
          <span className="pb-4 font-mono text-xl text-white/25">:</span>
          {unit(time.secs, "SEC")}
        </div>
        <Link
          to="/about"
          className="shrink-0 pb-1 font-semibold text-white/80 transition hover:text-white"
          aria-label={t("countdown_btn")}
        >
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
