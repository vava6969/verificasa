import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
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
    { label: en ? "My Account" : "Contul Meu", path: isAuthenticated ? "/account" : "/login" },
    { label: en ? "Plans" : "Planuri", path: "/upgrade" },
    { label: en ? "Search" : "Caută", path: "/search" },
    { label: en ? "Map" : "Hartă", path: "/map" },
    { label: en ? "Contact" : "Contact", path: "/contact" },
    { label: en ? "About Us" : "Despre Noi", path: "/about" },
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
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:border-emerald/50"
        aria-label={en ? "Menu" : "Meniu"}
        aria-expanded={open}
      >
        <Menu className="h-[18px] w-[18px]" />
        {isAuthenticated && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <React.Fragment>
            <motion.div
              className="fixed inset-0 z-40 bg-navy-deep/30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease }}
              className="absolute right-0 top-11 z-50 w-60 origin-top-right overflow-hidden rounded-lg border border-border bg-card py-1 shadow-soft"
              role="menu"
            >
              {items.map((it, i) => (
                <button
                  key={it.path + it.label}
                  type="button"
                  role="menuitem"
                  onClick={() => go(it.path)}
                  className="flex w-full items-baseline gap-3 border-b border-border/60 px-4 py-2.5 text-left transition last:border-b-0 hover:bg-secondary"
                >
                  <span className="w-5 shrink-0 font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-semibold text-navy dark:text-foreground">{it.label}</span>
                </button>
              ))}
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}
