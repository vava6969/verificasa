import React from "react";
import { motion } from "framer-motion";

// VerifiCasa hero background — a warm, modern Romanian apartment interior,
// shown at low opacity with a slow zoom, blending into the navy backdrop for
// text legibility and a smooth fade to white at the bottom.
const HERO_PHOTO =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80";

export default function HeroPhoto() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-deep">
      <motion.img
        src={HERO_PHOTO}
        alt="Interior apartament modern VerifiCasa"
        className="h-full w-full object-cover opacity-40"
        initial={{ scale: 1 }}
        animate={{ scale: 1.12 }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/70 via-navy/45 to-navy-deep/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-white sm:h-72" />
    </div>
  );
}