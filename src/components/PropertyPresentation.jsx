import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Image } from "@/components/ui/image";

const SLIDE_MS = 4200;

// Direcții de pan alternante — fiecare poză primește un zoom+pan ușor diferit,
// ca o prezentare montată, nu un simplu zoom static repetat identic.
const PANS = [
  { x: "-3%", y: "1.5%" },
  { x: "3%", y: "-1.5%" },
  { x: "-2.5%", y: "-2%" },
  { x: "2.5%", y: "2%" },
];

// Tab "Prezentare" — rulează automat prin pozele anunțului cu un efect de
// zoom + pan lent (stil cinematic), fără să fie nevoie de play. Apare doar
// dacă anunțul are poze.
export default function PropertyPresentation({ images, title }) {
  const [idx, setIdx] = useState(0);
  const reduceMotion = useReducedMotion();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!images?.length || images.length < 2 || reduceMotion) return;
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % images.length), SLIDE_MS);
    return () => clearInterval(timerRef.current);
  }, [images?.length, reduceMotion]);

  if (!images?.length) return null;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-navy-deep shadow-[0_30px_80px_-30px_rgba(16,24,40,0.4)]"
      style={{ aspectRatio: "16 / 10" }}
    >
      <AnimatePresence>
        {images.map((img, i) => i === idx && (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          >
            <motion.div
              className="h-full w-full"
              initial={{ scale: 1.02, x: "0%", y: "0%" }}
              animate={reduceMotion ? {} : { scale: 1.14, x: PANS[i % PANS.length].x, y: PANS[i % PANS.length].y }}
              transition={{ duration: SLIDE_MS / 1000 + 1.1, ease: "linear" }}
            >
              <Image src={img} alt={`${title || ""} ${i + 1}`} fittingType="fill" className="h-full w-full" />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent" />

      <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
        </span>
        Prezentare live
      </span>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Poza ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? "w-7 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
