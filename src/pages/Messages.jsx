import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Search, MoreVertical, CheckCheck, RefreshCw, Trash2, ChevronDown } from "lucide-react";
import { initials, timeLabel, avatarColor } from "@/lib/chatUtils";
import { Image } from "@/components/ui/image";

const PAGE_SIZE = 5;

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const legacyId = params.get("c");
  const [conversations, setConversations] = useState(null);
  const [convSearch, setConvSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [avatarMap, setAvatarMap] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const loadConversations = async () => {
    try {
      const [all, allMsgs, allUsers] = await Promise.all([
        base44.entities.Conversation.list("-updated_date", 200),
        base44.entities.Message.list("-created_date", 500).catch(() => []),
        base44.entities.User.list("-created_date", 200).catch(() => []),
      ]);
      const mine = all.filter((c) => c.buyer_id === user.id || c.seller_id === user.id);

      // Build avatar map (user id -> avatar_url)
      const avatars = {};
      (allUsers || []).forEach((u) => {
        if (u.id && u.avatar_url) avatars[u.id] = u.avatar_url;
      });
      setAvatarMap(avatars);

      const unreadByConv = {};
      const lastByConv = {};
      allMsgs.forEach((m) => {
        if (!m) return;
        const cid = m.conversation_id;
        if (m.sender_id !== user.id && !m.read_at) unreadByConv[cid] = (unreadByConv[cid] || 0) + 1;
        if (!lastByConv[cid] || new Date(m.created_date) > new Date(lastByConv[cid])) lastByConv[cid] = m.created_date;
      });
      const enriched = mine
        .map((c) => ({ ...c, _unread: unreadByConv[c.id] || 0, _lastAt: lastByConv[c.id] || c.updated_date }))
        .sort((a, b) => new Date(b._lastAt || 0) - new Date(a._lastAt || 0));
      setConversations(enriched);
    } catch { setConversations([]); }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadConversations();
    const unsubM = base44.entities.Message.subscribe(() => loadConversations());
    const unsubC = base44.entities.Conversation.subscribe(() => loadConversations());
    return () => { try { unsubM?.(); } catch {} try { unsubC?.(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (legacyId) return <Navigate to={"/messages/" + legacyId} replace />;

  const markAllRead = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const allMsgs = await base44.entities.Message.list("-created_date", 500).catch(() => []);
      const toUpdate = allMsgs.filter((m) => m.sender_id !== user.id && !m.read_at);
      if (!toUpdate.length) { toast({ title: "Toate mesajele sunt deja citite" }); return; }
      const now = new Date().toISOString();
      await Promise.all(toUpdate.map((m) => base44.entities.Message.update(m.id, { read_at: now }).catch(() => {})));
      toast({ title: `${toUpdate.length} mesaje marcate ca citite` });
      loadConversations();
    } catch { toast({ title: "Eroare", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const deleteConversation = async (e, conv) => {
    e.stopPropagation();
    setDeletingId(conv.id);
    try {
      await base44.entities.Message.deleteMany({ conversation_id: conv.id }).catch(() => {});
      await base44.entities.Conversation.delete(conv.id);
      toast({ title: "Conversație ștearsă" });
      loadConversations();
    } catch {
      toast({ title: "Ștergerea a eșuat", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredConvs = (conversations || []).filter((c) => {
    const q = convSearch.toLowerCase();
    if (!q) return true;
    return (
      (c.property_title || "").toLowerCase().includes(q) ||
      (c.buyer_name || "").toLowerCase().includes(q) ||
      (c.seller_name || "").toLowerCase().includes(q)
    );
  });

  const totalUnread = (conversations || []).reduce((acc, c) => acc + (c._unread || 0), 0);
  const visibleConvs = filteredConvs.slice(0, visibleCount);
  const hasMore = filteredConvs.length > visibleCount;

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-2xl flex-col overflow-hidden bg-[#f4f6f9] dark:bg-background lg:h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="relative flex items-center justify-between overflow-hidden border-b border-border bg-white px-4 py-3 dark:bg-card">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-emerald/10 blur-2xl" />
        <div className="relative flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald/15 text-emerald"><MessageCircle className="h-4 w-4" /></span>
          <h1 className="font-heading text-xl font-bold text-navy dark:text-foreground">Mesaje</h1>
          {totalUnread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {totalUnread > 9 ? "+9" : totalUnread}
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary/60" aria-label="Opțiuni">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={markAllRead} disabled={busy} className="gap-2">
              <CheckCheck className="h-4 w-4 text-emerald" /> Marchează toate ca citite
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => loadConversations()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Reîmprospătează
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="bg-white px-3 py-2 dark:bg-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={convSearch}
            onChange={(e) => { setConvSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="Caută conversație..."
            className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-4 text-base outline-none focus:border-emerald dark:bg-card"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {conversations === null ? (
          <div className="space-y-1 px-2 py-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        ) : filteredConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald/20 to-gold/10 blur-md" />
              <MessageCircle className="relative h-8 w-8 text-emerald/70" />
            </span>
            <p className="text-sm text-muted-foreground">
              {convSearch ? "Nicio conversație găsită." : "Nicio conversație încă. Deschide un anunț și apasă Mesaj."}
            </p>
          </div>
        ) : (
          <>
            {visibleConvs.map((c, idx) => {
              const otherId = c.buyer_id === user?.id ? c.seller_id : c.buyer_id;
              const otherN = c.buyer_id === user?.id ? c.seller_name : c.buyer_name;
              const unread = c._unread || 0;
              const avatarUrl = avatarMap[otherId];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx, 8) * 0.03 }}
                  onClick={() => navigate("/messages/" + c.id)}
                  className="group flex w-full cursor-pointer items-center gap-3 border-b border-border/50 bg-white px-4 py-3 text-left transition-colors hover:bg-secondary/40 dark:bg-card"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={otherN || "Avatar"}
                      fittingType="fill"
                      className="h-11 w-11 shrink-0 rounded-full"
                    />
                  ) : (
                    <span className={["flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", avatarColor(c.id)].join(" ")}>
                      {initials(otherN || c.property_title || "?")}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={["truncate text-sm text-navy dark:text-foreground", unread ? "font-bold" : "font-semibold"].join(" ")}>
                        {otherN || c.property_title || "Conversație"}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{timeLabel(c._lastAt || c.updated_date)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className={["truncate text-xs", unread ? "font-medium text-foreground/80" : "text-muted-foreground"].join(" ")}>
                        {c.last_message || c.property_title || "Niciun mesaj"}
                      </p>
                      {unread > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                          {unread > 9 ? "+9" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(e, c)}
                    disabled={deletingId === c.id}
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground/40 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                    aria-label="Șterge conversația"
                  >
                    {deletingId === c.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </motion.div>
              );
            })}
            {hasMore && (
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="flex w-full items-center justify-center gap-2 border-b border-border/50 bg-white py-4 text-sm font-semibold text-emerald transition hover:bg-emerald-soft dark:bg-card"
              >
                <ChevronDown className="h-4 w-4" />
                Arată mai multe ({filteredConvs.length - visibleCount} restante)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}