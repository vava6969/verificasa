import React, { useState } from "react";
import { Link } from "react-router-dom";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import PropertyWizard from "@/components/postproperty/PropertyWizard";
import LanguageToggle from "@/components/LanguageToggle";
import { useCountry } from "@/components/CountryContext";

export default function PostProperty() {
  const [submitted, setSubmitted] = useState(false);
  const { lang } = useCountry();
  const en = lang === "en";

  return (
    <div className="min-h-screen bg-secondary/40 dark:bg-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-1.5 sm:px-6">
          <Link to="/" className="flex min-h-[44px] min-w-0 items-center gap-2">
            <VerifiCasaLogo size={34} tagline={false} />
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Formularul își desenează propriul antet, deci selectorul din
                Header nu ajunge aici — fără ăsta, pagina rămâne blocată în
                română și nu ai de unde să schimbi. */}
            <LanguageToggle />
            <Link
              to="/"
              aria-label={en ? "Back to site" : "Înapoi la site"}
              className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-emerald"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{en ? "Back to site" : "Înapoi la site"}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {submitted ? (
          <div className="surface-card mt-8 rounded-2xl p-8 text-center">
            <img
              src="/images/generated/icon-document-check.png"
              alt=""
              aria-hidden="true"
              className="mx-auto h-16 w-16 object-contain"
            />
            <h1 className="mt-4 font-heading text-2xl font-bold text-navy dark:text-foreground">Anunț trimis spre aprobare</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Îl verificăm și apare public după aprobare.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={() => setSubmitted(false)} className="h-12 gap-1.5 rounded-full px-5">
                <Plus className="h-4 w-4" /> Adaugă alt anunț
              </Button>
              <Button asChild className="h-12 rounded-full bg-emerald px-6 text-white hover:bg-emerald/90">
                <Link to="/">Vezi site-ul</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 mt-2">
              <h1 className="font-heading text-2xl font-bold text-navy dark:text-foreground sm:text-3xl">
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