import React from "react";
import { cn } from "@/lib/utils";

/**
 * A silent, seamlessly looping video band. The clips are generated with the
 * same frame at their start and end, so `loop` returns to the opening frame
 * with no visible seam.
 *
 * Autoplay rules: muted + playsInline are both required for iOS to start it
 * without a tap. preload="metadata" means the first frame paints immediately
 * without pulling the whole file. Anyone who asked their system for reduced
 * motion gets the still first frame instead of a moving picture.
 */
export default function LoopVideo({ src, poster, className, objectPosition = "center" }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mq.matches) el.pause();
      else el.play().catch(() => {});
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <video
      ref={ref}
      className={cn("h-full w-full object-cover", className)}
      style={{ objectPosition }}
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
