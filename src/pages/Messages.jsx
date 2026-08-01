import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { createNotification } from "@/lib/notifications";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle, Send, ArrowLeft, Search, MoreVertical, Check, CheckCheck, Trash2, RefreshCw,
} from "lucide-react";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name[0].toUpperCase();
}

function timeLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return "acum";
  if (diff < 3600) return Math.floor(diff / 60) + " min";
  if (diff < 86400) return d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-rose-500", "bg-amber-500", "bg-teal-500", "bg-indigo-500", "bg-pink-500",
];
function avatarColor(id) {
  if (!id) return AVATAR_COLORS[0];
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("c");
  const [conversations, setConversations] = useState(null);
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [convSearch, setConvSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  const loadConversations = async () => {
    try {
      const [all, allMsgs] = await Promise.all([
        base44.entities.Conversation.list("-updated_date", 200),
        base44.entities.Message.list("-created_date", 500).catch(() => []),
      ]);
      const mine = all.filter((c) => c.buyer_id === user.id || c.seller_id === user.id);
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
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubM = base44.entities.Message.subscribe(() => loadConversations());
    const unsubC = base44.entities.Conversation.subscribe(() => loadConversations());
    return () => { try { unsubM?.(); } catch {} try { unsubC?.(); } catch {} };
  }, [isAuthenticated, user?.id]);

  const active = (conversations || []).find((c) => c.id === selectedId) || null;

  const loadMessages = async (convId) => {
    try {
      const list = await base44.entities.Message.filter({ conversation_id: convId }, "created_date", 500);
      setMessages(list);
      const incoming = list.filter((m) => m.sender_id !== user.id && !m.read_at);
      if (incoming.length) {
        const now = new Date().toISOString();
        await Promise.all(incoming.map((m) => base44.entities.Message.update(m.id, { read_at: now }).catch(() => {})));
        const refreshed = await base44.entities.Message.filter({ conversation_id: convId }, "created_date", 500).catch(() => list);
        setMessages(refreshed);
        loadConversations();
      }
    } catch { setMessages([]); }
  };

  useEffect(() => {
    let cancelled = false;
    if (!selectedId) { setMessages(null); return; }
    loadMessages(selectedId);
    const unsub = base44.entities.Message.subscribe((event) => {
      if (cancelled) return;
      if (event?.data?.conversation_id === selectedId) loadMessages(selectedId);
    });
    return () => { cancelled = true; try { unsub?.(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true);
    const content = text.trim();
    try {
      await base44.entities.Message.create({
        conversation_id: active.id,
        sender_id: user.id,
        sender_name: user.full_name || user.email,
        content,
      });
      await base44.entities.Conversation.update(active.id, { last_message: content });
      const recipient = active.buyer_id === user.id ? active.seller_id : active.buyer_id;
      if (recipient && recipient !== user.id) {
        createNotification({
          userId: recipient,
          type: "message",
          text: "Ai un mesaj nou de la " + (user.full_name || user.email) + ".",
          link: "/messages?c=" + active.id,
          actorName: user.full_name || user.email,
        });
      }
      setText("");
      loadConversations();
    } catch {
      toast({ title: "Eroare la trimitere", variant: "destructive" });
    } finally { setSending(false); }
  };

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
      if (selectedId) loadMessages(selectedId);
    } catch { toast({ title: "Eroare", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const deleteConversation = async (conv) => {
    const other = conv.buyer_id === user.id ? conv.seller_name : conv.buyer_name;
    if (!confirm(`Ștergi conversația cu ${other}? Mesajele vor fi șterse definitiv.`)) return;
    setBusy(true);
    try {
      await base44.entities.Message.deleteMany({ conversation_id: conv.id }).catch(() => {});
      await base44.entities.Conversation.delete(conv.id);
      toast({ title: "Conversație ștearsă" });
      setParams({});
      loadConversations();
    } catch { toast({ title: "Eroare la ștergere", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const openConv = (id) => setParams({ c: id });
  const backToInbox = () => setParams({});

  const filteredConvs = (conversations || []).filter((c) => {
    const q = convSearch.toLowerCase();
    if (!q) return true;
    return (
      (c.property_title || "").toLowerCase().includes(q) ||
      (c.buyer_name || "").toLowerCase().includes(q) ||
      (c.seller_name || "").toLowerCase().includes(q)
    );
  });

  const otherName = active
    ? active.buyer_id === user?.id
      ? active.seller_name || "Proprietar"
      : active.buyer_name || "Cumpărător"
    : null;

  const totalUnread = (conversations || []).reduce((acc, c) => acc + (c._unread || 0), 0);

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-2xl flex-col overflow-hidden bg-[#f4f6f9] dark:bg-background lg:h-[calc(100vh-3.5rem)]">
      {!active ? (
        /* ── INBOX ─────────────────────────── */
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3 dark:bg-card">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-bold text-navy dark:text-foreground">Mesaje</h1>
              {totalUnread > 0 && <span className="rounded-full bg-emerald px-2 py-0.5 text-[10px] font-bold text-white">{totalUnread}</span>}
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

          <div className="px-3 py-2 bg-white dark:bg-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                placeholder="Caută conversație..."
                className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:border-emerald dark:bg-card"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            {conversations === null ? (
              <div className="space-y-1 px-2 py-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-6">
                <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {convSearch ? "Nicio conversație găsită." : "Nicio conversație încă. Deschide un anunț și apasă Mesaj."}
                </p>
              </div>
            ) : (
              filteredConvs.map((c) => {
                const isSel = selectedId === c.id;
                const otherN = c.buyer_id === user?.id ? c.seller_name : c.buyer_name;
                const color = avatarColor(c.id);
                const unread = c._unread || 0;
                return (
                  <button
                    key={c.id}
                    onClick={() => openConv(c.id)}
                    className={[
                      "flex w-full items-center gap-3 border-b border-border/50 bg-white px-4 py-3 text-left transition-colors hover:bg-secondary/40 dark:bg-card",
                      isSel && "bg-emerald/10",
                    ].filter(Boolean).join(" ")}
                  >
                    <span className={["flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", color].join(" ")}>
                      {initials(otherN || c.property_title || "?")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={["truncate text-sm", unread ? "font-bold text-navy dark:text-foreground" : "font-semibold text-navy dark:text-foreground"].join(" ")}>
                          {otherN || c.property_title || "Conversație"}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{timeLabel(c._lastAt || c.updated_date)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p className={["truncate text-xs", unread ? "font-medium text-foreground/80" : "text-muted-foreground"].join(" ")}>
                          {c.last_message || c.property_title || "Niciun mesaj"}
                        </p>
                        {unread > 0 && (
                          <span className="ml-auto shrink-0 rounded-full bg-emerald px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ── CHAT THREAD ──────────────────── */
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-border bg-white px-3 py-2.5 shadow-sm dark:bg-card sm:px-4">
            <button
              onClick={backToInbox}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary/60"
              aria-label="Înapoi la inbox"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className={["flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", avatarColor(active.id)].join(" ")}>
              {initials(otherName || "?")}
            </span>
            <div className="min-w-0 flex-1">
              <Link
                to={"/property/" + active.property_id}
                className="block truncate font-heading text-base font-bold text-navy hover:text-emerald dark:text-foreground"
              >
                {active.property_title || "Proprietate"}
              </Link>
              <p className="truncate text-xs text-muted-foreground">cu {otherName}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary/60" aria-label="Opțiuni conversație">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={markAllRead} disabled={busy} className="gap-2">
                  <CheckCheck className="h-4 w-4 text-emerald" /> Marchează toate ca citite
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteConversation(active)}
                  disabled={busy}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Șterge conversația
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-4">
            {messages === null ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <p className="text-sm text-muted-foreground">Niciun mesaj. Fii primul care scrie!</p>
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.sender_id === user.id;
                const readTitle = m.read_at
                  ? `Văzut la ${new Date(m.read_at).toLocaleString("ro-RO")}`
                  : "Trimis · încă nu a fost văzut";
                return (
                  <div key={m.id} className={"flex gap-2 " + (mine ? "justify-end" : "justify-start")}>
                    {!mine && (
                      <span className={["flex h-7 w-7 shrink-0 self-end items-center justify-center rounded-full text-[11px] font-bold text-white", avatarColor(active.id)].join(" ")}>
                        {initials(m.sender_name || "?")}
                      </span>
                    )}
                    <div className={"flex max-w-[82%] flex-col gap-0.5 sm:max-w-[75%] " + (mine ? "items-end" : "items-start")}>
                      <div className={[
                        "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm sm:px-4",
                        mine ? "rounded-br-sm bg-emerald text-white" : "rounded-bl-sm bg-white text-foreground dark:bg-card",
                      ].join(" ")}>
                        {m.content}
                      </div>
                      <div className={"flex items-center gap-1 px-1 " + (mine ? "flex-row-reverse" : "flex-row")}>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(m.created_date).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {mine && (
                          m.read_at ? (
                            <span title={readTitle} className="text-emerald"><CheckCheck className="h-3.5 w-3.5" /></span>
                          ) : (
                            <span title={readTitle} className="text-muted-foreground"><Check className="h-3.5 w-3.5" /></span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={send}
            className="flex items-center gap-2 border-t border-border bg-white px-3 py-2.5 dark:bg-card sm:px-4 sm:py-3"
            style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Scrie un mesaj..."
              className="flex-1 rounded-full border border-border bg-background px-4 py-3 text-base outline-none focus:border-emerald dark:bg-card"
            />
            <Button
              type="submit"
              disabled={sending || !text.trim()}
              className="h-12 w-12 shrink-0 rounded-full bg-emerald p-0 text-white shadow-md hover:bg-emerald/90 disabled:opacity-50"
              aria-label="Trimite"
            >
              {sending ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}