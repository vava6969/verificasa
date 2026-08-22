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
// Câte anunțuri de fiecare plan în datele de demonstrație. E forma pe care o
// avea aplicația înainte ca cineva să șteargă suprascrierile din panoul Base44:
// 5 Agent, 4 Pro, 12 Basic. Restul rămân fără plan.
const DEMO_SPREAD = { agent: 5, pro: 4, basic: 12 };

export default function AdminPlanSync() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(null);

  // Pune la loc planurile de demonstrație pe anunțuri.
  //
  // `poster_plan_override` bate `poster_plan` în resolvePropertyPlan, deci
  // câmpul ăsta — nu abonamentele — e cel care umple rândurile Agent și Pro de
  // pe prima pagină cât timp nu există abonați adevărați. Nimic din aplicație
  // nu îl scria: se punea de mână din panou, și tot de mână a fost șters.
  //
  // Alegerea e deterministă, nu la întâmplare: anunțurile se ordonează după id,
  // iar cele care se declară „Agent" primesc primele planul Agent — un anunț
  // de agenție pe planul de agenție se citește coerent. Rulat de două ori dă
  // același rezultat.
  const seedDemoPlans = async () => {
    setSeeding(true);
    setSeeded(null);
    try {
      const all = await base44.entities.Property.filter(
        { approval_status: "APPROVED", country: "RO" }, "-created_date", 200
      );
      const sorted = [...(all || [])].sort((a, b) => String(a.id).localeCompare(String(b.id)));
      const agentsFirst = [
        ...sorted.filter((p) => p.seller_role === "Agent"),
        ...sorted.filter((p) => p.seller_role !== "Agent"),
      ];

      const plan = new Map();
      let i = 0;
      for (const [id, n] of Object.entries(DEMO_SPREAD)) {
        for (let k = 0; k < n && i < agentsFirst.length; k += 1, i += 1) {
          plan.set(agentsFirst[i].id, id);
        }
      }

      let changed = 0;
      for (const prop of sorted) {
        const want = plan.get(prop.id) || null;
        const have = prop.poster_plan_override || null;
        if (want === have) continue;
        // Base44 nu acceptă "" pe un câmp cu enum, deci golirea trece prin null.
        await base44.entities.Property.update(prop.id, { poster_plan_override: want });
        changed += 1;
      }

      setSeeded({ changed, total: sorted.length, ...DEMO_SPREAD });
      toast({
        title: "Planuri demo aplicate",
        description: `${changed} anunțuri modificate — ${DEMO_SPREAD.agent} Agent, ${DEMO_SPREAD.pro} Pro, ${DEMO_SPREAD.basic} Basic.`,
      });
    } catch (e) {
      toast({
        title: "Nu am putut aplica planurile demo",
        description: e?.message || "Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
    }
  };

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

      <div className="mt-5 border-t border-border pt-4">
        <h4 className="font-heading text-base font-bold text-foreground">Planuri pe datele de demonstrație</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Pune la loc {DEMO_SPREAD.agent} Agent, {DEMO_SPREAD.pro} Pro și {DEMO_SPREAD.basic} Basic pe anunțurile
          existente, ca rândurile Agent și Pro de pe prima pagină să aibă ce arăta cât timp nu există
          abonați adevărați. Scrie `poster_plan_override`, care bate planul real. Rulat de două ori dă
          același rezultat.
        </p>
        <button
          type="button"
          onClick={seedDemoPlans}
          disabled={seeding}
          className="mt-3 flex min-h-[44px] items-center gap-2 rounded-full border border-border px-5 font-bold text-foreground transition-colors hover:border-emerald disabled:opacity-50"
        >
          {seeding && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {seeding ? "Se aplică…" : "Aplică planurile demo"}
        </button>
        {seeded && (
          <p className="mt-3 text-sm text-muted-foreground">
            {seeded.changed} anunțuri modificate din {seeded.total}.
          </p>
        )}
      </div>
    </section>
  );
}
