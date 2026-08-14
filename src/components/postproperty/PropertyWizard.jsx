import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { ArrowLeft, ArrowRight, Home, MapPin, Ruler, Sparkles, Camera } from "lucide-react";
import confetti from "canvas-confetti";
import { generateUniquePropertyCode } from "@/lib/propertyCode";
import { uploadPhotos } from "@/lib/imageUpload";
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
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    owner_name: user?.full_name || "",
    phone: user?.phone || "",
    whatsapp_phone: user?.whatsapp_phone || "",
  });
  const [chips, setChips] = useState({});
  const [facilities, setFacilities] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const publishRef = useRef(null);

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
      const urls = await uploadPhotos(files, remaining);
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

  // Jump to the top after the new step renders (instant, so it can't be
  // interrupted mid-animation by the layout change).
  const scrollTop = () => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    });
  };

  const next = () => {
    const err = validateStep(step);
    if (err) { toast({ title: err, variant: "destructive" }); return; }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    scrollTop();
  };
  const back = () => {
    if (step === 0) { onCancel ? onCancel() : onDone?.(); return; }
    setStep((s) => s - 1);
    scrollTop();
  };

  const handlePublish = async () => {
    for (let s = 0; s <= 2; s++) {
      const err = validateStep(s);
      if (err) { setStep(s); toast({ title: err, variant: "destructive" }); throw new Error(err); }
    }
    if (imagesCount < MIN_PHOTOS) { toast({ title: `Încarcă cel puțin ${MIN_PHOTOS} poze`, variant: "destructive" }); throw new Error("photos"); }
    if (!form.phone) { toast({ title: "Completează numărul de telefon", variant: "destructive" }); throw new Error("phone"); }
    if (!agreed) { toast({ title: "Acceptă termenii pentru a publica", variant: "destructive" }); throw new Error("terms"); }

    const property_code = await generateUniquePropertyCode();
    const created = await base44.entities.Property.create(
      buildPropertyPayload({ form, chips, facilities, country, user, isAdmin, property_code })
    );
    if (!isAdmin) {
      base44.functions.invoke("NotifyAdminsOnNewProperty", {
        property_id: created.id, title: form.title, owner_name: form.owner_name || "",
      }).catch(() => {});
    }
    base44.functions.invoke("ComputeTrustScore", { property_id: created.id }).catch(() => {});
    toast(isAdmin
      ? { title: "Anunț publicat", description: "Este vizibil acum în lista publică." }
      : { title: "Anunț trimis spre aprobare", description: "Un administrator îl va verifica în curând." });

    // Confetti bursting from the publish button.
    const el = publishRef.current;
    const origin = el
      ? { x: (el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2) / window.innerWidth, y: (el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2) / window.innerHeight }
      : { y: 0.85 };
    const colors = ["#00A859", "#C5A059", "#1B222C", "#E8ECF2"];
    confetti({ particleCount: 110, spread: 78, startVelocity: 42, origin, colors });
    setTimeout(() => confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: origin.y }, colors }), 120);
    setTimeout(() => confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: origin.y }, colors }), 120);

    // Let the success state show, then leave.
    await new Promise((r) => setTimeout(r, 1500));
    onDone?.();
  };

  const Current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="surface-card overflow-hidden rounded-3xl">
      {/* Progress header */}
      <div className="border-b border-border/60 px-4 pb-4 pt-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-deep shadow-soft">
              <span className="absolute inset-0 bg-gradient-to-br from-emerald/25 to-transparent" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={step}
                  initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative flex items-center justify-center text-emerald"
                >
                  <Current.icon className="h-5 w-5" />
                </motion.span>
              </AnimatePresence>
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

        <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="rounded-full bg-navy px-2.5 py-1 text-white">{Current.title}</span>
          {STEPS[step + 1] && (
            <span className="flex items-center gap-1 text-muted-foreground/70">
              <ArrowRight className="h-3 w-3" /> Urmează: {STEPS[step + 1].title}
            </span>
          )}
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
          <span ref={publishRef} className="flex-1">
            <LoadingButton
              onAction={handlePublish}
              disabled={uploading}
              pendingLabel="Se publică…"
              successLabel="Publicat!"
              errorLabel="Încearcă din nou"
              className="w-full"
            >
              Publică anunțul
            </LoadingButton>
          </span>
        )}
      </div>
    </div>
  );
}