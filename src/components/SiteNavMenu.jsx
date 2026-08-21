import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { useNotifications } from "@/hooks/useNotifications";

const EASE = [0.16, 1, 0.3, 1];

// Site menu, top-right. Registry form: a plain typed list on a solid card —
// no icon tiles, no per-item stagger, no glass. The trigger is a code-drawn
// hamburger (functional control) carrying the unread badge; the menu now
// includes Notificări so the badge finally leads somewhere.
export default function SiteNavMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { lang } = useCountry();
  const { unreadCount } = useNotifications();
  const reduced = useReducedMotion();
  const en = lang === "en";

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { label: en ? "My account" : "Contul meu", path: isAuthenticated ? "/account" : "/login" },
    ...(isAuthenticated
      ? [{ label: en ? "Notifications" : "Notificări", path: "/notificari", badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null }]
      : []),
    { label: en ? "Plans" : "Planuri", path: "/upgrade" },
    { label: en ? "Search" : "Caută", path: "/search" },
    { label: en ? "Map" : "Hartă", path: "/map" },
    { label: en ? "Partners" : "Parteneri", path: "/parteneri" },
    { label: en ? "Contact" : "Contact", path: "/contact" },
    { label: en ? "About us" : "Despre noi", path: "/about" },
  ];

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded border border-border bg-card transition-colors hover:border-emerald"
        aria-label={en ? "Menu" : "Meniu"}
        aria-expanded={open}
      >
        <span className="h-[2px] w-4 bg-foreground" />
        <span className="h-[2px] w-4 bg-foreground" />
        <span className="h-[2px] w-4 bg-foreground" />
        {isAuthenticated && unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-sm bg-emerald px-1 text-[10px] font-bold leading-none text-primary-foreground tnum">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute right-0 top-11 z-50 w-56 border border-border bg-card p-1.5 shadow-soft"
            role="menu"
          >
            {items.map((it) => (
              <button
                key={it.path + it.label}
                type="button"
                role="menuitem"
                onClick={() => go(it.path)}
                className="flex w-full items-center justify-between gap-3 rounded px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {it.label}
                {it.badge && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-sm bg-emerald px-1 text-[10px] font-bold leading-none text-primary-foreground tnum">
                    {it.badge}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
