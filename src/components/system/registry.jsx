import React from "react";
import { cn } from "@/lib/utils";

// Registry primitives — the shared vocabulary of the VerifiCasa "institution
// of proof" design language. Mono serials, ruled data, stamped verdicts.
// These replace the old decorated pills, glow badges and uppercase kickers.

// Section label set in mono small-caps, documentary register.
export function Kicker({ children, className, tone = "muted" }) {
  const tones = {
    muted: "text-muted-foreground",
    verified: "text-emerald",
    gold: "text-gold-deep",
    light: "text-white/70",
  };
  return <p className={cn("kicker", tones[tone] || tones.muted, className)}>{children}</p>;
}

// Dot-separated mono microtype row: VERIFICAT · 16.08.2026 · 506071HZRQQF
export function StampLine({ parts = [], className, tone = "neutral" }) {
  const tones = {
    neutral: "text-muted-foreground",
    verified: "text-emerald",
    premium: "text-gold-deep",
    light: "text-white/75",
  };
  return (
    <p className={cn("stamp-line flex flex-wrap items-center gap-x-2", tones[tone] || tones.neutral, className)}>
      {parts.filter(Boolean).map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden="true" className="opacity-50">·</span>}
          <span>{part}</span>
        </React.Fragment>
      ))}
    </p>
  );
}

// Boxed trust score, graded like a mark on a certificate.
// Thresholds match the product rule: >=75 high trust, >=40 verified, else low.
export function ScoreMark({ score = 0, size = "md", className }) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const grade =
    s >= 75
      ? "border-emerald bg-emerald text-white"
      : s >= 40
        ? "border-gold-deep/60 bg-gold-soft text-gold-deep"
        : "border-border bg-secondary text-muted-foreground";
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-mono font-bold tabular-nums",
        sizes[size] || sizes.md,
        grade,
        className
      )}
      title={`Scor de încredere: ${s}/100`}
    >
      {s}
    </span>
  );
}

// Ruled label/value rows — the "fișa tehnică" of a dossier.
// rows: [{ label, value, sub }]
export function DataLedger({ rows = [], className, dense = false }) {
  return (
    <dl className={cn("divide-y divide-border border-y border-border", className)}>
      {rows
        .filter((r) => r && r.value !== undefined && r.value !== null && r.value !== "")
        .map((row, i) => (
          <div key={i} className={cn("flex items-baseline justify-between gap-4", dense ? "py-1.5" : "py-2.5")}>
            <dt className="kicker shrink-0">{row.label}</dt>
            <dd className="text-right font-mono text-sm text-foreground">
              {row.value}
              {row.sub && <span className="ml-1.5 text-xs text-muted-foreground">{row.sub}</span>}
            </dd>
          </div>
        ))}
    </dl>
  );
}

// Flat plan-tier chip. Replaces the PNG medallions + premium glow.
export function TierMark({ tier = "none", className }) {
  const map = {
    agent: { label: "Agent", cls: "border-gold-deep/50 bg-gold-soft text-gold-deep" },
    pro: { label: "Pro", cls: "border-emerald/40 bg-emerald-soft text-emerald" },
    basic: { label: "Basic", cls: "border-border bg-card text-foreground/80" },
    none: { label: "Fără plan", cls: "border-border bg-secondary text-muted-foreground" },
  };
  const t = map[tier] || map.none;
  return (
    <span className={cn("stamp-line inline-flex items-center rounded-sm border px-2 py-0.5", t.cls, className)}>
      {t.label}
    </span>
  );
}
