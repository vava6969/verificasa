import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/fisa";

const EASE = [0.16, 1, 0.3, 1];

// Dismissible Beta notice shown once on first homepage visit (localStorage).
// Registry form: a solid card with a stamped BETA verdict, no glass.
export default function BetaBanner() {
  const { t } = useCountry();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("vc_beta_ack")) {
        const tmr = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(tmr);
      }
    } catch { /* noop */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem("vc_beta_ack", "1"); } catch { /* noop */ }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-deep/60 p-4"
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md border border-border bg-card p-6 sm:p-8"
          >
            <button onClick={dismiss} className="absolute right-4 top-4 rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary" aria-label="Închide">
              <X className="h-5 w-5" />
            </button>
            <Stamp tone="ink">Beta</Stamp>
            <h3 className="mt-4 font-heading text-2xl font-semibold text-foreground">{t("beta_title")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("beta_msg")}</p>
            <Button onClick={dismiss} className="mt-6 w-full rounded bg-emerald text-primary-foreground hover:bg-emerald/90">
              {t("beta_btn")}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
