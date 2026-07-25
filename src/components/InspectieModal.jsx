import React, { useEffect, useState } from "react";
import { X, ShieldCheck, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useCountry } from "@/components/CountryContext";

export default function InspectieModal({ open, onClose }) {
  const { t } = useCountry();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Proprietar", address_or_url: "", package_interest: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onEsc); document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast({ title: t("ins_required"), variant: "destructive" }); return; }
    setSending(true);
    try {
      await base44.entities.InspectionRequest.create({ ...form, status: "Nou" });
      toast({ title: t("ins_sent_t"), description: t("ins_sent_d") });
      setForm({ name: "", email: "", phone: "", role: "Proprietar", address_or_url: "", package_interest: "", message: "" });
      onClose();
    } catch (err) {
      toast({ title: t("ins_err"), variant: "destructive" });
    } finally { setSending(false); }
  };

  const inputCls = "w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm outline-none focus:border-emerald";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-white shadow-2xl dark:bg-card">
        <div className="gradient-navy p-6 text-white">
          <button onClick={onClose} aria-label={t("ins_close")} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald/20 text-emerald"><ShieldCheck className="h-6 w-6" /></span>
            <div>
              <h3 className="font-heading text-xl font-bold">{t("ins_title")}</h3>
              <p className="text-sm text-white/70">{t("ins_sub")}</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t("ins_ph_name")} className={inputCls} required />
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder={t("ins_ph_email")} className={inputCls} required />
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder={t("ins_ph_phone")} className={inputCls} />
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inputCls}>
              <option value="Proprietar">{t("ins_role_owner")}</option>
              <option value="Chiriaș/Cumpărător">{t("ins_role_tenant")}</option>
              <option value="Agent">{t("ins_role_agent")}</option>
            </select>
          </div>
          <input value={form.address_or_url} onChange={(e) => setForm((f) => ({ ...f, address_or_url: e.target.value }))} placeholder={t("ins_ph_addr")} className={inputCls} />
          <input value={form.package_interest} onChange={(e) => setForm((f) => ({ ...f, package_interest: e.target.value }))} placeholder={t("ins_ph_pkg")} className={inputCls} />
          <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={3} placeholder={t("ins_ph_msg")} className={inputCls} />
          <button type="submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-xl gradient-mint py-3 font-bold text-navy shadow-soft transition hover:opacity-90 disabled:opacity-60">
            <Send className="h-4 w-4" /> {sending ? t("ins_sending") : t("ins_btn")}
          </button>
          <p className="text-center text-[11px] text-muted-foreground">{t("ins_footer")}</p>
        </form>
      </div>
    </div>
  );
}