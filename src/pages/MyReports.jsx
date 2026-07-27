import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag } from "lucide-react";

const STATUS_TONE = {
  PENDING: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-emerald-soft text-emerald",
  REJECTED: "bg-rose-50 text-rose-600",
};
const STATUS_LABEL = { PENDING: "În așteptare", RESOLVED: "Rezolvat", REJECTED: "Respins" };

// "Rapoartele mele" — a user sees the history + status of reports they filed.
// Anonymous reports (filed while logged out) are not listed here.
export default function MyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState(null);

  useEffect(() => {
    (async () => {
      if (!user?.id) { setReports([]); return; }
      try {
        const list = await base44.entities.Report.filter({ reporter_user_id: user.id }, "-created_date", 100);
        setReports(list || []);
      } catch { setReports([]); }
    })();
  }, [user?.id]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-navy dark:text-foreground">Rapoartele mele</h1>
      <p className="mt-1 text-sm text-muted-foreground">Istoricul sesizărilor trimise de tine și starea lor.</p>

      <div className="mt-6 space-y-3">
        {reports === null ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-10 text-center">
            <Flag className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">Nu ai trimis nicio sesizare încă.</p>
          </div>
        ) : reports.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-white p-4 shadow-soft dark:bg-card">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-heading font-bold text-navy dark:text-foreground">
                <Flag className="h-4 w-4 text-rose-500" /> {r.reason}
              </p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[r.status] || "bg-secondary"}`}>
                {STATUS_LABEL[r.status] || r.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {r.target_type === "comment" ? "Comentariu" : "Anunț"}:{" "}
              {r.target_type === "property" ? (
                <Link to={`/property/${r.target_id}`} className="font-semibold text-emerald hover:underline">
                  {r.target_title || "vezi anunț"}
                </Link>
              ) : (
                <span className="font-mono">{(r.target_title || "").slice(0, 48)}</span>
              )}
            </p>
            {r.details && <p className="mt-1 text-sm text-foreground/80">{r.details}</p>}
            <p className="mt-1 text-[11px] text-muted-foreground">Trimis: {new Date(r.created_date).toLocaleString("ro-RO")}</p>
            {r.resolution_note && (
              <p className="mt-1 rounded-lg bg-emerald-soft/50 px-2 py-1 text-xs text-foreground/70">
                <b>Răspuns admin:</b> {r.resolution_note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}