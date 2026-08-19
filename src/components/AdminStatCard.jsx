import React from "react";

/**
 * Monochrome depth card: dark slate body, concentric radial glow behind the
 * icon corner, hairline inner highlight on the top edge. Accent tone only
 * bleeds through the glow + the number, so it never looks like a template card.
 */
const TONES = {
  amber:   { glow: "251 191 36", value: "text-gold" },
  emerald: { glow: "0 200 120",  value: "text-emerald" },
  rose:    { glow: "244 63 94",  value: "text-destructive" },
  slate:   { glow: "148 163 184", value: "text-white" },
};

export default function AdminStatCard({ label, value, icon: Icon, tone = "slate" }) {
  const t = TONES[tone] || TONES.slate;
  return (
    <div
      className="group relative isolate overflow-hidden rounded-lg bg-navy-deep px-4 pb-3.5 pt-4"
      style={{
        boxShadow:
          "inset 0 1px 0 rgb(255 255 255 / 0.10), inset 0 0 0 1px rgb(255 255 255 / 0.05), 0 18px 34px -22px rgb(0 0 0 / 0.95)",
      }}
    >
      <div className="relative flex items-start justify-between">
        <p className="font-heading text-[2rem] font-bold leading-none tracking-tight tabular-nums text-white">
          <span className={t.value}>{value}</span>
        </p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-navy-deep">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <p className="kicker relative mt-3 text-white/45">
        {label}
      </p>
      <div
        className="relative mt-2 h-px w-full"
        style={{ background: `linear-gradient(to right, rgb(${t.glow} / 0.55), transparent)` }}
      />
    </div>
  );
}