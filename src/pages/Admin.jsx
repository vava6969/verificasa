import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Image as UIImage } from "@/components/ui/image";
import { ShieldAlert, Check, X, Trash2, RefreshCw } from "lucide-react";

// Admin panel. Accessible only to ADMIN and SUPER_ADMIN roles.
const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("pending");
  const [properties, setProperties] = useState(null);
  const [comments, setComments] = useState(null);
  const [audit, setAudit] = useState(null);

  const isAllowed = isAuthenticated && user && ADMIN_ROLES.includes((user.role || "").toUpperCase());
  const isSuper = (user?.role || "").toUpperCase() === "SUPER_ADMIN";

  const load = async () => {
    try {
      const [props, cmts, logs] = await Promise.all([
        base44.entities.Property.list("-created_date", 100),
        base44.entities.Comment.list("-created_date", 50),
        base44.entities.AuditLog.list("-created_date", 50),
      ]);
      setProperties(props);
      setComments(cmts);
      setAudit(logs);
    } catch (e) {
      setProperties([]); setComments([]); setAudit([]);
    }
  };
  useEffect(() => { if (isAllowed) load(); }, [isAllowed]);

  const log = async (action, target_type, target_id, detail) => {
    try {
      await base44.entities.AuditLog.create({
        actor_id: user.id,
        actor_name: user.full_name || user.email,
        actor_role: (user.role || "").toUpperCase(),
        action, target_type, target_id, detail: detail || "",
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

  if (isAuthenticated && !isAllowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-3 font-heading text-2xl font-bold text-navy">Acces restricționat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Doar administratorii pot accesa acest panou.</p>
        <Button asChild className="mt-4 bg-emerald text-white"><Link to="/">Înapoi acasă</Link></Button>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const pending = (properties || []).filter((p) => p.approval_status !== "APPROVED");
  const all = properties || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-navy">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Moderează anunțuri și comentarii {isSuper && "· Super Admin"}</p>
        </div>
        <Button variant="outline" onClick={load} className="gap-1.5"><RefreshCw className="h-4 w-4" /> Reîncarcă</Button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[["pending", "În așteptare"], ["all", "Toate anunțurile"], ["comments", "Comentarii"], ["audit", "Audit log"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === k ? "bg-navy text-emerald" : "border border-border bg-white text-foreground/70 hover:border-emerald/50"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "audit" ? (
          <div className="space-y-2">
            {(audit || []).length === 0 ? <p className="text-sm text-muted-foreground">Nicio acțiune înregistrată.</p> :
              audit.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-white p-3 text-sm">
                  <span><b className="text-navy">{a.actor_name}</b> <span className="text-muted-foreground">· {a.action} · {a.target_type}</span></span>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_date).toLocaleString("ro-RO")}</span>
                </div>
              ))}
          </div>
        ) : tab === "comments" ? (
          <div className="space-y-2">
            {(comments || []).length === 0 ? <p className="text-sm text-muted-foreground">Niciun comentariu.</p> :
              comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm"><b className="text-navy">{c.user_name}</b> <span className="text-xs text-muted-foreground">· {c.user_role} · pe {c.property_title}</span></span>
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
              <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-soft">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {p.images?.[0] && <UIImage src={p.images[0]} fittingType="fill" className="h-full w-full" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold text-navy line-clamp-1">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.zone}, {p.city} · {p.property_type} · {p.price_monthly} € · <span className={p.approval_status === "APPROVED" ? "text-emerald font-semibold" : "text-amber-600 font-semibold"}>{p.approval_status || "PENDING"}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  {p.approval_status !== "APPROVED" && (
                    <Button size="sm" onClick={() => setApproval(p, "APPROVED")} className="gap-1 bg-emerald text-white"><Check className="h-3.5 w-3.5" /> Aprobă</Button>
                  )}
                  {p.approval_status === "APPROVED" && (
                    <Button size="sm" variant="outline" onClick={() => setApproval(p, "REJECTED")} className="gap-1 border-amber-400 text-amber-700"><X className="h-3.5 w-3.5" /> Retrage</Button>
                  )}
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