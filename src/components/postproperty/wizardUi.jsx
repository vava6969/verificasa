import React from "react";

export const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-3 text-base text-foreground outline-none transition focus:border-emerald focus:ring-2 focus:ring-emerald/15 dark:bg-card";

export function Field({ label, hint, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}{required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

export function Chip({ active, onClick, emoji, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition " +
        (active
          ? "border-emerald bg-emerald text-white shadow-soft"
          : "border-border bg-white text-foreground/70 hover:border-emerald/50 dark:bg-card")
      }
    >
      <span>{emoji}</span> {label}
    </button>
  );
}

export function ChoiceCard({ active, onClick, emoji, title, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition " +
        (active
          ? "border-emerald bg-emerald-soft shadow-soft ring-1 ring-emerald/30"
          : "border-border bg-white hover:border-emerald/40 dark:bg-card")
      }
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span className="font-heading text-[13px] font-bold leading-tight tracking-tight text-navy dark:text-foreground whitespace-nowrap sm:text-sm">{title}</span>
      {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
    </button>
  );
}