import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";
import { useCountry } from "@/components/CountryContext";

const TARGET = new Date("2026-08-28T10:00:00");

function diff() {
  const now = new Date();
  let d = TARGET - now;
  if (d < 0) d = 0;
  const days = Math.floor(d / 86400000);
  const hours = Math.floor((d % 86400000) / 3600000);
  const mins = Math.floor((d % 3600000) / 60000);
  const secs = Math.floor((d % 60000) / 1000);
  return { days, hours, mins, secs };
}

export default function LaunchCountdown() {
  const { t } = useCountry();
  const [time, setTime] = useState(diff());
  useEffect(() => {
    const id = setInterval(() => setTime(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const unit = (v, label) => (
    <div className="flex flex-col items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-deep/80 font-heading text-xl font-extrabold text-white shadow-soft sm:h-20 sm:w-20 sm:rounded-2xl sm:text-3xl dark:bg-white/10">
        {String(v).padStart(2, "0")}
      </div>
      <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/60 sm:mt-2 sm:text-[11px]">{label}</span>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-emerald/30 bg-emerald-soft/50 p-5 shadow-soft sm:p-10 dark:bg-emerald-soft/10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald/20 blur-2xl" />
        <div className="relative flex flex-col items-center gap-4 text-center sm:gap-6 lg:flex-row lg:justify-between lg:text-left">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald px-3 py-1 text-xs font-bold text-white shadow-soft">
              <Rocket className="h-3.5 w-3.5" /> {t("countdown_badge")}
            </span>
            <h2 className="mt-2 font-heading text-xl font-extrabold text-navy dark:text-foreground sm:mt-3 sm:text-3xl">{t("countdown_h")}</h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{t("countdown_d")}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {unit(time.days, t("countdown_days"))}
            <span className="font-heading text-xl font-bold text-emerald sm:text-3xl">:</span>
            {unit(time.hours, t("countdown_hours"))}
            <span className="font-heading text-xl font-bold text-emerald sm:text-3xl">:</span>
            {unit(time.mins, t("countdown_mins"))}
          </div>

          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-emerald/90 hover:shadow-glow active:scale-[1.02] sm:px-6 sm:py-3 sm:text-base"
          >
            <Rocket className="h-4 w-4" /> {t("countdown_btn")}
          </Link>
        </div>
      </div>
    </section>
  );
}