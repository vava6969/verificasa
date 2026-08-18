import React from "react";
import { motion } from "framer-motion";

// Scroll-reveal primitives. Registry register: content settles into place —
// a quiet fade with a barely-there rise. No stagger theatrics, no long
// slides; the page should feel printed, not animated.

const EASE = [0.22, 1, 0.36, 1];

export function Reveal({ children, className, delay = 0, y = 8, once = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: Math.min(y, 8) }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{ duration: 0.45, ease: EASE, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({ children, className, stagger = 0.04, once = true, ...props }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-40px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: Math.min(stagger, 0.04) } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, y = 8, ...props }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: Math.min(y, 8) },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
