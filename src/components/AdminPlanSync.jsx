import React, { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

// Rulează SyncPosterPlans.
//
// Funcția exista de la blocarea RLS pe Subscription, dar NU o chema nimeni —
// `grep -rn SyncPosterPlans src/` nu găsea niciun apel. Fără ea, Property.
// poster_plan rămâne nescris pe tot ce nu a trecut printr-o plată Stripe, iar
// planul unui anunț nu se poate afla din browser: Subscription.read e limitat
// la propriul rând, deci un vizitator vede planul DOAR pentru propriile
// anunțuri. De aceea rândul „Agent" de pe prima pagină arăta gol pentru toată
// lumea în afară de agentul însuși.
//
// Anunțurile noi se ștampilează singure la publicare (vezi PropertyWizard).
// Butonul ăsta e pentru tot ce există deja și pentru abonamentele acordate de
// mână din panoul Base44, care nu trec prin VerifyCheckoutSession.
export default function AdminPlanSync() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("SyncPosterPlans", {});
      const data = res?.data || res || {};
      if (data.error) {
        toast({ title: "Sincronizarea a eșuat", description: data.error, variant: "destructive" });
      } else {
        setResult(data);
        toast({
          title: "Planuri sincronizate",
          description: `${data.updated} anunțuri actualizate din ${data.properties} verificate.`,
        });
      }
    } catch (e) {
      toast({ title: "Sincronizarea a eșuat", description: "Încearcă din nou.", variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="rounded border border-border bg-card p-4 shadow-soft sm:p-6">
      <div className="flex items-start gap-3">
        <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-emerald" aria-hidden="true" />
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-bold text-foreground">Sincronizează planurile pe anunțuri</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Scrie planul fiecărui proprietar pe anunțurile lui, ca insigna și rândurile pe plan
            de pe prima pagină să se vadă pentru toată lumea, nu doar pentru proprietar. De rulat
            după ce acorzi un abonament din panoul Base44.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={running}
        className="mt-4 flex min-h-[44px] items-center gap-2 rounded-full bg-emerald px-5 font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {running && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {running ? "Se sincronizează…" : "Rulează sincronizarea"}
      </button>

      {result && (
        <p className="mt-3 text-sm text-muted-foreground">
          {result.updated} actualizate din {result.properties} anunțuri, pe baza a{" "}
          {result.subscriptions} abonamente active
          {result.failed ? ` · ${result.failed} eșuate` : ""}.
        </p>
      )}
    </section>
  );
}
