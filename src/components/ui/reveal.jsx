import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Scroll-reveal primitives on the single house curve. One weighted ease,
// slow and deliberate (0.9s), no per-index stagger spray — pacing is craft.
// Respects prefers-reduced-motion: content simply appears.

const EASE = [0.16, 1, 0.3, 1];

export function Reveal({ children, className, delay = 0, y = 18, once = true, ...props }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({ children, className, stagger = 0.1, once = true, ...props }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, y = 14, ...props }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
