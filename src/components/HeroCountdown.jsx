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

// Odometer digit — the old digit slides up and out, the new one in from below.
function RollingDigit({ char, reduceMotion }) {
  if (reduceMotion) return <span className="tabular-nums">{char}</span>;
  return (
    <span className="relative inline-grid w-[0.62em] overflow-hidden text-center align-top">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
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

// Launch counter as a ruled ledger strip: solid card, hairline-divided digit
// cells, dated caption. No glass, no glow, no pulsing dot.
export default function HeroCountdown({ className = "" }) {
  const { t } = useCountry();
  const [time, setTime] = useState(diff());
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => setTime(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time.over) return null;

  const unit = (v, label) => (
    <div className="flex flex-1 flex-col items-center gap-1 px-3 py-2 sm:px-5">
      <span className="font-heading text-2xl font-semibold text-foreground tnum sm:text-3xl">
        <RollingDigits value={String(v).padStart(2, "0")} reduceMotion={reduceMotion} />
      </span>
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <div className={`border border-border bg-card ${className}`}>
      <div className="flex flex-col items-stretch sm:flex-row">
        <div className="flex flex-1 flex-col justify-center border-b border-border px-5 py-3 sm:border-b-0 sm:border-r">
          <p className="text-xs font-bold text-emerald">{t("countdown_badge")}</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{t("countdown_h")}</p>
        </div>
        <div className="flex items-stretch divide-x divide-border">
          {unit(time.days, t("countdown_days"))}
          {unit(time.hours, t("countdown_hours"))}
          {unit(time.mins, t("countdown_mins"))}
          {unit(time.secs, "sec")}
        </div>
        <Link
          to="/about"
          className="flex items-center justify-center border-t border-border px-5 py-3 text-sm font-semibold text-emerald transition-colors hover:bg-secondary sm:border-l sm:border-t-0"
        >
          {t("countdown_btn")} <span className="ml-1.5" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
