import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Image as UIImage } from "@/components/ui/image";
import {
  ShieldAlert, Check, X, Trash2, RefreshCw, Search, Users, ShieldCheck,
  Clock, ClipboardList, Building2, MessageSquare, FileText, Pencil,
  Sparkles, History, Flag, ClipboardCheck,
} from "lucide-react";
import PropertyEditForm from "@/components/PropertyEditForm";
import PropertyLogs from "@/components/PropertyLogs";
import AdminReports from "@/components/AdminReports";
import AdminResolvedReports from "@/components/AdminResolvedReports";

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
  const [inspections, setInspections] = useState(null);
  const [inquiries, setInquiries] = useState(null);
  const [reports, setReports] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [propSearch, setPropSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  const isAllowed = isAuthenticated && user && ADMIN_ROLES.includes((user.role || "").toUpperCase());
  const isSuper = (user?.role || "").toUpperCase() === "SUPER_ADMIN";

  const safe = async (fn, fallback) => { try { return await fn(); } catch { return fallback; } };
  const load = async () => {
    const [props, cmts, logs, usrs, insp, inq, reps] = await Promise.all([
      safe(() => base44.entities.Property.list("-created_date", 100), []),
      safe(() => base44.entities.Comment.list("-created_date", 50), []),
      safe(() => base44.entities.AuditLog.list("-created_date", 50), []),
      safe(() => base44.entities.User.list("-created_date", 100), []),
      safe(() => base44.entities.InspectionRequest.list("-created_date", 50), []),
      safe(() => base44.entities.Inquiry.list("-created_date", 50), []),
      safe(() => base44.entities.Report.list("-created_date", 100), []),
    ]);
    setProperties(props); setComments(cmts); setAudit(logs); setUsers(usrs);
    setInspections(insp); setInquiries(inq); setReports(reps);
  };

  useEffect(() => { if (isAllowed) load(); }, [isAllowed]);

  // Real-time: any create/update/delete on listings, comments, users,
  // inspections, inquiries, reports or audit log reloads the whole panel
  // automatically — no manual refresh needed after resolving a report,
  // approving a listing, deleting a comment, etc.
  useEffect(() => {
    if (!isAllowed) return;
    const unsubs = [];
    const names = ["Property", "Comment", "AuditLog", "User", "InspectionRequest", "Inquiry", "Report"];
    names.forEach((n) => {
      try { unsubs.push(base44.entities[n].subscribe(() => load())); } catch { /* noop */ }
    });
    return () => { unsubs.forEach((u) => { try { u && u(); } catch { /* noop */ } }); };
  }, [isAllowed]);

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
      const patch = { approval_status: status };
      if (status === "APPROVED") {
        patch.approved_by_id = user.id;
        patch.approved_by_name = user.full_name || user.email;
        patch.approved_date = new Date().toISOString();
      } else {
        patch.approved_by_id = null; patch.approved_by_name = null; patch.approved_date = null;
      }
      await base44.entities.Property.update(p.id, patch);
      toast({ title: status === "APPROVED" ? "Anunt aprobat" : "Anunt respins" });
      log(status === "APPROVED" ? "approve" : "reject", "property", p.id, p.title);
      try { base44.functions.invoke("NotifyOnPropertyDecision", { property_id: p.id, decision: status }).catch(() => {}); } catch {}
      load();
    } catch { toast({ title: "Eroare", variant: "destructive" }); }
  };

  const delProperty = async (p) => {
    if (!confirm("Stergi definitiv acest anunt?")) return;
    try {
      await base44.entities.Property.delete(p.id);
      toast({ title: "Anunt sters" });
      log("delete", "property", p.id, p.title);
      load();
    } catch { toast({ title: "Eroare la stergere", variant: "destructive" }); }
  };

  const delComment = async (c) => {
    if (!confirm("Stergi comentariul?")) return;
    try {
      await base44.entities.Comment.delete(c.id);
      toast({ title: "Comentariu sters" });
      log("moderate", "comment", c.id, c.content?.slice(0, 40));
      load();
    } catch { toast({ title: "Eroare", variant: "destructive" }); }
  };

  const changeRole = async (u, role) => {
    if (!isSuper) { toast({ title: "Doar SUPER_ADMIN poate schimba grade", variant: "destructive" }); return; }
    if (u.id === user.id && role !== user.role) { toast({ title: "Nu poti schimba propriul rol", variant: "destructive" }); return; }
    try {
      await base44.entities.User.update(u.id, { role });
      toast({ title: "Rol actualizat: " + role });
      log("role_change", "user", u.id, u.email + " to " + role);
      load();
    } catch { toast({ title: "Eroare", variant: "destructive" }); }
  };

  const delUser = async (u) => {
    if (!isSuper) { toast({ title: "Doar SUPER_ADMIN poate sterge conturi", variant: "destructive" }); return; }
    if (u.id === user.id) { toast({ title: "Nu poti sterge propriul cont", variant: "destructive" }); return; }
    if (!confirm("Stergi utilizatorul " + u.email + "?")) return;
    try {
      await base44.entities.User.delete(u.id);
      toast({ title: "Utilizator sters" });
      log("delete", "user", u.id, u.email);
      load();
    } catch { toast({ title: "Eroare", variant: "destructive" }); }
  };

  const toggleAiTour = async (p) => {
    try {
      const next = !p.ai_tour_verified;
      await base44.entities.Property.update(p.id, {
        ai_tour_verified: next,
        verification_level: next ? "video_ai" : (p.verification_level === "video_ai" ? "unverified" : p.verification_level),
      });
      toast({ title: next ? "Tur 3D activat" : "Tur 3D retras" });
      log(next ? "enable_ai_tour" : "disable_ai_tour", "property", p.id, p.title);
      load();
    } catch { toast({ title: "Eroare", variant: "destructive" }); }
  };

  const verifyUser = async (u, val) => {
    if (!val && !isSuper) { toast({ title: "Doar SUPER_ADMIN poate retrage conturi", variant: "destructive" }); return; }
    try {
      await base44.entities.User.update(u.id, { is_verified: val });
      toast({ title: val ? "Utilizator verificat" : "Verificare retrasa" });
      log("verify", "user", u.id, u.email);
      load();
    } catch { toast({ title: "Eroare", variant: "destructive" }); }
  };

  if (isAuthenticated && !isAllowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-3 font-heading text-2xl font-bold text-navy dark:text-foreground">Acces restrictionat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Doar administratorii pot accesa acest panou.</p>
        <Button asChild className="mt-4 bg-emerald text-white"><Link to="/">Inapoi acasa</Link></Button>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const pending = (properties || []).filter((p) => p.approval_status !== "APPROVED");
  const all = properties || [];
  const codeById = new Map();
  all.forEach((p) => codeById.set(p.id, p.property_code));
  const filteredUsers = (users || []).filter((u) => {
    const q = userSearch.toLowerCase();
    if (!q) return true;
    return (u.email || "").toLowerCase().includes(q) || (u.full_name || "").toLowerCase().includes(q);
  });

  const PTABS = [
    { k: "pending",            label: "In asteptare", icon: Clock,          count: pending.length,                                                 tone: "amber" },
    { k: "users",              label: "Utilizatori",  icon: Users,           count: (users || []).length,                                           tone: "emerald" },
    { k: "inspectii",          label: "Inspectii",    icon: ClipboardList,   count: (inspections || []).length,                                     tone: "emerald" },
    { k: "rapoarte",           label: "Sesizari",     icon: Flag,            count: (reports || []).filter((r) => r.status === "PENDING").length,   tone: "rose" },
    { k: "rapoarte_rezolvate", label: "Rezolvate",    icon: ClipboardCheck,  count: (reports || []).filter((r) => r.status !== "PENDING").length,   tone: "emerald" },
  ];
  const GTABS = [
    { k: "all",      label: "Toate anunturile",   icon: Building2 },
    { k: "comments", label: "Comentarii",          icon: MessageSquare },
    { k: "audit",    label: "Audit log",           icon: FileText },
    { k: "loguri",   label: "Loguri proprietate",  icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-white dark:bg-card shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy">
              <ShieldAlert className="h-5 w-5 text-emerald" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-navy dark:text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">
                Moderare anunturi{isSuper ? " · Super Admin" : ""}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={load} className="gap-1.5 rounded-full text-sm">
            <RefreshCw className="h-4 w-4" /> Reincarca
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Stat cards */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "In asteptare",  value: pending.length,                                                 cls: "text-amber-600", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-700/40" },
            { label: "Utilizatori",   value: (users || []).length,                                           cls: "text-emerald",   bg: "bg-emerald-soft border-emerald/20 dark:bg-emerald-950/30" },
            { label: "Sesizari",      value: (reports || []).filter((r) => r.status === "PENDING").length,  cls: "text-rose-600",  bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-700/40" },
            { label: "Total anunturi", value: all.length,                                                    cls: "text-navy dark:text-foreground", bg: "bg-white border-border dark:bg-card" },
          ].map((s) => (
            <div key={s.label} className={"rounded-2xl border px-4 py-3 shadow-sm " + s.bg}>
              <p className={"text-2xl font-bold font-heading " + s.cls}>{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="mb-5 rounded-2xl border border-border bg-white dark:bg-card shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Prioritare</p>
            <div className="flex flex-wrap gap-1.5">
              {PTABS.map((t) => {
                const Ico = t.icon;
                const isActive = tab === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className={"flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition " +
                      (isActive ? "bg-navy text-white shadow-sm" : "text-foreground/70 hover:bg-secondary/60")}
                  >
                    <Ico className={"h-4 w-4 " + (isActive ? "text-emerald" : t.tone === "rose" ? "text-rose-500" : t.tone === "amber" ? "text-amber-500" : "text-emerald")} />
                    {t.label}
                    {t.count > 0 && (
                      <span className={"rounded-full px-1.5 py-0.5 text-[10px] font-bold " +
                        (isActive ? "bg-white/20 text-white" :
                         t.tone === "rose" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                         t.tone === "amber" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                         "bg-emerald-soft text-emerald")}>
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mx-4 border-t border-border" />
          <div className="px-4 pt-3 pb-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Gestionare</p>
            <div className="flex flex-wrap gap-1.5">
              {GTABS.map((t) => {
                const Ico = t.icon;
                const isActive = tab === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className={"flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition " +
                      (isActive ? "bg-secondary text-foreground font-semibold" : "text-foreground/60 hover:bg-secondary/50")}
                  >
                    <Ico className="h-3.5 w-3.5" /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div>
          {tab === "inspectii" ? (
            <div className="space-y-2">
              {(inspections || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nicio solicitare de inspectie.</p>
              ) : inspections.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-white p-4 dark:bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-heading font-bold text-navy dark:text-foreground">
                        {r.name} <span className="text-xs font-normal text-muted-foreground">· {r.role}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{r.email} · {r.phone || "fara tel"}</p>
                    </div>
                    <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-semibold " +
                      (r.status === "Nou" ? "bg-blue-50 text-blue-700" :
                       r.status === "Contactat" ? "bg-mint-soft text-navy" :
                       "bg-secondary text-muted-foreground")}>
                      {r.status}
                    </span>
                  </div>
                  {r.address_or_url && <p className="mt-1 text-xs text-muted-foreground">Adresa: {r.address_or_url}</p>}
                  {r.package_interest && <p className="text-xs text-muted-foreground">Pachet: {r.package_interest}</p>}
                  {r.message && <p className="mt-1 text-sm text-foreground/80">{r.message}</p>}
                </div>
              ))}
            </div>

          ) : tab === "audit" ? (
            <div className="space-y-2">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Cauta dupa ID, autor sau actiune..."
                  className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-emerald dark:bg-card"
                />
              </div>
              {(() => {
                const as = (auditSearch || "").toLowerCase();
                const src = (audit || []).filter((a) =>
                  !as || [a.actor_name, a.action, a.target_type, a.target_id, codeById.get(a.target_id), a.detail]
                    .filter(Boolean).join(" ").toLowerCase().includes(as)
                );
                if (src.length === 0) return <p className="text-sm text-muted-foreground">Nicio actiune gasita.</p>;
                return src.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-white p-3 text-sm dark:bg-card">
                    <span>
                      <b className="text-navy dark:text-foreground">{a.actor_name}</b>
                      <span className="text-muted-foreground">
                        {" · "}{a.action}{" · "}{a.target_type}
                        {a.target_id ? " · Cod: " + (codeById.get(a.target_id) || a.target_id.slice(0, 8)) : ""}
                        {a.detail ? " · " + a.detail : ""}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(a.created_date).toLocaleString("ro-RO")}</span>
                  </div>
                ));
              })()}
            </div>

          ) : tab === "loguri" ? (
            <PropertyLogs properties={properties || []} audit={audit || []} comments={comments || []} inquiries={inquiries || []} />

          ) : tab === "rapoarte" ? (
            <AdminReports reports={(reports || []).filter((r) => r.status === "PENDING")} properties={properties || []} onReload={load} />

          ) : tab === "rapoarte_rezolvate" ? (
            <AdminResolvedReports reports={(reports || []).filter((r) => r.status !== "PENDING")} />

          ) : tab === "users" ? (
            <div className="space-y-3">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cauta dupa nume sau email..."
                  className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-emerald dark:bg-card"
                />
              </div>
              {users === null
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)
                : filteredUsers.length === 0
                ? <p className="text-sm text-muted-foreground">Niciun utilizator gasit.</p>
                : filteredUsers.map((u) => (
                  <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft dark:bg-card">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                      <Users className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading font-bold text-navy dark:text-foreground">{u.full_name || u.email}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email} · {u.is_verified ? "Verificat" : "Neverificat"}</p>
                    </div>
                    <select
                      value={u.role || "user"}
                      onChange={(e) => changeRole(u, e.target.value)}
                      disabled={u.id === user.id || !isSuper}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-emerald disabled:opacity-60 dark:bg-card"
                    >
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <Button size="sm" variant="outline" onClick={() => verifyUser(u, !u.is_verified)} className="gap-1 border-emerald/40 text-emerald hover:bg-emerald-soft" disabled={u.is_verified && !isSuper}>
                      <ShieldCheck className="h-3.5 w-3.5" /> {u.is_verified ? "Retrage" : "Verifica"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => delUser(u)} className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10" disabled={!isSuper}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
            </div>

          ) : tab === "comments" ? (
            <div className="space-y-2">
              {(comments || []).length === 0
                ? <p className="text-sm text-muted-foreground">Niciun comentariu.</p>
                : comments.map((c) => (
                  <div key={c.id} className="rounded-xl border border-border bg-white p-3 dark:bg-card">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        <b className="text-navy dark:text-foreground">{c.user_name}</b>
                        <span className="text-xs text-muted-foreground"> · {c.user_role} · pe {c.property_title}</span>
                      </span>
                      <Button variant="outline" size="sm" onClick={() => delComment(c)} className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" /> Sterge
                      </Button>
                    </div>
                    <p className="mt-1 text-sm text-foreground/80">{c.content}</p>
                  </div>
                ))}
            </div>

          ) : (
            // pending + all
            <div className="space-y-3">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={propSearch}
                  onChange={(e) => setPropSearch(e.target.value)}
                  placeholder="Cauta dupa titlu sau ID..."
                  className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-emerald dark:bg-card"
                />
              </div>
              {(() => {
                const ps = (propSearch || "").toLowerCase();
                const src = (tab === "pending" ? pending : all).filter(
                  (p) => !ps || (p.title || "").toLowerCase().includes(ps) || (p.id || "").toLowerCase().includes(ps)
                );
                if (src.length === 0) {
                  return properties === null
                    ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
                    : <p className="text-sm text-muted-foreground">{tab === "pending" ? "Niciun anunt in asteptare." : "Niciun anunt gasit."}</p>;
                }
                return src.map((p) => {
                  if (editingId === p.id) {
                    return <PropertyEditForm key={p.id} property={p} isAdmin onDone={() => { setEditingId(null); load(); }} />;
                  }
                  return (
                    <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-soft dark:bg-card">
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                        {p.images?.[0] && <UIImage src={p.images[0]} fittingType="fill" className="h-full w-full" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-heading font-bold text-navy line-clamp-1 dark:text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.zone}, {p.city} · {p.property_type} · {p.price_monthly}
                          {" · "}
                          <span className={p.approval_status === "APPROVED" ? "font-semibold text-emerald" : "font-semibold text-amber-600"}>
                            {p.approval_status || "PENDING"}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                          Cod: <span className="select-all font-mono font-semibold text-foreground/60">{p.property_code || p.id}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingId(p.id)} className="gap-1 border-emerald/40 text-emerald hover:bg-emerald-soft">
                          <Pencil className="h-3.5 w-3.5" /> Editeaza
                        </Button>
                        {p.approval_status !== "APPROVED" && (
                          <Button size="sm" onClick={() => setApproval(p, "APPROVED")} className="gap-1 bg-emerald text-white">
                            <Check className="h-3.5 w-3.5" /> Aproba
                          </Button>
                        )}
                        {p.approval_status === "APPROVED" && (
                          <Button size="sm" variant="outline" onClick={() => setApproval(p, "REJECTED")} className="gap-1 border-amber-400 text-amber-700">
                            <X className="h-3.5 w-3.5" /> Retrage
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => toggleAiTour(p)}
                          className={"gap-1 " + (p.ai_tour_verified ? "border-emerald bg-emerald text-white hover:bg-emerald/90" : "border-emerald/40 text-emerald hover:bg-emerald-soft")}>
                          <Sparkles className="h-3.5 w-3.5" /> {p.ai_tour_verified ? "Tur 3D" : "+ Tur 3D"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => delProperty(p)} className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}