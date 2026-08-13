import React from "react";
import { motion } from "framer-motion";

// Primitive de "scroll reveal" reutilizabile în tot site-ul, pe framer-motion
// (deja o dependență a proiectului — vezi circular-carousel.jsx). Scop: fiecare
// secțiune/card apare cu un fade-up discret când intră în viewport, în loc să
// fie pur și simplu prezent din start — dă senzația de site "viu", nu static.

const EASE = [0.22, 1, 0.36, 1];

// Element unic (header de secțiune, panou, imagine) — fade + translate pe scroll.
export function Reveal({ children, className, delay = 0, y = 28, once = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.65, ease: EASE, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Container pentru grile/liste — copiii RevealItem apar în cascadă (stagger).
export function RevealGroup({ children, className, stagger = 0.08, once = true, ...props }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, y = 24, ...props }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
