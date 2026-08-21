import React from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Fișa de Inspecție — the registry primitive layer.
   Every verdict is a stamp (bordered, dated, attributed), never a coloured
   pill. Facts live in ruled ledgers with tabular figures. Mono type exists
   only as instrument marks drawn ON photographs (PhotoMark / Viewfinder).
--------------------------------------------------------------------------- */

/** Bordered verdict stamp. tone: verde | gold | ink | marcaj */
export function Stamp({ tone = "verde", date, by, className, children }) {
  const toneCls = {
    verde: "",
    gold: "vc-stamp--gold",
    ink: "vc-stamp--ink",
    marcaj: "vc-stamp--marcaj",
  }[tone];
  return (
    <span className={cn("vc-stamp", toneCls, className)}>
      <span>{children}</span>
      {date && <span className="font-medium opacity-80">· {date}</span>}
      {by && <span className="font-medium opacity-80">· {by}</span>}
    </span>
  );
}

/** Franking mark for boosted listings: PROMOVAT · exp. date. Disclosed paid placement. */
export function Frank({ until, className }) {
  return (
    <span className={cn("vc-stamp vc-stamp--gold", className)} title="Poziție promovată (plătită)">
      <span>Promovat</span>
      {until && <span className="font-medium opacity-80">· exp. {until}</span>}
    </span>
  );
}

/** Quiet section label. Hanken, never mono, never uppercase-tracked wallpaper. */
export function Kicker({ className, children }) {
  return (
    <p className={cn("text-[13px] font-semibold text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/** Hairline rule. */
export function Hairline({ className }) {
  return <div className={cn("h-px w-full bg-border", className)} aria-hidden="true" />;
}

/** Ruled fact ledger. Children are LedgerRow. */
export function Ledger({ className, children }) {
  return <dl className={cn("divide-y divide-border border-y border-border", className)}>{children}</dl>;
}

export function LedgerRow({ label, value, sub, className }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-2.5", className)}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-semibold tnum">
        {value}
        {sub && <span className="ml-1.5 font-normal text-muted-foreground">{sub}</span>}
      </dd>
    </div>
  );
}

/** Trust score mark: the number set as a stamped figure with its scale. */
export function ScoreMark({ score, size = "md", className }) {
  const s = Math.max(0, Math.min(100, Math.round(score ?? 0)));
  const band = s >= 75 ? "text-emerald border-emerald" : s >= 40 ? "text-foreground border-foreground/60" : "text-muted-foreground border-border";
  const sz = size === "lg" ? "text-2xl px-3 py-1.5" : "text-base px-2 py-1";
  return (
    <span className={cn("inline-flex items-baseline gap-1 rounded-sm border-[1.5px] font-heading font-semibold tnum", band, sz, className)}>
      {s}
      <span className="text-[0.6em] font-body font-semibold text-muted-foreground">/100</span>
    </span>
  );
}

/** Allowance meter row: label, used/limit, thin bar. For Contul meu limits. */
export function Meter({ label, used = 0, limit, unlimited = false, reset, className }) {
  const pct = unlimited || !limit ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const over = !unlimited && limit && used >= limit;
  return (
    <div className={cn("py-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-semibold tnum", over && "text-destructive")}>
          {unlimited ? "nelimitat" : `${used} / ${limit}`}
        </p>
      </div>
      {!unlimited && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-sm bg-secondary">
          <div
            className={cn("h-full rounded-sm", over ? "bg-destructive" : "bg-emerald")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {reset && <p className="mt-1 text-xs text-muted-foreground">{reset}</p>}
    </div>
  );
}

/* ---- instrument marks ON photographs (the only home of mono type) ---- */

/** Mono annotation positioned on an image. Parent must be relative. */
export function PhotoMark({ className, children }) {
  return <span className={cn("vc-photomark absolute", className)}>{children}</span>;
}

/** Viewfinder corner brackets over an image. Parent must be relative. */
export function Viewfinder({ className, inset = "0.625rem", stroke = "rgba(255,255,255,0.85)" }) {
  const c = { position: "absolute", width: "1.1rem", height: "1.1rem", borderColor: stroke };
  const b = "2px solid";
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      <span style={{ ...c, top: inset, left: inset, borderTop: b, borderLeft: b, borderColor: stroke }} className="absolute" />
      <span style={{ ...c, top: inset, right: inset, borderTop: b, borderRight: b, borderColor: stroke }} className="absolute" />
      <span style={{ ...c, bottom: inset, left: inset, borderBottom: b, borderLeft: b, borderColor: stroke }} className="absolute" />
      <span style={{ ...c, bottom: inset, right: inset, borderBottom: b, borderRight: b, borderColor: stroke }} className="absolute" />
    </div>
  );
}
