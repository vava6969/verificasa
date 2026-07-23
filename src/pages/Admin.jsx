import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Image as UIImage } from "@/components/ui/image";
import { ShieldAlert, Check, X, Trash2, RefreshCw, Search, Users, ShieldCheck } from "lucide-react";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];
const ROLE_OPTIONS = ["PROPRIETAR", "AGENT", "ADMIN", "SUPER_ADMIN", "SUPPORT", "user"];

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("pending");
  const [properties, setProperties] = useState(null);
  const [comments, setComments] = useState(null);
  const [audit, setAudit] = useState(null);
  const [users, setUsers] = useState(null);
  const [userSearch, setUserSearch] = useState("");

  const isAllowed = isAuthenticated && user && ADMIN_ROLES.includes((user.role || "").toUpperCase());
  const isSuper = (user?.role || "").toUpperCase() === "SUPER_ADMIN";

  const load = async () => {
    try {
      const [props, cmts, logs, usrs] = await Promise.all([
        base44.entities.Property.list("-created_date", 100),
        base44.entities.Comment.list("-created_date", 50),
        base44.entities.AuditLog.list("-created_date", 50),
        base44.entities.User.list("-created_date", 100),
      ]);
      setProperties(props); setComments(cmts); setAudit(logs); setUsers(usrs);
    } catch (e) {
      setProperties([]); setComments([]); setAudit([]); setUsers([]);
    }
  };
  useEffect(() => { if (isAllowed) load(); }, [isAllowed]);

  const log = async (action, target_type, target_id, detail) => {
    try {
      await base44.entities.AuditLog.create({
        actor_id: user.id, actor_name: user.full_name || user.email,
        actor_role: (user.role || "").toUpperCase(), action, target_type, target_id, detail: detail || "",
      });
    } catch {}
  };

  const setApproval = async (p, status) => {
    try {
      await base44.entities.Property.update(p.id, { approval_status: status });
      toast({ title: `Anunț ${status === "APPROVED" ? "aprobat" : "respins"}` });
      log(status === "APPROVED" ? "approve" : "reject", "property", p.id, p.title);
      load();
    } catch (e) { toast({ title: "Eroare", variant: "destructive" }); }
  };

  const delProperty = async (p) => {
    if (!confirm(`Ștergi definitiv „${p.title}"?`)) return;
    try {
      await base44.entities.Property.delete(p.id);
      toast({ title: "Anunț șters" });
      log("delete", "property", p.id, p.title);
      load();
    } catch (e) { toast({ title: "Eroare la ștergere", variant: "destructive" }); }
  };

  const delComment = async (c) => {
    if (!confirm("Ștergi comentariul?")) return;
    try {
      await base44.entities.Comment.delete(c.id);
      toast({ title: "Comentariu șters" });
      log("moderate", "comment", c.id, c.content?.slice(0, 40));
      load();
    } catch (e) { toast({ title: "Eroare", variant: "destructive" }); }
  };

  const changeRole = async (u, role) => {
    if (u.id === user.id && role !== user.role) { toast({ title: "Nu poți schimba propriul rol aici", variant: "destructive" }); return; }
    try {
      await base44.entities.User.update(u.id, { role });
      toast({ title: `Rol actualizat: ${role}` });
      log("role_change", "user", u.id, `${u.email} → ${role}`);
      load();
    } catch (e) { toast({ title: "Eroare la actualizare rol", variant: "destructive" }); }
  };

  const delUser = async (u) => {
    if (u.id === user.id) { toast({ title: "Nu poți șterge propriul cont", variant: "destructive" }); return; }
    if (!confirm(`Ștergi utilizatorul ${u.email}?`)) return;
    try {
      await base44.entities.User.delete(u.id);
      toast({ title: "Utilizator șters" });
      log("delete", "user", u.id, u.email);
      load();
    } catch (e) { toast({ title: "Eroare la ștergere", variant: "destructive" }); }
  };

  const verifyUser = async (u, val) => {
    try {
      await base44.entities.User.update(u.id, { is_verified: val });
      toast({ title: val ? "Utilizator verificat" : "Verificare retrasă" });
      log("verify", "user", u.id, u.email);
      load();
    } catch (e) { toast({ title: "Eroare", variant: "destructive" }); }
  };

  if (isAuthenticated && !isAllowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-3 font-heading text-2xl font-bold text-navy dark:text-foreground">Acces restricționat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Doar administratorii pot accesa acest panou.</p>
        <Button asChild className="mt-4 bg-emerald text-white"><Link to="/">Înapoi acasă</Link></Button>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const pending = (properties || []).filter((p) => p.approval_status !== "APPROVED");
  const all = properties || [];
  const filteredUsers = (users || []).filter((u) => {
    const q = userSearch.toLowerCase();
    if (!q) return true;
    return (u.email || "").toLowerCase().includes(q) || (u.full_name || "").toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-navy dark:text-foreground">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Moderează anunțuri, comentarii și utilizatori {isSuper && "· Super Admin"}</p>
        </div>
        <Button variant="outline" onClick={load} className="gap-1.5"><RefreshCw className="h-4 w-4" /> Reîncarcă</Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[["pending","În așteptare"],["all","Toate anunțurile"],["comments","Comentarii"],["users","Utilizatori"],["audit","Audit log"]].map(([k,label]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === k ? "bg-navy text-emerald" : "border border-border bg-white text-foreground/70 hover:border-emerald/50 dark:bg-card"}`}>
            {label}{k === "users" && users ? ` (${users.length})` : ""}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "audit" ? (
          <div className="space-y-2">
            {(audit || []).length === 0 ? <p className="text-sm text-muted-foreground">Nicio acțiune înregistrată.</p> :
              audit.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-white p-3 text-sm dark:bg-card">
                  <span><b className="text-navy dark:text-foreground">{a.actor_name}</b> <span className="text-muted-foreground">· {a.action} · {a.target_type}{a.detail ? ` · ${a.detail}` : ""}</span></span>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_date).toLocaleString("ro-RO")}</span>
                </div>
              ))}
          </div>
        ) : tab === "users" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Caută după nume sau email..." className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-emerald dark:bg-card" />
              </div>
            </div>
            {users === null ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />) :
            filteredUsers.length === 0 ? <p className="text-sm text-muted-foreground">Niciun utilizator găsit.</p> :
            filteredUsers.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft dark:bg-card">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald"><Users className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading font-bold text-navy dark:text-foreground">{u.full_name || u.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}{u.is_verified ? " · · Verificat ✓" : " · Neverificat"}</p>
                </div>
                <select value={u.role || "user"} onChange={(e) => changeRole(u, e.target.value)} disabled={u.id === user.id} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-emerald disabled:opacity-60 dark:bg-card">
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <Button size="sm" variant="outline" onClick={() => verifyUser(u, !u.is_verified)} className="gap-1 border-emerald/40 text-emerald hover:bg-emerald-soft">
                  <ShieldCheck className="h-3.5 w-3.5" /> {u.is_verified ? "Retrage" : "Verifică"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => delUser(u)} className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        ) : tab === "comments" ? (
          <div className="space-y-2">
            {(comments || []).length === 0 ? <p className="text-sm text-muted-foreground">Niciun comentariu.</p> :
              comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-white p-3 dark:bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm"><b className="text-navy dark:text-foreground">{c.user_name}</b> <span className="text-xs text-muted-foreground">· {c.user_role} · pe {c.property_title}</span></span>
                    <Button variant="outline" size="sm" onClick={() => delComment(c)} className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /> Șterge</Button>
                  </div>
                  <p className="mt-1 text-sm text-foreground/80">{c.content}</p>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(tab === "pending" ? pending : all).length === 0 ? (
              properties === null ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />) :
              <p className="text-sm text-muted-foreground">{tab === "pending" ? "Niciun anunț în așteptare. 🎉" : "Niciun anunț."}</p>
            ) : (tab === "pending" ? pending : all).map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-soft dark:bg-card">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {p.images?.[0] && <UIImage src={p.images[0]} fittingType="fill" className="h-full w-full" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold text-navy line-clamp-1 dark:text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.zone}, {p.city} · {p.property_type} · {p.price_monthly} € · <span className={p.approval_status === "APPROVED" ? "text-emerald font-semibold" : "text-amber-600 font-semibold"}>{p.approval_status || "PENDING"}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  {p.approval_status !== "APPROVED" && <Button size="sm" onClick={() => setApproval(p, "APPROVED")} className="gap-1 bg-emerald text-white"><Check className="h-3.5 w-3.5" /> Aprobă</Button>}
                  {p.approval_status === "APPROVED" && <Button size="sm" variant="outline" onClick={() => setApproval(p, "REJECTED")} className="gap-1 border-amber-400 text-amber-700"><X className="h-3.5 w-3.5" /> Retrage</Button>}
                  <Button size="sm" variant="outline" onClick={() => delProperty(p)} className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}