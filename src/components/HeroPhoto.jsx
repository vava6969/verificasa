import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// VerifiCasa hero background — mai multe interioare moderne ce se succed
// printr-un crossfade lin (glide) cu slow zoom continuu, opacitate crescută,
// pe un fond navy ce păstrează lizibilitatea textului și tranziție spre alb.
const HEROES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=2000&q=80",
];

export default function HeroPhoto({ fadeToClass = "to-white" }) {
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
          alt={`Interior apartament modern VerifiCasa ${idx + 1}`}
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
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/55 via-navy/35 to-navy-deep/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/55 to-transparent" />
      <div className={`absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent sm:h-72 ${fadeToClass}`} />
    </div>
  );
}