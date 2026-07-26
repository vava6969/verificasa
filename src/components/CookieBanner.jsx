import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";

// Dismissible GDPR / cookie consent banner shown once site-wide (localStorage gated).
export default function CookieBanner() {
  const { t } = useCountry();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("vc_cookie_ack")) setShow(true);
    } catch {}
  }, []);

  const dismiss = () => {
    try { localStorage.setItem("vc_cookie_ack", "1"); } catch {}
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:pb-6"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-emerald/30 bg-navy-deep/95 px-4 py-3.5 text-white shadow-glow backdrop-blur-md sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald/20 text-emerald">
                <Cookie className="h-5 w-5" />
              </div>
              <p className="flex-1 text-xs leading-relaxed text-white/80 sm:text-sm">
                {t("cookie_msg")}{" "}
                <Link to="/privacy" className="font-semibold text-emerald hover:underline">
                  {t("footer_privacy")}
                </Link>.
              </p>
              <Button onClick={dismiss} size="sm" className="gradient-mint text-navy hover:opacity-90">
                {t("cookie_accept")}
              </Button>
              <button onClick={dismiss} className="rounded-full p-1 text-white/50 hover:text-white" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}