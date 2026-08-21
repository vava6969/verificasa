import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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
  { id: 0, title: "Ce publici",      sub: "Tipul anunțului și titlul" },
  { id: 1, title: "Locație",         sub: "Unde se află proprietatea" },
  { id: 2, title: "Detalii",         sub: "Preț, spațiu, descriere" },
  { id: 3, title: "Facilități",      sub: "Ce oferă locuința" },
  { id: 4, title: "Poze & contact",  sub: "Ultimul pas" },
];

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];

export default function PropertyWizard({ onDone, onCancel }) {
  const { country, lang } = useCountry();
  const reduced = useReducedMotion();
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

    // Limitele planului se verifică server-side înainte de publicare — altfel
    // planurile vând „1 anunț activ" fără ca nimic să îl impună.
    if (!isAdmin) {
      try {
        const res = await base44.functions.invoke("CheckListingAllowance", { photo_count: imagesCount });
        const data = res?.data || res || {};
        if (data.allowed === false) {
          toast({
            title: "Ai atins limita planului",
            description: data.error || "Treci pe un plan superior ca să publici mai multe anunțuri.",
            variant: "destructive",
          });
          throw new Error("allowance");
        }
      } catch (e) {
        if (e?.message === "allowance") throw e;
        // O eroare de rețea nu trebuie să blocheze publicarea — limita rămâne
        // impusă oricum la aprobare.
      }
    }

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
    const colors = ["#1F7048", "#DE4E12", "#161C29", "#F8F6F1"];
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
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {/* Progress header */}
      <div className="border-b border-border/60 px-4 pb-4 pt-5 sm:px-6">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald">
              Pasul {step + 1} din {STEPS.length}
            </p>
            <h2 className="truncate font-heading text-lg font-bold text-navy dark:text-foreground">{Current.title}</h2>
          </div>
          <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">{Current.sub}</p>
        </div>

        <div
          className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
        >
          <motion.div
            className="h-full rounded-full bg-emerald"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={reduced ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Pași parcurși */}
        <div className="mt-4 flex items-center">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors duration-300 ${
                  i < step
                    ? "border-emerald bg-emerald text-white"
                    : i === step
                    ? "border-emerald bg-card text-emerald ring-4 ring-emerald/15"
                    : "border-border bg-secondary text-muted-foreground/50"
                }`}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span className={`mx-1 h-0.5 flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-emerald" : "bg-border"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step body */}
      <div className="overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduced ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, x: -16 }}
            transition={reduced ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && <StepBasics form={form} set={set} />}
            {step === 1 && <StepLocation form={form} set={set} country={country} />}
            {step === 2 && <StepDetails form={form} set={set} />}
            {step === 3 && <StepFeatures form={form} set={set} chips={chips} setChips={setChips} facilities={facilities} setFacilities={setFacilities} />}
            {step === 4 && (
              <>
                <p className="mb-4 rounded-xl bg-emerald-soft px-3.5 py-2.5 text-sm font-medium text-emerald">
                  {lang === "en"
                    ? "Real photos, taken on your phone. No renders."
                    : "Poze reale, făcute cu telefonul. Fără randări."}
                </p>
                <StepPhotos form={form} set={set} uploading={uploading} onFiles={handleFile} agreed={agreed} setAgreed={setAgreed} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border/60 bg-card px-4 py-3 sm:px-6">
        <Button
          type="button"
          variant="outline"
          onClick={back}
          className="h-12 gap-1.5 rounded-full px-5"
        >
          <ArrowLeft className="h-4 w-4" /> {step === 0 ? "Renunță" : "Înapoi"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={next}
            className="h-12 flex-1 gap-1.5 rounded-full bg-emerald text-base text-white shadow-soft hover:bg-emerald/90"
          >
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
              className="w-full rounded-full"
            >
              Publică anunțul
            </LoadingButton>
          </span>
        )}
      </div>
    </div>
  );
}