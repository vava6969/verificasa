import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Settings, X, Check, ShieldCheck } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent } from "@/lib/cookieConsent";

// GDPR cookie consent: banner with Accept-all / Reject / Preferences modal,
// plus a floating "Cookie settings" button after consent is given.
export default function CookieBanner() {
  const { t } = useCountry();
  const [show, setShow] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const [prefs, setPrefs] = useState({ functional: false, analytics: false });

  useEffect(() => {
    const c = getConsent();
    if (!c) {
      setShow(true);
    } else {
      setShowFAB(true);
    }
  }, []);

  const acceptAll = () => {
    setConsent({ necessary: true, functional: true, analytics: true });
    setShow(false);
    setShowPrefs(false);
    setShowFAB(true);
  };

  const rejectAll = () => {
    setConsent({ necessary: true, functional: false, analytics: false });
    setShow(false);
    setShowPrefs(false);
    setShowFAB(true);
  };

  const savePrefs = () => {
    setConsent({ necessary: true, functional: prefs.functional, analytics: prefs.analytics });
    setShow(false);
    setShowPrefs(false);
    setShowFAB(true);
  };

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:pb-6"
          >
            <div className="mx-auto max-w-3xl rounded-2xl border border-emerald/30 bg-navy-deep/95 px-4 py-3.5 text-white shadow-glow backdrop-blur-md sm:px-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald/20 text-emerald">
                  <Cookie className="h-5 w-5" />
                </div>
                <p className="flex-1 text-xs leading-relaxed text-white/80 sm:text-sm">
                  {t("cookie_msg")}{" "}
                  <Link to="/cookies" className="font-semibold text-emerald hover:underline">
                    {t("cookie_policy_link")}
                  </Link>{" "}
                  {t("cookie_and")}{" "}
                  <Link to="/privacy" className="font-semibold text-emerald hover:underline">
                    {t("footer_privacy")}
                  </Link>.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={rejectAll} size="sm" variant="ghost" className="text-white/70 hover:bg-white/10 hover:text-white">
                    {t("cookie_reject")}
                  </Button>
                  <Button onClick={() => setShowPrefs(true)} size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                    {t("cookie_prefs")}
                  </Button>
                  <Button onClick={acceptAll} size="sm" className="gradient-mint text-navy hover:opacity-90">
                    {t("cookie_accept")}
                  </Button>
                  <button onClick={rejectAll} className="rounded-full p-1 text-white/50 hover:text-white" aria-label="Close">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrefs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setShowPrefs(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-navy dark:text-foreground">
                  {t("cookie_prefs_title")}
                </h3>
                <button onClick={() => setShowPrefs(false)} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                {t("cookie_prefs_desc")}
              </p>

              <div className="space-y-3">
                <CookieRow
                  t={t}
                  title={t("cookie_cat_necessary")}
                  desc={t("cookie_cat_necessary_d")}
                  checked
                  disabled
                />
                <CookieRow
                  t={t}
                  title={t("cookie_cat_functional")}
                  desc={t("cookie_cat_functional_d")}
                  checked={prefs.functional}
                  onChange={(v) => setPrefs((p) => ({ ...p, functional: v }))}
                />
                <CookieRow
                  t={t}
                  title={t("cookie_cat_analytics")}
                  desc={t("cookie_cat_analytics_d")}
                  checked={prefs.analytics}
                  onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
                />
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <Button onClick={rejectAll} size="sm" variant="ghost">
                  {t("cookie_reject_all")}
                </Button>
                <Button onClick={savePrefs} size="sm" className="gradient-mint text-navy hover:opacity-90">
                  {t("cookie_save_prefs")}
                </Button>
                <Button onClick={acceptAll} size="sm" variant="outline">
                  {t("cookie_accept_all")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFAB && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setShowPrefs(true); setPrefs({ functional: getConsent()?.functional || false, analytics: getConsent()?.analytics || false }); }}
            className="fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-emerald/30 bg-navy-deep/90 text-emerald shadow-glow backdrop-blur-md transition hover:scale-105"
            aria-label={t("cookie_settings")}
            title={t("cookie_settings")}
          >
            <Settings className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

function CookieRow({ title, desc, checked, disabled, onChange, t }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-border p-3 ${disabled ? "bg-secondary/30" : "bg-background"}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-navy dark:text-foreground">{title}</p>
          {disabled && (
            <span className="flex items-center gap-1 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-semibold text-emerald">
              <ShieldCheck className="h-3 w-3" /> {t("cookie_always_on")}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-emerald" : "bg-muted-foreground/30"} ${disabled ? "opacity-60" : ""}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`}>
          {checked && <Check className="h-3 w-3 text-emerald" />}
        </span>
      </button>
    </div>
  );
}