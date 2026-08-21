import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

// Notifications as a dated log — the registry form. Each entry is a ruled
// row: type label, text, time, unread mark. No icon tiles, no emoji.

const TYPE_LABEL = {
  comment: "Comentariu",
  reply: "Răspuns",
  like: "Apreciere",
  message: "Mesaj",
  property: "Proprietate",
  review: "Recenzie",
  system: "Sistem",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "acum";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h`;
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
    <section className="border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-heading text-lg font-semibold text-foreground">Notificări</h2>
          {unreadCount > 0 && (
            <span className="text-sm font-semibold text-emerald tnum">{unreadCount} necitite</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs font-semibold text-emerald hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Marchează tot citit
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-border px-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-emerald font-semibold text-emerald"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {activeTab === "Marcate"
                ? "Nicio notificare marcată."
                : activeTab === "Citite"
                  ? "Nimic în arhivă încă."
                  : "Nimic necitit. Totul la zi."}
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const label = TYPE_LABEL[n.type] || TYPE_LABEL.system;
            const isStarred = starred.has(n.id);

            const body = (
              <div className={cn("flex items-start gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/60", !n.read && "bg-secondary/40")}>
                {/* unread mark */}
                <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", !n.read ? "bg-emerald" : "bg-transparent")} aria-hidden="true" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {label}
                    {n.actor_name && <span className="font-normal"> · {n.actor_name}</span>}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-foreground">{n.text}</p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <button onClick={(e) => toggleStar(n.id, e)} className="p-0.5" aria-label={isStarred ? "Scoate marcajul" : "Marchează"}>
                    <Star className={cn("h-4 w-4 transition-colors", isStarred ? "fill-gold-deep text-gold-deep" : "text-border hover:text-muted-foreground")} />
                  </button>
                  <span className="text-[11px] text-muted-foreground tnum">{timeAgo(n.created_date)}</span>
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
