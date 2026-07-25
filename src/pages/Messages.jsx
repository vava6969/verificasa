import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { createNotification } from "@/lib/notifications";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send, ArrowLeft, Home } from "lucide-react";

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("c");
  const [conversations, setConversations] = useState(null);
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadConversations = async () => {
    try {
      const all = await base44.entities.Conversation.list("-updated_date", 200);
      setConversations(all.filter((c) => c.buyer_id === user.id || c.seller_id === user.id));
    } catch (e) { setConversations([]); }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadConversations();
  }, [isAuthenticated, user?.id]);

  // Reîmprospătează lista de conversații în timp real (mesaj nou sau conversație nouă)
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubM = base44.entities.Message.subscribe(() => loadConversations());
    const unsubC = base44.entities.Conversation.subscribe(() => loadConversations());
    return () => { unsubM && unsubM(); unsubC && unsubC(); };
  }, [isAuthenticated, user?.id]);

  const active = (conversations || []).find((c) => c.id === selectedId) || null;

  useEffect(() => {
    let cancelled = false;
    if (!selectedId) { setMessages(null); return; }
    (async () => {
      try {
        const list = await base44.entities.Message.filter({ conversation_id: selectedId }, "created_date", 200);
        if (!cancelled) setMessages(list);
      } catch (e) { if (!cancelled) setMessages([]); }
    })();
    // realtime: refresh on any Message change for this conversation
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === selectedId) {
        base44.entities.Message.filter({ conversation_id: selectedId }, "created_date", 200).then(setMessages).catch(() => {});
      }
    });
    return () => { cancelled = true; unsub && unsub(); };
  }, [selectedId]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        conversation_id: active.id,
        sender_id: user.id,
        sender_name: user.full_name || user.email,
        content: text.trim(),
      });
      await base44.entities.Conversation.update(active.id, { last_message: text.trim() });
      const recipient = active.buyer_id === user.id ? active.seller_id : active.buyer_id;
      if (recipient && recipient !== user.id) {
        createNotification({
          userId: recipient,
          type: "message",
          text: `Ai un mesaj nou de la ${user.full_name || user.email}.`,
          link: `/messages?c=${active.id}`,
          actorName: user.full_name || user.email,
        });
      }
      setText("");
      setMessages((m) => [...(m || []), { id: "tmp" + Date.now(), sender_id: user.id, sender_name: user.full_name, content: text.trim(), created_date: new Date().toISOString() }]);
      loadConversations();
    } catch (err) {
      toast({ title: "Eroare la trimitere", variant: "destructive" });
    } finally { setSending(false); }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const openConv = (id) => setParams({ c: id });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Mesajele mele</h1>
          <p className="text-sm text-muted-foreground">Conversațiile tale cu proprietarii și agenții.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* List */}
        <div className={`lg:col-span-1 ${selectedId ? "hidden lg:block" : ""}`}>
          <div className="rounded-2xl border border-border bg-white p-2 shadow-soft">
            {conversations === null ? (
              <div className="space-y-2 p-2"><Skeleton className="h-14 w-full rounded-xl" /><Skeleton className="h-14 w-full rounded-xl" /></div>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nicio conversație încă. Deschide un anunț și apasă „Mesaj".</p>
            ) : (
              conversations.map((c) => (
                <button key={c.id} onClick={() => openConv(c.id)} className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${selectedId === c.id ? "bg-emerald-soft" : "hover:bg-secondary/50"}`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald text-white"><MessageCircle className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-navy">{c.property_title || "Proprietate"}</span>
                    <span className="block truncate text-xs text-muted-foreground">{c.last_message || "Niciun mesaj încă"}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div className={`lg:col-span-2 ${selectedId ? "" : "hidden lg:block"}`}>
          <div className="flex h-[70vh] flex-col rounded-2xl border border-border bg-white shadow-soft">
            {!active ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <Home className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 font-heading text-lg font-semibold text-navy">Selectează o conversație</p>
                <p className="text-sm text-muted-foreground">Alege o discuție din stânga sau scrie unui proprietar din pagina unui anunț.</p>
              </div>
            ) : (
              <>
                <div className="border-b border-border p-4">
                  <button onClick={() => setParams({})} className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-navy lg:hidden">
                    <ArrowLeft className="h-3.5 w-3.5" /> Înapoi la conversații
                  </button>
                  <Link to={`/property/${active.property_id}`} className="font-heading text-base font-bold text-navy hover:text-emerald">
                    {active.property_title || "Proprietate"}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Cu: {active.buyer_id === user.id ? active.seller_name || "Proprietar" : active.buyer_name || "Cumpărător"}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 p-4">
                  {messages === null ? <p className="text-sm text-muted-foreground">Se încarcă...</p> :
                    messages.length === 0 ? <p className="text-sm text-muted-foreground">Scrie primul mesaj 👇</p> :
                    messages.map((m) => {
                      const mine = m.sender_id === user.id;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-emerald text-white" : "bg-secondary text-foreground"}`}>
                            <p>{m.content}</p>
                            <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                              {new Date(m.created_date).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={send} className="border-t border-border p-3 flex items-center gap-2">
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Scrie un mesaj..." className="flex-1 rounded-full border border-border bg-secondary/30 px-4 py-2.5 text-sm outline-none focus:border-emerald" />
                  <Button type="submit" disabled={sending || !text.trim()} className="rounded-full bg-emerald text-white">
                    {sending ? "..." : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}