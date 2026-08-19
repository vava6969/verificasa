import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Image as UIImage } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera, Eye, MessageSquare, FileText, Plus, Download,
} from "lucide-react";
import OwnerCharts from "@/components/OwnerCharts";
import PropertyWizard from "@/components/postproperty/PropertyWizard";

// Sanitizează intrările telefon la doar cifre (opțional "+" la început pentru internațional).
const onlyPhoneDigits = (v) => {
  const clean = String(v || "").replace(/[^0-9+]/g, "");
  if (clean.startsWith("+")) return "+" + clean.slice(1).replace(/\+/g, "");
  return clean.replace(/\+/g, "");
};
const only_digits = (v, max) => String(v || "").replace(/[^0-9]/g, "").slice(0, max ?? 4);

const MAX_PHOTOS = 20;
const MIN_PHOTOS = 3;

export default function Owner() {
  const { country, t, lang } = useCountry();
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  // Auto-open the form when the user came from a "Adaugă Anunț" link with ?nou=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("nou") === "1") setShowForm(true);
  }, []);

  // Smooth-scroll to the form whenever it becomes visible.
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  const load = async () => {
    if (!user?.id) return;
    try {
      const [ps, inq] = await Promise.all([
        base44.entities.Property.filter({ created_by_id: user.id }, "-created_date", 50),
        base44.entities.Inquiry.list("-created_date", 50),
      ]);
      setProperties(ps);
      setInquiries(inq);
    } catch (e) {
      setProperties([]);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const totalViews = (properties || []).reduce((a, p) => a + (p.views_count || 0), 0);

  const STAT_CARDS = [
    { icon: FileText, label: t("s_active"), value: properties?.length ?? "—" },
    { icon: Eye, label: "Total Vizionări Anunțuri", value: totalViews },
    { icon: MessageSquare, label: t("s_inq"), value: inquiries.length },
  ];

  return (
    <div className="bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-navy">{t("owner_h")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("owner_sub")}</p>
          </div>
          <Button onClick={() => setShowForm((s) => !s)} className="gradient-mint text-navy shadow-soft hover:opacity-90">
            <Plus className="h-4 w-4" /> {t("owner_add")}
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="surface-card rounded-xl p-2.5 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-soft sm:h-10 sm:w-10">
                  <s.icon className="h-4 w-4 text-emerald sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-lg font-bold leading-none text-navy sm:text-2xl">{s.value}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <OwnerCharts ownerId={user?.id} lang={lang} />

        {showForm && (
          <div ref={formRef}>
            <NewPropertyForm onDone={() => { setShowForm(false); load(); }} />
          </div>
        )}

        {/* PROPERTIES */}
        <div className="mt-8">
          <h2 className="font-heading text-xl font-bold text-navy">{t("my_props")}</h2>
          {properties === null ? (
            <div className="mt-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
          ) : properties.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border py-16 text-center">
              <Camera className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">{t("no_props")}</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {properties.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-soft">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {p.images?.[0] ? <UIImage src={p.images[0]} fittingType="fill" className="h-full w-full" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-bold text-navy line-clamp-1">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.zone}, {p.city} · {p.property_type}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground"><Eye className="h-3.5 w-3.5" /> {p.views_count || 0}</span>
                    <span className={`flex items-center gap-1 ${p.ai_video_url ? "text-mint" : "text-muted-foreground"}`}>AI {p.ai_video_url ? t("ai_active") : t("ai_none")}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.approval_status === "APPROVED" ? "bg-mint-soft text-navy" : "bg-amber-100 text-amber-700"}`}>{p.approval_status === "APPROVED" ? "Aprobat" : "În așteptare"}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.status === "Activ" ? "bg-mint-soft text-navy" : "bg-secondary text-muted-foreground"}`}>{p.status}</span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" /> {t("contract_pdf")}</Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INQUIRIES */}
        {inquiries.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-xl font-bold text-navy">{t("inq_title")}</h2>
            <div className="mt-4 space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="rounded-2xl border border-border bg-white p-4 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-heading font-bold text-navy">{inq.name} <span className="text-xs font-normal text-muted-foreground">— {inq.property_title}</span></p>
                      <p className="text-xs text-muted-foreground">{inq.email} · {inq.phone || t("inq_no_phone")}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${inq.status === "Nou" ? "bg-blue-50 text-blue-700" : inq.status === "Calificat" ? "bg-mint-soft text-navy" : inq.status === "Vizionare programată" ? "bg-amber-50 text-amber-700" : "bg-secondary text-muted-foreground"}`}>{inq.status}</span>
                  </div>
                  {(inq.occupation || inq.estimated_income) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      {inq.occupation && <span>{t("inq_occupation")} {inq.occupation}</span>}
                      {inq.estimated_income && <span>💰 {t("inq_income")} {inq.estimated_income}</span>}
                      {inq.move_date && <span>📅 {t("inq_move")} {new Date(inq.move_date).toLocaleDateString("ro-RO")}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Kept as a named export for existing imports — the listing flow is now the
// step-by-step wizard.
export function NewPropertyForm({ onDone, onCancel }) {
  return (
    <div className="mt-6">
      <PropertyWizard onDone={onDone} onCancel={onCancel} />
    </div>
  );
}