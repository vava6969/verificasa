import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// VerifiCasa hero background — mai multe interioare moderne care se
// succed prin crossfade, cu opacitate crescută pentru impact vizual, pe un
// fond navy ce păstrează lizibilitatea textului și o tranziție către alb jos.
const HEROES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=2000&q=80",
];

export default function HeroPhoto() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % HEROES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-deep">
      <AnimatePresence>
        <motion.img
          key={idx}
          src={HEROES[idx]}
          alt={`Interior apartament modern VerifiCasa ${idx + 1}`}
          className="h-full w-full object-cover opacity-60"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 0.6, scale: 1.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/60 via-navy/40 to-navy-deep/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-white sm:h-72" />
    </div>
  );
}