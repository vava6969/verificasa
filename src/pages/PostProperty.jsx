import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Plus, ShieldCheck } from "lucide-react";
import PropertyWizard from "@/components/postproperty/PropertyWizard";

export default function PostProperty() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-white/85 dark:bg-navy-deep/85">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <VerifiCasaLogo size={34} tagline={false} />
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-emerald">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Înapoi la site</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {submitted ? (
          <div className="surface-card mt-8 rounded p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-soft">
              <CheckCircle2 className="h-8 w-8 text-emerald" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-navy dark:text-foreground">Anunț trimis spre aprobare</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Un administrator îl va verifica în curând. Va apărea în lista publică după aprobare.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={() => setSubmitted(false)} className="gap-1.5 rounded">
                <Plus className="h-4 w-4" /> Adaugă alt anunț
              </Button>
              <Button asChild className="rounded bg-emerald text-white hover:bg-emerald/90">
                <Link to="/">Vezi site-ul</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 mt-2">
              <span className="inline-flex items-center gap-1.5 rounded bg-emerald-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald">
                <ShieldCheck className="h-3.5 w-3.5" /> Anunț verificat VerifiCasa
              </span>
              <h1 className="mt-2 font-heading text-2xl font-bold text-navy dark:text-foreground sm:text-3xl">
                Publică-ți proprietatea
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Durează ~3 minute. Te ghidăm pas cu pas.
              </p>
            </div>
            <PropertyWizard onDone={() => setSubmitted(true)} onCancel={() => { window.location.href = "/"; }} />
          </>
        )}
      </div>
    </div>
  );
}