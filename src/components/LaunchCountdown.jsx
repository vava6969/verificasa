import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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

export default function LaunchCountdown() {
  const { t } = useCountry();
  const [time, setTime] = useState(diff());
  useEffect(() => {
    const id = setInterval(() => setTime(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const unit = (v, label) => (
    <div className="flex min-w-[58px] flex-col items-center rounded-xl border border-border/70 bg-white/60 px-2 py-2.5 dark:border-white/10 dark:bg-white/5 sm:min-w-[76px] sm:py-3">
      <span className="font-heading text-2xl font-bold tabular-nums tracking-tight text-navy dark:text-foreground sm:text-3xl">
        {String(v).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">
        {label}
      </span>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-10 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-white/70 p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.04] sm:rounded-3xl sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
              </span>
              {t("countdown_badge")}
            </span>
            <h2 className="mt-2 font-heading text-lg font-bold leading-snug text-navy dark:text-foreground sm:text-2xl">
              {t("countdown_h")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{t("countdown_d")}</p>
          </div>

          <div className="h-px w-full bg-border lg:hidden" />

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <div className="flex gap-2 sm:gap-3">
              {unit(time.days, t("countdown_days"))}
              {unit(time.hours, t("countdown_hours"))}
              {unit(time.mins, t("countdown_mins"))}
              {unit(time.secs, "SEC")}
            </div>
          </div>

          <Link
            to="/about"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald/40 px-5 py-2.5 text-sm font-semibold text-emerald transition hover:bg-emerald hover:text-white"
          >
            {t("countdown_btn")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}