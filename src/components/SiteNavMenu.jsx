import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sparkles, Search, MapPin, Phone, Info } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { useNotifications } from "@/hooks/useNotifications";

const ease = [0.22, 1, 0.36, 1];

// Trigger + expanding panel that replaces the old account-avatar dropdown in
// the header's top-right corner. Same spot, same job (site navigation), but
// now it's a lightweight map to the six main destinations instead of a long
// list of account actions — those all already live on /account (Contul Meu).
export default function SiteNavMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { lang } = useCountry();
  const { unreadCount } = useNotifications();
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
    { label: en ? "My Account" : "Contul Meu", icon: User, path: isAuthenticated ? "/account" : "/login" },
    { label: en ? "Plans" : "Planuri", icon: Sparkles, path: "/upgrade" },
    { label: en ? "Search" : "Caută", icon: Search, path: "/search" },
    { label: en ? "Map" : "Hartă", icon: MapPin, path: "/map" },
    { label: en ? "Contact" : "Contact", icon: Phone, path: "/contact" },
    { label: en ? "About Us" : "Despre Noi", icon: Info, path: "/about" },
  ];

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: open ? 90 : 0 }}
        transition={{ duration: 0.4, ease }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-white/60 shadow-soft backdrop-blur-md transition hover:border-emerald/50 dark:bg-navy-deep/60"
        aria-label={en ? "Menu" : "Meniu"}
        aria-expanded={open}
      >
        <img src="/images/generated/icon-nav-menu.png" alt="" className="h-6 w-6 object-contain" />
        {isAuthenticated && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-navy-deep">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <React.Fragment>
            <motion.div
              className="fixed inset-0 z-40 bg-navy-deep/20 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ duration: 0.32, ease }}
              className="absolute right-0 top-11 z-50 w-60 origin-top-right overflow-hidden rounded-2xl border border-border/60 bg-white/95 p-2 shadow-glow backdrop-blur-2xl dark:bg-navy-deep/95"
              role="menu"
            >
              {items.map((it, i) => {
                const Icon = it.icon;
                return (
                  <motion.button
                    key={it.path + it.label}
                    type="button"
                    role="menuitem"
                    onClick={() => go(it.path)}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.045 * i, ease }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-emerald-soft active:scale-[0.98]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-navy dark:text-foreground">{it.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}
