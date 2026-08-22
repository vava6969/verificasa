import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import PropertyWizard from "@/components/postproperty/PropertyWizard";
import LanguageToggle from "@/components/LanguageToggle";
import BoostDialog from "@/components/BoostDialog";
import { useCountry } from "@/components/CountryContext";
import { useAuth } from "@/lib/AuthContext";
import { fetchBoostBalance } from "@/lib/boosts";
import { BOOST_DURATION_DAYS } from "@/lib/plans";

export default function PostProperty() {
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState(null);
  const [balance, setBalance] = useState(0);
  const [boosting, setBoosting] = useState(false);
  const { lang } = useCountry();
  const { user } = useAuth();
  const en = lang === "en";

  // Soldul se citește după publicare, nu la intrarea în formular: până nu
  // există un anunț, nu are ce oferi.
  useEffect(() => {
    if (!submitted || !user?.id) return;
    let cancelled = false;
    fetchBoostBalance(user.id).then((b) => { if (!cancelled) setBalance(b); });
    return () => { cancelled = true; };
  }, [submitted, user?.id]);

  // Un anunț proaspăt trimis e „în așteptare", iar CreateBoostCheckout refuză
  // explicit orice anunț neaprobat — deci NU putem oferi „cumpără și aplică
  // acum". Ecranul spune adevărul: promovarea pornește după aprobare. Pentru
  // admini, care publică direct aprobat, butonul chiar promovează pe loc.
  const approved = created?.approval_status === "APPROVED";

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
            <h1 className="mt-4 font-heading text-2xl font-bold text-navy dark:text-foreground">{en ? "Listing sent for approval" : "Anunț trimis spre aprobare"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {en ? "We check it, and it goes public once approved." : "Îl verificăm și apare public după aprobare."}
            </p>
            {/* PROMOVARE — ultimul pas al fluxului de publicare.
                Până acum nu exista nicăieri în „adaugă un anunț" un moment în
                care să ți se propună promovarea, deși ăsta e exact momentul în
                care omul se gândește cât de repede vrea să fie văzut. */}
            <div className="mt-7 rounded-2xl border border-emerald/30 bg-emerald-soft/40 p-5 text-left dark:bg-emerald-soft/10">
              <div className="flex items-start gap-3">
                <img
                  src="/images/generated/badge-promovat.png"
                  alt=""
                  aria-hidden="true"
                  className="h-11 w-11 shrink-0 object-contain drop-shadow"
                />
                <div className="min-w-0">
                  <p className="font-heading text-base font-bold text-navy dark:text-foreground">
                    {en ? "Want it seen first?" : "Vrei să fie văzut primul?"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {en
                      ? `A boost lifts this listing above the rest of its band for ${BOOST_DURATION_DAYS} days.`
                      : `Un boost ridică anunțul peste restul categoriei sale timp de ${BOOST_DURATION_DAYS} zile.`}
                    {" "}
                    {approved
                      ? (en ? `You have ${balance}.` : `Ai ${balance}.`)
                      : (en
                          ? "It starts as soon as the listing is approved."
                          : "Pornește imediat ce anunțul e aprobat.")}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {approved && balance >= 1 ? (
                  <Button
                    onClick={() => setBoosting(true)}
                    className="h-11 rounded-full bg-emerald px-5 text-sm text-white hover:bg-emerald/90"
                  >
                    {en ? "Promote now" : "Promovează acum"}
                  </Button>
                ) : (
                  <Button asChild className="h-11 rounded-full bg-emerald px-5 text-sm text-white hover:bg-emerald/90">
                    <Link to="/upgrade">
                      {balance >= 1
                        ? (en ? `You have ${balance} boosts` : `Ai ${balance} boost-uri`)
                        : (en ? "Buy boosts" : "Cumpără boost-uri")}
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="h-11 gap-1.5 rounded-full px-5 text-sm">
                  <Link to="/my-properties">
                    {en ? "My listings" : "Anunțurile mele"} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={() => { setSubmitted(false); setCreated(null); }} className="h-12 gap-1.5 rounded-full px-5">
                <Plus className="h-4 w-4" /> {en ? "Add another listing" : "Adaugă alt anunț"}
              </Button>
              <Button asChild className="h-12 rounded-full bg-emerald px-6 text-white hover:bg-emerald/90">
                <Link to="/">{en ? "Back to site" : "Vezi site-ul"}</Link>
              </Button>
            </div>

            <BoostDialog
              open={boosting}
              onOpenChange={setBoosting}
              property={created}
              balance={balance}
              onDone={(res) => setBalance(res.balance ?? balance - 1)}
            />
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
            <PropertyWizard
              onDone={(property) => { setCreated(property || null); setSubmitted(true); }}
              onCancel={() => { window.location.href = "/"; }}
            />
          </>
        )}
      </div>
    </div>
  );
}