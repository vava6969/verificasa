import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const VISIBLE_COUNT = 5;

function getItemPosition(index, activeIndex, total, radiusX, radiusY) {
  const offset = index - activeIndex;
  const half = Math.floor(VISIBLE_COUNT / 2);
  let adjustedOffset = offset;

  if (offset > half) adjustedOffset = offset - total;
  if (offset < -half) adjustedOffset = offset + total;

  if (Math.abs(adjustedOffset) > half * 2) return null;

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI;
  const x = Math.sin(angle) * radiusX;
  const y = (1 - Math.cos(angle)) * radiusY;

  const distance = Math.abs(adjustedOffset);
  const maxDistance = half + 1;
  const scale = Math.max(0.72, 1 - (distance / maxDistance) * 0.22);
  const opacity = Math.max(0.18, 1 - (distance / maxDistance) * 0.72);
  const zIndex = VISIBLE_COUNT - distance;

  return { x, y, scale, opacity, zIndex, adjustedOffset };
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 4000,
  className,
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  const activeIndex = controlledIndex ?? internalIndex;
  const total = items.length;

  const radiusX = isMobile ? 38 : 190;
  const radiusY = isMobile ? 12 : 55;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goTo = useCallback(
    (index) => {
      const newIndex = ((index % total) + total) % total;
      if (controlledIndex === undefined) {
        setInternalIndex(newIndex);
      }
      onActiveChange?.(newIndex);
    },
    [total, controlledIndex, onActiveChange],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!autoPlay || isHovered || isFocused) return;
    intervalRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, autoPlayInterval, isHovered, isFocused, next]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [next, prev]);

  const activeItem = items[activeIndex];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 outline-none sm:gap-5",
        className,
      )}
    >
      {/* Track */}
      <div className="relative h-[240px] w-full overflow-hidden sm:h-[280px]">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const pos = getItemPosition(i, activeIndex, total, radiusX, radiusY);
            if (!pos) return null;

            const isActive = i === activeIndex;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  x: pos.x,
                  y: pos.y,
                  scale: pos.scale,
                  opacity: pos.opacity,
                  zIndex: pos.zIndex,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => goTo(i)}
                aria-label={item.title}
                aria-selected={isActive}
                role="option"
                className={cn(
                  "absolute inset-0 m-auto flex h-40 w-52 cursor-pointer flex-col items-start gap-2 overflow-hidden rounded-2xl border border-border bg-card p-4 backdrop-blur-sm transition-shadow duration-300 sm:h-44 sm:w-64",
                  isActive
                    ? "shadow-soft ring-1 ring-emerald/50"
                    : "shadow-soft blur-[2px]",
                )}
              >
                <div className="flex w-full items-center gap-2.5 overflow-hidden">
                  {Icon && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-soft text-emerald">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <h3
                    className={cn(
                      "break-words font-semibold leading-tight transition-colors duration-300",
                      isActive
                        ? "text-foreground text-xs sm:text-sm"
                        : "text-muted-foreground text-xs",
                    )}
                  >
                    {item.title}
                  </h3>
                </div>
                <p
                  className={cn(
                    "break-words text-[11px] leading-relaxed transition-colors duration-300 line-clamp-5",
                    isActive ? "text-muted-foreground" : "text-muted-foreground/60",
                  )}
                >
                  {item.description}
                </p>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Counter */}
      <div className="pointer-events-none flex flex-col items-center">
        <span className="text-3xl font-bold tracking-tight text-foreground/90 sm:text-4xl">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span className="mt-0.5 text-xs text-muted-foreground">
          of {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={prev}
          aria-label="Previous item"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-5" />
        </motion.button>

        <div className="flex items-center gap-1.5" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-6 bg-foreground/80"
                  : "w-1.5 bg-foreground/20 hover:bg-foreground/40",
              )}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={next}
          aria-label="Next item"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight className="size-5" />
        </motion.button>
      </div>
    </div>
  );
}

export default CircularCarousel;