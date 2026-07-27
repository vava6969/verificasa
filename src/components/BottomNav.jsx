import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, Plus, MessageCircle, User } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

// Mobile bottom navigation bar (OLX-style). Hides on scroll-down, reveals on
// scroll-up — same interaction pattern as the top Header.
export default function BottomNav() {
  const { t } = useCountry();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 8) { setHidden(false); lastY.current = y; return; }
      if (y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const guard = (path) => () => {
    if (!isAuthenticated && ["/owner", "/messages", "/saved"].includes(path)) {
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const items = [
    { icon: Home, label: t("hdr_home"), path: "/", onClick: guard("/") },
    { icon: Heart, label: t("hdr_saved"), path: "/saved", onClick: guard("/saved") },
    { icon: Plus, label: t("hdr_add"), path: "/post-property", onClick: () => {
      if (!isAuthenticated) { navigate("/login"); return; }
      window.open("/post-property", "_blank", "noopener,noreferrer");
    }, primary: true },
    { icon: MessageCircle, label: t("hdr_messages"), path: "/messages", onClick: guard("/messages"), badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null },
    { icon: User, label: isAuthenticated ? t("hdr_myaccount") : t("hdr_login"), path: isAuthenticated ? "/account" : "/login", onClick: () => { if (isAuthenticated) { document.getElementById("account-menu")?.scrollIntoView({ behavior: "smooth", block: "start" }); navigate("/account#account-menu"); } else navigate("/login"); } },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-7xl items-stretch justify-around border-t border-border/60 bg-white/90 px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 shadow-[0_-4px_18px_-8px_rgb(27_34_44/0.18)] backdrop-blur-xl transition-all duration-300 ease-out md:hidden dark:bg-navy-deep/90 ${hidden ? "translate-y-[calc(100%+8px)] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
      aria-label="Navigare rapidă"
    >
      {items.map((it) => {
        const active = isActive(it.path);
        const Icon = it.icon;
        if (it.primary) {
          return (
            <button key={it.path} onClick={it.onClick} className="flex flex-1 flex-col items-center justify-center gap-0.5 py-0.5" aria-label={it.label}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald text-white shadow-soft">
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="text-[10px] font-bold text-emerald">{it.label}</span>
            </button>
          );
        }
        return (
          <button key={it.path} onClick={it.onClick} className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-0.5" aria-label={it.label}>
            <span className={`relative flex h-7 w-7 items-center justify-center ${active ? "text-emerald" : "text-foreground/60"}`}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} fill={active && it.icon === Home ? "currentColor" : "none"} />
              {it.badge && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {it.badge}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-semibold ${active ? "text-emerald" : "text-foreground/60"}`}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}