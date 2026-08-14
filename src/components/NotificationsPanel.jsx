import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Heart, MessageSquare, Star, CheckCheck, Phone, Building2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

// Map notification types to icons and background colors (like the design reference)
const TYPE_CONFIG = {
  comment:  { Icon: MessageSquare, bg: "bg-blue-100 dark:bg-blue-900/40",   icon: "text-blue-600 dark:text-blue-400",   label: "Comentariu" },
  reply:    { Icon: MessageSquare, bg: "bg-blue-100 dark:bg-blue-900/40",   icon: "text-blue-600 dark:text-blue-400",   label: "Răspuns" },
  like:     { Icon: Heart,         bg: "bg-rose-100 dark:bg-rose-900/40",   icon: "text-rose-500 dark:text-rose-400",   label: "Apreciere" },
  message:  { Icon: Phone,         bg: "bg-blue-100 dark:bg-blue-900/40",   icon: "text-blue-600 dark:text-blue-400",   label: "Mesaj" },
  property: { Icon: Building2,     bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "text-emerald dark:text-emerald",   label: "Proprietate" },
  review:   { Icon: Star,          bg: "bg-amber-100 dark:bg-amber-900/30",   icon: "text-amber-500 dark:text-amber-400", label: "Recenzie" },
  system:   { Icon: Bell,          bg: "bg-secondary dark:bg-secondary",     icon: "text-muted-foreground",              label: "Sistem" },
};

const ADMIN_CONFIG = { Icon: Phone, bg: "bg-rose-100 dark:bg-rose-900/40", icon: "text-rose-600 dark:text-rose-400", label: "Admin" };

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "acum";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)} zile`;
}

const TABS = ["Recente", "Citite", "Marcate"];

export default function NotificationsPanel() {
  const { notifications, unreadCount, markAsRead, markAllRead, loading } = useNotifications();
  const [activeTab, setActiveTab] = useState("Recente");
  const [starred, setStarred] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("vc_starred_notifs") || "[]")); }
    catch { return new Set(); }
  });

  const toggleStar = (id, e) => {
    e.preventDefault(); e.stopPropagation();
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("vc_starred_notifs", JSON.stringify([...next]));
      return next;
    });
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === "Recente") return !n.read;
    if (activeTab === "Citite") return n.read;
    if (activeTab === "Marcate") return starred.has(n.id);
    return true;
  });

  return (
    <section className="rounded-2xl border border-border bg-white shadow-soft dark:bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Bell className="h-5 w-5 text-emerald" />
          <h2 className="font-heading text-lg font-bold text-navy dark:text-foreground">Notificări</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs font-semibold text-emerald hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Marchează citit
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-border px-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-emerald text-emerald font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="divide-y divide-border/50">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-5 w-5 rounded-full border-2 border-emerald border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {activeTab === "Marcate" ? "Nicio notificare marcată cu stea." : "Totul la zi! 🎉"}
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const isAdmin = n.link === "/admin" || (n.link || "").startsWith("/admin");
            const config = isAdmin ? ADMIN_CONFIG : (TYPE_CONFIG[n.type] || TYPE_CONFIG.system);
            const { Icon, bg, icon, label } = config;
            const isStarred = starred.has(n.id);

            const body = (
              <div className={cn(
                "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/30",
                !n.read && "bg-secondary/20"
              )}>
                {/* Icon badge */}
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", bg)}>
                  <Icon className={cn("h-5 w-5", icon)} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide leading-none mb-1">
                    {label}
                    {n.actor_name && ` · ${n.actor_name}`}
                  </p>
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{n.text}</p>
                </div>

                {/* Right side: star + time */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    onClick={(e) => toggleStar(n.id, e)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star className={cn("h-4 w-4 transition-colors", isStarred ? "fill-amber-400 text-amber-400" : "text-border hover:text-amber-300")} />
                  </button>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(n.created_date)}</span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-emerald" />}
                </div>
              </div>
            );

            return n.link ? (
              <Link key={n.id} to={n.link} className="block" onClick={() => markAsRead(n.id)}>
                {body}
              </Link>
            ) : (
              <div key={n.id} onClick={() => markAsRead(n.id)}>{body}</div>
            );
          })
        )}
      </div>
    </section>
  );
}