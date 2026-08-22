import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

// Single shell for every auth page: login/register, forgot password, reset
// password and OAuth consent. One architecture, so the page does not change
// shape when a user clicks through from sign in to "Ai uitat parola?".
//
// A full-bleed photograph sits behind an ink scrim and a card at 60% opacity.
// The photos are viewings across the country, and each one names where it is in
// mono at the foot of the frame — the background states the claim the product
// makes, instead of just setting a mood, so the card lets it through instead of
// covering it.
//
// The card is sized for a phone, not for a laptop window shrunk down: measured
// at 375x812, the sign-in screen lands around 470px tall and never scrolls.
// Secondary text on the card is foreground/70, not muted-foreground — muted ink
// over a 60% card on a dark photograph drops under the contrast floor.
//
// NOTE: the `icon` prop is still accepted by callers but no longer rendered;
// the wordmark carries the branding instead of a decorative lucide medallion.

const SHOTS = [
  { src: "/images/auth/bucuresti-v2.webp", place: "București", area: "Cotroceni" },
  { src: "/images/auth/cluj-v2.webp", place: "Cluj-Napoca", area: "Mărăști" },
  { src: "/images/auth/brasov-v2.webp", place: "Brașov", area: "Schei" },
  { src: "/images/auth/constanta-v2.webp", place: "Constanța", area: "Faleză Nord" },
  { src: "/images/auth/timisoara-v2.webp", place: "Timișoara", area: "Cetate" },
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

      {/* Comenzile de limbă și temă.
          Paginile de autentificare nu trec prin Layout, deci nu au Header — iar
          fără el nu exista niciun buton de limbă sau de zi/noapte pe primul
          ecran pe care îl vede cineva. Stau sus-dreapta, peste fotografie,
          deasupra cardului. */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-5 sm:top-5">
        <LanguageToggle />
        <ThemeToggle className="rounded-full" />
      </div>

      {/* Card */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-4 sm:py-12">
        <Link to="/" className="mb-3 tap-44 flex min-h-[32px] items-center sm:mb-6">
          <VerifiCasaLogo size={26} tone="light" tagline={false} />
        </Link>

        <div className="w-full max-w-[21rem] rounded border border-white/25 bg-card/60 p-4 shadow-[0_18px_44px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 sm:max-w-[24rem] sm:p-7">
          <h1 className="font-heading text-lg font-extrabold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-[13px] leading-snug text-foreground/80 sm:mt-1.5 sm:text-sm">{subtitle}</p>
          )}

          <div className="mt-3.5 sm:mt-5">{children}</div>
        </div>

        {footer && <div className="mt-3 text-center text-[13px] text-white/85 sm:mt-5 sm:text-sm">{footer}</div>}
      </div>

      {/* The location of the shot currently on screen. */}
      <p className="pointer-events-none absolute bottom-3 left-4 z-10 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60 sm:bottom-5 sm:left-5 sm:text-[11px]">
        {shot.place} <span className="text-white/35">·</span> {shot.area}
      </p>
    </div>
  );
}
