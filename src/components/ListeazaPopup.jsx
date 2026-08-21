import React, { useEffect, useState } from "react";
import { X, CheckCircle2, Camera, ClipboardCheck, Sparkles } from "lucide-react";
import { useCountry } from "@/components/CountryContext";

export default function ListeazaPopup({ open, onClose }) {
  const { t } = useCountry();
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setClosing(false);
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    // auto-close after 30 seconds
    const timer = setTimeout(() => onClose(), 30000);
    return () => { document.removeEventListener("keydown", onEsc); document.body.style.overflow = ""; clearTimeout(timer); };
  }, [open]);

  if (!open) return null;

  const steps = [
    { icon: ClipboardCheck, title: t("li_step1_t"), desc: t("li_step1_d") },
    { icon: Camera, title: t("li_step2_t"), desc: t("li_step2_d") },
    { icon: Sparkles, title: t("li_step4_t"), desc: t("li_step4_d") },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded border border-border bg-white shadow-2xl dark:bg-card">
        <div className="relative gradient-emerald p-6 text-white">
          <button onClick={onClose} aria-label={t("li_close")} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded bg-white/20 text-white transition hover:bg-white/40">
            <X className="h-5 w-5" />
          </button>
          <h3 className="font-heading text-2xl font-bold">{t("li_title")}</h3>
          <p className="mt-1 text-sm text-white/85">{t("li_sub")}</p>
        </div>

        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded border border-border bg-secondary/30 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-emerald-soft text-emerald"><s.icon className="h-5 w-5" /></span>
                <div>
                  <p className="font-heading text-sm font-bold text-navy dark:text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald" /> {t("li_note")}
          </p>
          <button onClick={onClose} className="mt-4 w-full rounded bg-emerald py-2.5 text-sm font-bold text-white transition hover:opacity-90">{t("li_btn")}</button>
        </div>
      </div>
    </div>
  );
}