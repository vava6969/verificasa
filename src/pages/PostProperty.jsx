import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCountry } from "@/components/CountryContext";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Plus } from "lucide-react";
import { NewPropertyForm } from "@/pages/Owner";

// Standalone tab opened from "Adaugă Anunț" buttons across the site. Renders
// only the listing form — no site header / bottom nav / dashboard chrome.
export default function PostProperty() {
  const { t } = useCountry();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Postează anunț · VerifiCasa";
    return () => { document.title = "VerifiCasa"; };
  }, []);

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <VerifiCasaLogo size={40} tagline={false} />
          </Link>
          <a href="/" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-emerald">
            <ArrowLeft className="h-4 w-4" /> Înapoi la site
          </a>
        </div>

        {submitted ? (
          <div className="mt-10 rounded-3xl border border-border bg-white p-8 text-center shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-soft">
              <CheckCircle2 className="h-8 w-8 text-emerald" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-navy">Anunț trimis spre aprobare</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Un administrator îl va verifica în curând. Va apărea în lista publică după aprobare.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={() => setSubmitted(false)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Adaugă alt anunț
              </Button>
              <a
                href="/"
                className="inline-flex h-9 items-center rounded-md bg-emerald px-4 text-sm font-semibold text-white shadow-soft hover:bg-emerald/90"
              >
                Vezi site-ul
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <NewPropertyForm onDone={() => setSubmitted(true)} onCancel={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}