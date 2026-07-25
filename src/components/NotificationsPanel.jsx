import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, Heart, MessageSquare, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const ICON = {
  comment: MessageSquare,
  reply: MessageSquare,
  like: Heart,
  message: MessageCircle,
  property: Bell,
  system: Bell,
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "acum";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `${days} zile`;
}

export default function NotificationsPanel() {
  const { notifications, unreadCount, markAllRead, loading } = useNotifications();

  // Marchează tot ca citit la scurt timp după deschiderea panoului.
  useEffect(() => {
    if (unreadCount > 0) {
      const t = setTimeout(() => markAllRead(), 1200);
      return () => clearTimeout(t);
    }
  }, [unreadCount]);

  return (
    <section className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-soft dark:bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald" />
          <h2 className="font-heading text-lg font-bold text-navy dark:text-foreground">Notificări</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {unreadCount} noi
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs font-semibold text-emerald hover:underline"
          >
            <CheckCheck className="h-4 w-4" /> Marchează ca citit
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Comentarii, aprecieri, răspunsuri și mesaje noi — în timp real.
      </p>

      <div className="mt-4 space-y-2">
        {loading && notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Se încarcă...</p>
        ) : notifications.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-6 text-center text-sm text-muted-foreground">
            Nicio notificare încă. 🎉
          </p>
        ) : (
          notifications.map((n) => {
            const Icon = ICON[n.type] || Bell;
            const body = (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3 py-3 transition",
                  n.read
                    ? "border-border bg-secondary/20"
                    : "border-emerald/30 bg-emerald-soft/40"
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground/85">{n.text}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                    <span>{n.actor_name}</span>
                    <span>·</span>
                    <span>{timeAgo(n.created_date)}</span>
                  </div>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} className="block">
                {body}
              </Link>
            ) : (
              <div key={n.id}>{body}</div>
            );
          })
        )}
      </div>
    </section>
  );
}