import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";

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
  const [t, setT] = useState(diff());
  useEffect(() => {
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const unit = (v, label) => (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-deep/80 font-heading text-2xl font-extrabold text-white shadow-soft sm:h-20 sm:w-20 sm:text-3xl dark:bg-white/10">
        {String(v).padStart(2, "0")}
      </div>
      <span className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-foreground/60">{label}</span>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-emerald/30 bg-emerald-soft/50 p-6 shadow-soft sm:p-10 dark:bg-emerald-soft/10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald/20 blur-2xl" />
        <div className="relative flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald px-3 py-1 text-xs font-bold text-white shadow-soft">
              <Rocket className="h-3.5 w-3.5" /> Lansare Beta
            </span>
            <h2 className="mt-3 font-heading text-2xl font-extrabold text-navy dark:text-foreground sm:text-3xl">Pornim oficial pe 28 August 2026, ora 10:00</h2>
            <p className="mt-1 text-sm text-muted-foreground">Adevărate închirieri verificate, fără surprize.</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {unit(t.days, "Zile")}
            <span className="font-heading text-2xl font-bold text-emerald sm:text-3xl">:</span>
            {unit(t.hours, "Ore")}
            <span className="font-heading text-2xl font-bold text-emerald sm:text-3xl">:</span>
            {unit(t.mins, "Minute")}
          </div>

          <Link
            to="/about"
            className="group relative inline-flex items-center gap-2 rounded-full gradient-emerald px-6 py-3 font-bold text-white shadow-glow transition animate-bounce hover:scale-105"
          >
            <span className="absolute inset-0 rounded-full bg-emerald blur-md opacity-60 group-hover:opacity-90 transition" />
            <span className="relative">Află mai multe</span>
          </Link>
        </div>
      </div>
    </section>
  );
}