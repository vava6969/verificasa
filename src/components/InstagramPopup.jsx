import React, { useEffect, useRef, useState } from "react";
import { Instagram, X } from "lucide-react";

// Instagram pop-up: appears every 5 minutes (300s) of site navigation,
// stays on screen 5s then auto-closes. Timer resets on any close (manual X,
// overlay click, or auto). A slim progress bar shows the 5s countdown.
const SHOW_INTERVAL = 5 * 60 * 1000; // 5 minutes between appearances
const HOLD_MS = 5000; // 5 seconds on screen
const HANDLE = "verificasaro";
const URL = "https://www.instagram.com/verificasaro";

export default function InstagramPopup() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(100);
  const showTimer = useRef(null);
  const holdTimer = useRef(null);
  const progressRaf = useRef(null);

  const clearHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (progressRaf.current) cancelAnimationFrame(progressRaf.current);
    progressRaf.current = null;
  };

  const scheduleNext = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    showTimer.current = setTimeout(() => setOpen(true), SHOW_INTERVAL);
  };

  // Run countdown progress bar while open and auto-close after HOLD_MS.
  useEffect(() => {
    if (!open) return;
    const start = performance.now();
    setProgress(100);

    const tick = (now) => {
      const pct = Math.max(0, 100 - ((now - start) / HOLD_MS) * 100);
      setProgress(pct);
      if (pct > 0) {
        progressRaf.current = requestAnimationFrame(tick);
      }
    };
    progressRaf.current = requestAnimationFrame(tick);

    holdTimer.current = setTimeout(() => close(), HOLD_MS);
    return () => clearHold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Start the first cycle + reschedule after each close.
  useEffect(() => {
    scheduleNext();
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      clearHold();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    clearHold();
    setOpen(false);
    scheduleNext(); // reappear in another 5 minutes
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-xs overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={close}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-foreground/70 shadow-soft transition hover:bg-white hover:text-foreground"
          aria-label="Închide"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-5 py-4">
          <h3 className="font-heading text-lg font-bold text-navy">Urmărește-ne pe Instagram!</h3>
          <p className="mt-0.5 text-sm font-semibold text-emerald">@{HANDLE}</p>
          <p className="mt-1 text-xs text-muted-foreground">Noutăți imobiliare din toată România</p>

          <a
            href={URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-emerald px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:opacity-90"
          >
            <Instagram className="h-4 w-4" /> Dă Follow
          </a>
        </div>

        {/* Countdown progress bar */}
        <div className="h-1 w-full bg-secondary">
          <div
            className="h-full bg-emerald transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}