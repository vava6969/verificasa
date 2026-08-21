import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, Plus, MessageCircle, User } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

// Mobile bottom navigation — the app's primary chrome. Solid paper bar with a
// hairline rule (no glass), safe-area respected, 44px touch targets. Icons
// stay: a bottom nav is a functional control. Messages carries its own unread
// count; Account carries the remaining notification count so nothing unread
// is invisible from the phone.
export default function BottomNav() {
  const { t, lang } = useCountry();
  const en = lang === "en";
  const { isAuthenticated } = useAuth();
  const { unreadCount, unreadMessageCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const otherUnread = Math.max(0, unreadCount - unreadMessageCount);

  const guard = (path) => () => {
    if (!isAuthenticated && ["/owner", "/messages", "/saved"].includes(path)) {
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const items = [
    { icon: Home, label: en ? "Home" : "Acasă", path: "/", onClick: guard("/") },
    { icon: Heart, label: en ? "Saved" : "Salvate", path: "/saved", onClick: guard("/saved") },
    {
      icon: Plus,
      label: en ? "Add" : "Adaugă",
      path: "/post-property",
      primary: true,
      onClick: () => {
        if (!isAuthenticated) { navigate("/login"); return; }
        navigate("/post-property");
      },
    },
    {
      icon: MessageCircle, label: en ? "Messages" : "Mesaje", path: "/messages", onClick: guard("/messages"),
      badge: unreadMessageCount > 0 ? (unreadMessageCount > 9 ? "9+" : unreadMessageCount) : null,
    },
    {
      icon: User, label: isAuthenticated ? (en ? "Account" : "Cont") : t("hdr_login"),
      path: isAuthenticated ? "/account" : "/login",
      onClick: () => navigate(isAuthenticated ? "/account" : "/login"),
      badge: isAuthenticated && otherUnread > 0 ? (otherUnread > 9 ? "9+" : otherUnread) : null,
    },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-7xl items-stretch justify-around border-t border-border bg-background px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1 md:hidden"
      aria-label="Navigare rapidă"
    >
      {items.map((it) => {
        const active = isActive(it.path);
        const Icon = it.icon;
        if (it.primary) {
          return (
            <button key={it.path} onClick={it.onClick} className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 py-0.5" aria-label={it.label}>
              <span className="flex h-9 w-9 items-center justify-center rounded bg-emerald text-primary-foreground">
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="text-[10px] font-bold text-emerald">{it.label}</span>
            </button>
          );
        }
        return (
          <button key={it.path} onClick={it.onClick} className="relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 py-0.5" aria-label={it.label}>
            <span className="relative">
              <Icon className={`h-5 w-5 ${active ? "text-emerald" : "text-muted-foreground"}`} strokeWidth={active ? 2.4 : 2} />
              {it.badge && (
                <span className="absolute -right-2.5 -top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-sm bg-emerald px-1 text-[9px] font-bold leading-none text-primary-foreground tnum">
                  {it.badge}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-semibold ${active ? "text-emerald" : "text-muted-foreground"}`}>{it.label}</span>
            {active && <span className="absolute inset-x-4 top-0 h-[2px] bg-emerald" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}
