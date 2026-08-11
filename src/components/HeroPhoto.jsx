import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// VerifiCasa hero background — set propriu de proprietăți (exterior + interioare
// generate în același stil/locul, consistente ca brană), ce se succed printr-un
// crossfade lin (glide) cu slow zoom continuu, opacitate crescută, pe un fond
// navy ce păstrează lizibilitatea textului și tranziție spre alb.
const HEROES = [
  "/images/hero/villa-exterior.webp",
  "/images/hero/villa-living-1.webp",
  "/images/hero/villa-bedroom.webp",
  "/images/hero/villa-living-2.webp",
];

export default function HeroPhoto() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % HEROES.length), 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-deep">
      <AnimatePresence>
        <motion.img
          key={idx}
          src={HEROES[idx]}
          alt={`Proprietate verificată VerifiCasa ${idx + 1}`}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 0.72, scale: 1.14 }}
          exit={{ opacity: 0, scale: 1.14 }}
          transition={{
            opacity: { duration: 2.2, ease: "easeInOut" },
            scale: { duration: 7.2, ease: "easeOut" },
          }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/65 via-navy/45 to-navy-deep/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/65 via-navy-deep/15 to-transparent" />
      <div className="hero-fade absolute inset-x-0 bottom-0 h-56 sm:h-72" />
    </div>
  );
}