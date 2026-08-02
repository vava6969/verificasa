import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Home, MapPin, Ruler, Sparkles, Camera } from "lucide-react";
import { generateUniquePropertyCode } from "@/lib/propertyCode";
import {
  EMPTY_FORM, MIN_PHOTOS, MAX_PHOTOS, buildPropertyPayload,
} from "@/lib/propertyPayload";
import StepBasics from "./StepBasics";
import StepLocation from "./StepLocation";
import StepDetails from "./StepDetails";
import StepFeatures from "./StepFeatures";
import StepPhotos from "./StepPhotos";

const STEPS = [
  { id: 0, icon: Home,     title: "Ce publici",  sub: "Tipul anunțului și titlul" },
  { id: 1, icon: MapPin,   title: "Locație",     sub: "Unde se află proprietatea" },
  { id: 2, icon: Ruler,    title: "Detalii",     sub: "Preț, spațiu, descriere" },
  { id: 3, icon: Sparkles, title: "Facilități",  sub: "Ce oferă locuința" },
  { id: 4, icon: Camera,   title: "Poze & contact", sub: "Ultimul pas" },
];

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];

export default function PropertyWizard({ onDone, onCancel }) {
  const { country } = useCountry();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = ADMIN_ROLES.includes((user?.role || "").toUpperCase());

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [chips, setChips] = useState({});
  const [facilities, setFacilities] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const imagesCount = useMemo(() => (form.images ? form.images.split(",").filter(Boolean).length : 0), [form.images]);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const existing = form.images ? form.images.split(",").filter(Boolean) : [];
      const remaining = Math.max(0, MAX_PHOTOS - existing.length);
      if (remaining === 0) {
        toast({ title: `Ai atins maximul de ${MAX_PHOTOS} poze`, variant: "destructive" });
        return;
      }
      const urls = [];
      for (const f of files.slice(0, remaining)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        urls.push(file_url);
      }
      set({ images: [...existing, ...urls].join(",") });
    } catch {
      toast({ title: "Încărcarea pozelor a eșuat", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const validateStep = (s) => {
    if (s === 0 && !form.title.trim()) return "Adaugă un titlu pentru anunț.";
    if (s === 1 && !form.city) return "Alege orașul.";
    if (s === 2) {
      if (!form.price_monthly) return "Completează prețul.";
      if (!form.surface_sqm) return "Completează suprafața.";
      if (!form.floor) return "Completează etajul.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) { toast({ title: err, variant: "destructive" }); return; }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    if (step === 0) { onCancel ? onCancel() : onDone?.(); return; }
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    for (let s = 0; s <= 2; s++) {
      const err = validateStep(s);
      if (err) { setStep(s); toast({ title: err, variant: "destructive" }); return; }
    }
    if (imagesCount < MIN_PHOTOS) { toast({ title: `Încarcă cel puțin ${MIN_PHOTOS} poze`, variant: "destructive" }); return; }
    if (!form.phone) { toast({ title: "Completează numărul de telefon", variant: "destructive" }); return; }
    if (!agreed) { toast({ title: "Acceptă termenii pentru a publica", variant: "destructive" }); return; }

    setSaving(true);
    try {
      const property_code = await generateUniquePropertyCode();
      const created = await base44.entities.Property.create(
        buildPropertyPayload({ form, chips, facilities, country, user, isAdmin, property_code })
      );
      if (!isAdmin) {
        base44.functions.invoke("NotifyAdminsOnNewProperty", {
          property_id: created.id, title: form.title, owner_name: form.owner_name || "",
        }).catch(() => {});
      }
      toast(isAdmin
        ? { title: "Anunț publicat", description: "Este vizibil acum în lista publică." }
        : { title: "Anunț trimis spre aprobare", description: "Un administrator îl va verifica în curând." });
      onDone?.();
    } catch (err) {
      toast({ title: "Salvarea a eșuat", description: err?.message || "Eroare necunoscută", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const Current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="surface-card overflow-hidden rounded-3xl">
      {/* Progress header */}
      <div className="border-b border-border/60 px-4 pb-4 pt-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-navy text-emerald">
              <Current.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald">
                Pasul {step + 1} din {STEPS.length}
              </p>
              <h2 className="font-heading text-lg font-bold text-navy dark:text-foreground">{Current.title}</h2>
            </div>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">{Current.sub}</p>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full gradient-emerald transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => s.id < step && setStep(s.id)}
              className={
                "flex-1 truncate rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition " +
                (s.id === step ? "bg-navy text-white"
                  : s.id < step ? "bg-emerald-soft text-emerald"
                  : "text-muted-foreground/50")
              }
            >
              {s.id < step ? "✓ " : ""}{s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Step body */}
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        {step === 0 && <StepBasics form={form} set={set} />}
        {step === 1 && <StepLocation form={form} set={set} country={country} />}
        {step === 2 && <StepDetails form={form} set={set} />}
        {step === 3 && <StepFeatures form={form} set={set} chips={chips} setChips={setChips} facilities={facilities} setFacilities={setFacilities} />}
        {step === 4 && <StepPhotos form={form} set={set} uploading={uploading} onFiles={handleFile} agreed={agreed} setAgreed={setAgreed} />}
      </div>

      {/* Nav */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <Button type="button" variant="outline" onClick={back} className="gap-1.5 rounded-full">
          <ArrowLeft className="h-4 w-4" /> {step === 0 ? "Renunță" : "Înapoi"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next} className="flex-1 gap-1.5 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
            Continuă <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={saving || uploading} className="flex-1 gap-1.5 rounded-full bg-emerald text-white shadow-soft hover:bg-emerald/90">
            <Check className="h-4 w-4" /> {saving ? "Se publică…" : "Publică anunțul"}
          </Button>
        )}
      </div>
    </div>
  );
}