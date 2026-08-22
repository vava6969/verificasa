import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";

// Single shell for every auth page: login/register, forgot password, reset
// password and OAuth consent. One architecture, so the page does not change
// shape when a user clicks through from sign in to "Ai uitat parola?".
//
// A full-bleed photograph sits behind an ink scrim and a solid card. The photos
// are viewings across the country, and each one names where it is in mono at the
// foot of the frame — the background states the claim the product makes, instead
// of just setting a mood.
//
// NOTE: the `icon` prop is still accepted by callers but no longer rendered;
// the wordmark carries the branding instead of a decorative lucide medallion.

const SHOTS = [
  { src: "/images/auth/bucuresti.webp", place: "București", area: "Cotroceni" },
  { src: "/images/auth/cluj.webp", place: "Cluj-Napoca", area: "Mărăști" },
  { src: "/images/auth/brasov.webp", place: "Brașov", area: "Schei" },
  { src: "/images/auth/constanta.webp", place: "Constanța", area: "Faleză Nord" },
  { src: "/images/auth/timisoara.webp", place: "Timișoara", area: "Cetate" },
];

const HOLD_MS = 8000;

// Every shot is inside the viewport, so loading="lazy" would not defer anything.
// Only the first one is mounted until the page has finished loading; the other
// four are added afterwards and so stay off the critical path.
function useBackground() {
  const [index, setIndex] = useState(0);
  const [mountRest, setMountRest] = useState(false);

  useEffect(() => {
    const start = () => setMountRest(true);
    if (document.readyState === "complete") {
      const id = setTimeout(start, 200);
      return () => clearTimeout(id);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  useEffect(() => {
    if (!mountRest) return; // nothing to cross-fade to yet
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // hold frame one
    const id = setInterval(() => setIndex((i) => (i + 1) % SHOTS.length), HOLD_MS);
    return () => clearInterval(id);
  }, [mountRest]);

  return { index, mountRest };
}

export default function AuthLayout({ title, subtitle, footer, children }) {
  const { index, mountRest } = useBackground();
  const shot = SHOTS[index];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Photographs. The first paints immediately, the rest arrive after it. */}
      <div className="absolute inset-0" aria-hidden="true">
        {SHOTS.map((s, i) =>
          i === 0 || mountRest ? (
            <img
              key={s.src}
              src={s.src}
              alt=""
              decoding="async"
              // React 18 passes lowercase unknown attributes straight through;
              // the camelCase `fetchPriority` the lint rule wants is React 19+
              // and warns at runtime here. Keep the DOM spelling.
              // eslint-disable-next-line react/no-unknown-property
              fetchpriority={i === 0 ? "high" : "low"}
              className={`auth-shot absolute inset-0 h-full w-full object-cover ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--navy-deep) / 0.58) 0%, hsl(var(--navy-deep) / 0.74) 100%)",
          }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <Link to="/" className="mb-7 flex min-h-[44px] items-center">
          <VerifiCasaLogo size={38} tone="light" tagline={false} />
        </Link>

        <div className="w-full max-w-[26rem] rounded border border-border bg-card p-6 shadow-soft sm:p-8">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}

          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-white/80">{footer}</div>}
      </div>

      {/* The location of the shot currently on screen. */}
      <p className="pointer-events-none absolute bottom-5 left-5 z-10 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
        {shot.place} <span className="text-white/35">·</span> {shot.area}
      </p>
    </div>
  );
}
