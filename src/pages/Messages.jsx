import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { createNotification } from "@/lib/notifications";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send, ArrowLeft, Search, MoreVertical } from "lucide-react";

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
  "bg-blue-500","bg-violet-500","bg-rose-500","bg-amber-500","bg-teal-500","bg-indigo-500","bg-pink-500",
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
  const bottomRef = useRef(null);

  const loadConversations = async () => {
    try {
      const all = await base44.entities.Conversation.list("-updated_date", 200);
      setConversations(all.filter((c) => c.buyer_id === user.id || c.seller_id === user.id));
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
    return () => { unsubM?.(); unsubC?.(); };
  }, [isAuthenticated, user?.id]);

  const active = (conversations || []).find((c) => c.id === selectedId) || null;

  useEffect(() => {
    let cancelled = false;
    if (!selectedId) { setMessages(null); return; }
    (async () => {
      try {
        const list = await base44.entities.Message.filter({ conversation_id: selectedId }, "created_date", 200);
        if (!cancelled) setMessages(list);
      } catch { if (!cancelled) setMessages([]); }
    })();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === selectedId) {
        base44.entities.Message.filter({ conversation_id: selectedId }, "created_date", 200)
          .then(setMessages).catch(() => {});
      }
    });
    return () => { cancelled = true; unsub?.(); };
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
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
      setMessages((m) => [
        ...(m || []),
        { id: "tmp" + Date.now(), sender_id: user.id, sender_name: user.full_name, content, created_date: new Date().toISOString() },
      ]);
      loadConversations();
    } catch {
      toast({ title: "Eroare la trimitere", variant: "destructive" });
    } finally { setSending(false); }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const openConv = (id) => setParams({ c: id });

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
      : active.buyer_name || "Cumparator"
    : null;

  return (
    <div className="flex overflow-hidden bg-[#f4f6f9] dark:bg-background" style={{ height: "calc(100vh - 64px)" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside
        className={[
          "flex flex-col border-r border-border bg-white dark:bg-card",
          "w-full lg:w-[340px]",
          selectedId ? "hidden lg:flex" : "flex",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h1 className="font-heading text-xl font-bold text-navy dark:text-foreground">Mesaje</h1>
          <button className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary/60">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="Cauta conversatie..."
              className="w-full rounded-full border border-border bg-secondary/40 py-2 pl-9 pr-4 text-sm outline-none focus:border-emerald"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations === null ? (
            <div className="space-y-1 px-2 py-2">
              {[1,2,3,4].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-6">
              <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {convSearch ? "Nicio conversatie gasita." : "Nicio conversatie inca. Deschide un anunt si apasa Mesaj."}
              </p>
            </div>
          ) : (
            filteredConvs.map((c) => {
              const isActive = selectedId === c.id;
              const otherN = c.buyer_id === user?.id ? c.seller_name : c.buyer_name;
              const color = avatarColor(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => openConv(c.id)}
                  className={[
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-l-4",
                    isActive
                      ? "bg-emerald/10 border-emerald"
                      : "border-transparent hover:bg-secondary/40",
                  ].join(" ")}
                >
                  <span className={["flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", color].join(" ")}>
                    {initials(otherN || c.property_title || "?")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-sm font-semibold text-navy dark:text-foreground">
                        {otherN || c.property_title || "Conversatie"}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{timeLabel(c.updated_date)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.last_message || c.property_title || "Niciun mesaj"}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── CHAT THREAD ─────────────────────────────────────────── */}
      <main className={["flex flex-1 flex-col", selectedId ? "flex" : "hidden lg:flex"].join(" ")}>
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10">
              <MessageCircle className="h-8 w-8 text-emerald" />
            </div>
            <p className="font-heading text-lg font-bold text-navy dark:text-foreground">Selecteaza o conversatie</p>
            <p className="max-w-xs text-sm text-muted-foreground">Alege din lista din stanga sau scrie unui proprietar din pagina unui anunt.</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 border-b border-border bg-white dark:bg-card px-4 py-3 shadow-sm">
              <button
                onClick={() => setParams({})}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary/60 lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", avatarColor(active.id)].join(" ")}>
                {initials(otherName || "?")}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  to={"/property/" + active.property_id}
                  className="block truncate font-heading text-base font-bold text-navy hover:text-emerald dark:text-foreground"
                >
                  {active.property_title || "Proprietate"}
                </Link>
                <p className="text-xs text-muted-foreground">cu {otherName}</p>
              </div>
              <button className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary/60">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
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
                  return (
                    <div key={m.id} className={"flex gap-2 " + (mine ? "justify-end" : "justify-start")}>
                      {!mine && (
                        <span className={["flex h-7 w-7 shrink-0 self-end items-center justify-center rounded-full text-[11px] font-bold text-white", avatarColor(active.id)].join(" ")}>
                          {initials(m.sender_name || "?")}
                        </span>
                      )}
                      <div className={"flex max-w-[72%] flex-col gap-0.5 " + (mine ? "items-end" : "items-start")}>
                        <div className={[
                          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                          mine
                            ? "rounded-br-sm bg-emerald text-white"
                            : "rounded-bl-sm bg-white text-foreground dark:bg-card",
                        ].join(" ")}>
                          {m.content}
                        </div>
                        <span className="px-1 text-[10px] text-muted-foreground">
                          {new Date(m.created_date).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={send} className="flex items-center gap-3 border-t border-border bg-white dark:bg-card px-4 py-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Scrie un mesaj..."
                className="flex-1 rounded-full border border-border bg-secondary/30 px-4 py-2.5 text-sm outline-none focus:border-emerald"
              />
              <Button
                type="submit"
                disabled={sending || !text.trim()}
                className="h-10 w-10 rounded-full bg-emerald p-0 text-white shadow-md hover:bg-emerald/90 disabled:opacity-50"
              >
                {sending
                  ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}