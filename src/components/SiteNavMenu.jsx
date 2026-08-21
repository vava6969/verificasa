import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { useNotifications } from "@/hooks/useNotifications";

const EASE = [0.16, 1, 0.3, 1];

// Site menu, top-right. A solid rounded panel on a round trigger — no glass,
// no icon tiles. The trigger carries the unread badge; the menu includes
// Notificări so the badge leads somewhere. Every row is a 44px rounded target.
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
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-emerald sm:h-9 sm:w-9"
        aria-label={en ? "Menu" : "Meniu"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        {!open && isAuthenticated && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-emerald px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background tnum">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[calc(100vh-5rem)] w-60 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-2 shadow-lg"
            role="menu"
          >
            {items.map((it) => (
              <button
                key={it.path + it.label}
                type="button"
                role="menuitem"
                onClick={() => go(it.path)}
                className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl px-3.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-emerald"
              >
                {it.label}
                {it.badge && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald px-1.5 text-[10px] font-bold leading-none text-primary-foreground tnum">
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
