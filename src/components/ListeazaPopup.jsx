import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
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

  // Glossy app icons instead of line art — all normalised to 224x224, so a
  // fixed square box with object-contain keeps their optical size equal.
  const steps = [
    { icon: "/images/generated/icon-document-check.png", title: t("li_step1_t"), desc: t("li_step1_d") },
    { icon: "/images/generated/icon-video.png", title: t("li_step2_t"), desc: t("li_step2_d") },
    { icon: "/images/generated/icon-handshake.png", title: t("li_step4_t"), desc: t("li_step4_d") },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl dark:bg-card">
        <div className="relative bg-emerald p-6 pr-16 text-white">
          <button onClick={onClose} aria-label={t("li_close")} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40">
            <X className="h-5 w-5" />
          </button>
          <h3 className="font-heading text-2xl font-bold">{t("li_title")}</h3>
          <p className="mt-1 text-sm text-white/85">{t("li_sub")}</p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 sm:flex-col sm:items-start">
                <img src={s.icon} alt="" className="h-12 w-12 shrink-0 object-contain" />
                <div>
                  <p className="font-heading text-sm font-bold text-navy dark:text-foreground">{s.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <span className="text-emerald" aria-hidden="true">✓</span> {t("li_note")}
          </p>
          <button onClick={onClose} className="mt-4 min-h-[48px] w-full rounded-full bg-emerald px-6 text-sm font-bold text-white transition hover:bg-emerald/90">{t("li_btn")}</button>
        </div>
      </div>
    </div>
  );
}
