import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Viewfinder, PhotoMark } from "@/components/fisa";

// The hero photograph as a fișă: a real property image with the inspection
// layer drawn ON it — viewfinder brackets, measured facts annotated in the
// frame, the property code in the margin. Crossfades through the set on a
// slow, weighted pace.
const HEROES = [
  { src: "/images/hero/villa-exterior.webp", mark: "EXTERIOR · FAȚADĂ SUD" },
  { src: "/images/hero/villa-living-1.webp", mark: "LIVING · 24 MP" },
  { src: "/images/hero/villa-bedroom.webp", mark: "DORMITOR · 14 MP" },
  { src: "/images/hero/villa-living-2.webp", mark: "LIVING · LUMINĂ VEST" },
];

export default function HeroPhoto({ className = "" }) {
  const [idx, setIdx] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const id = setInterval(() => setIdx((i) => (i + 1) % HEROES.length), 7000);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className={`relative overflow-hidden border border-border bg-navy-deep ${className}`}>
      <AnimatePresence initial={false}>
        <motion.img
          key={idx}
          src={HEROES[idx].src}
          alt="Proprietate verificată VerifiCasa"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </AnimatePresence>

      {/* thin scrim only where the marks sit */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />

      {/* the inspection layer */}
      <Viewfinder />
      <PhotoMark className="left-4 bottom-3">{HEROES[idx].mark}</PhotoMark>
      <PhotoMark className="right-4 bottom-3">VC-2026-0817</PhotoMark>
      <PhotoMark className="right-4 top-3" >VERIFICAT ✓</PhotoMark>
    </div>
  );
}
