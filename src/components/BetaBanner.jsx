import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, X } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";

// Dismissible Beta popup shown once on first homepage visit (localStorage gated).
export default function BetaBanner() {
  const { t } = useCountry();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("vc_beta_ack")) {
        const tmr = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(tmr);
      }
    } catch {}
  }, []);

  const dismiss = () => {
    try { localStorage.setItem("vc_beta_ack", "1"); } catch {}
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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-deep/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gold/30 bg-white p-6 shadow-glow sm:p-8"
          >
            <button onClick={dismiss} className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-soft text-gold-deep">
              <Beaker className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-heading text-2xl font-bold text-navy">{t("beta_title")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("beta_msg")}</p>
            <Button onClick={dismiss} className="mt-6 w-full gradient-mint text-navy hover:opacity-90">
              {t("beta_btn")}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}