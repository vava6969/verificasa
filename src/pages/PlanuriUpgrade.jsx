import React, { useState, useEffect } from "react";
import NumberFlow from "@number-flow/react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { base44 } from "@/api/base44Client";
import { Reveal } from "@/components/ui/reveal";
import { Stamp, Hairline } from "@/components/fisa";
import { PLANS, ENTITLEMENTS, BOOST_PACKS, BOOST_DURATION_DAYS, boostUnitPrice } from "@/lib/plans";

// Planurile ca registru comparativ: coloane de plan față de rânduri de
// capabilități, ca diferența să se citească dintr-o singură trecere în loc de
// trei liste aproape identice. Tranziția de preț (NumberFlow) rămâne — e
// partea bună a paginii vechi; glow-ul albastru, toggle-ul gradient și
// panglica „Popular" au dispărut odată cu clona de componentă.

// Rândurile comparației. `get` întoarce ce se afișează în celula planului.
const ROWS = [
  {
    label: "Anunțuri active",
    get: (e) => (e.activeListings === null ? "nelimitat" : String(e.activeListings)),
  },
  {
    label: "Fotografii per anunț",
    get: (e) => (e.photosPerListing === null ? "nelimitat" : String(e.photosPerListing)),
  },
  {
    label: "Boost-uri incluse lunar",
    get: (e) => (e.boostsPerMonth ? String(e.boostsPerMonth) : "—"),
  },
  {
    label: "Prioritate în căutare",
    get: (e) => ["standard", "ridicată", "mare", "maximă"][e.priorityWeight] || "standard",
  },
  { label: "Verificare inclusă", get: () => "da" },
  { label: "Statistici anunț", get: (e, p) => (p.id === "basic" ? "de bază" : "avansate") },
  { label: "Suport", get: (e, p) => (p.id === "basic" ? "email" : p.id === "pro" ? "prioritar" : "manager dedicat") },
];

function PlanColumn({ plan, annual, onSelect, checkingOut }) {
  const price = annual ? plan.yearly : plan.monthly;
  const decimals = price % 1 !== 0;
  return (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
      <div>
        <h3 className="font-heading text-xl font-semibold text-foreground">{plan.shortName}</h3>
        <p className="mt-1 min-h-[2.5rem] text-xs leading-relaxed text-muted-foreground">{plan.description}</p>
        <p className="mt-3 font-heading text-3xl font-semibold text-foreground tnum">
          <NumberFlow
            value={price}
            locales="ro-RO"
            format={decimals ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 }}
          />
          <span className="ml-1 font-body text-sm font-medium text-muted-foreground">RON</span>
        </p>
        <p className="text-xs text-muted-foreground">/{annual ? "an" : "lună"}</p>
      </div>
      <button
        type="button"
        onClick={() => onSelect(plan)}
        disabled={checkingOut === plan.id}
        className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded bg-emerald px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90 disabled:opacity-70"
      >
        {checkingOut === plan.id ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Se deschide plata</>
        ) : (
          <>Alege {plan.shortName}</>
        )}
      </button>
    </div>
  );
}

export default function PlanuriUpgrade() {
  const [annual, setAnnual] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null);
  const [boostPending, setBoostPending] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { lang } = useCountry();
  const navigate = useNavigate();
  const en = lang === "en";

  useEffect(() => { document.title = "Planuri și boost-uri – VerifiCasa"; }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const boost = params.get("boost");
    const sessionId = params.get("session_id");
    if (checkout === "success") {
      toast({ title: "Plată reușită", description: "Abonamentul tău a fost activat." });
      if (sessionId) base44.functions.invoke("VerifyCheckoutSession", { session_id: sessionId }).catch(() => {});
    } else if (checkout === "cancelled" || boost === "cancelled") {
      toast({ title: "Plată anulată", description: "Nicio sumă nu a fost taxată." });
    }
    if (checkout || boost) {
      params.delete("checkout"); params.delete("boost"); params.delete("session_id");
      const qs = params.toString();
      window.history.replaceState({}, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
    }
  }, []);

  const selectPlan = async (plan) => {
    if (!user) { navigate("/login"); return; }
    setCheckingOut(plan.id);
    try {
      const res = await base44.functions.invoke("CreateCheckoutSession", {
        plan_id: plan.id, interval: annual ? "yearly" : "monthly",
      });
      const url = res?.data?.url || res?.url;
      if (url) { window.location.href = url; return; }
      toast({
        title: "Nu am putut porni plata",
        description: res?.data?.error || res?.error || "Încearcă din nou în câteva minute.",
        variant: "destructive",
      });
    } catch (e) {
      toast({ title: "Nu am putut porni plata", description: "Încearcă din nou în câteva minute.", variant: "destructive" });
    } finally {
      setCheckingOut(null);
    }
  };

  const buyBoosts = async (pack) => {
    if (!user) { navigate("/login"); return; }
    setBoostPending(pack.id);
    try {
      const res = await base44.functions.invoke("CreateBoostCheckout", { pack_id: pack.id });
      const url = res?.data?.url || res?.url;
      if (url) { window.location.href = url; return; }
      toast({
        title: "Nu am putut porni plata",
        description: res?.data?.error || res?.error || "Încearcă din nou în câteva minute.",
        variant: "destructive",
      });
    } catch (e) {
      toast({ title: "Nu am putut porni plata", description: "Încearcă din nou în câteva minute.", variant: "destructive" });
    } finally {
      setBoostPending(null);
    }
  };

  const cheapestUnit = Math.min(...BOOST_PACKS.map(boostUnitPrice));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Reveal>
        <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          {en ? "Plans and boosts" : "Planuri și boost-uri"}
        </h1>
        <p className="mt-3 max-w-[58ch] text-muted-foreground">
          {en
            ? "Verification stays free on every plan. What you pay for is room to list and visibility in search."
            : "Verificarea rămâne gratuită pe orice plan. Plătești pentru câte anunțuri poți ține active și pentru vizibilitate în căutare."}
        </p>
      </Reveal>

      {/* Interval — file, nu pastilă cu gradient */}
      <Reveal className="mt-6 inline-flex divide-x divide-border overflow-hidden rounded border border-border">
        {[
          { id: false, label: en ? "Monthly" : "Lunar" },
          { id: true, label: en ? "Yearly" : "Anual", note: en ? "2 months free" : "2 luni gratis" },
        ].map((opt) => (
          <button
            key={String(opt.id)}
            type="button"
            onClick={() => setAnnual(opt.id)}
            aria-pressed={annual === opt.id}
            className={`flex min-h-[44px] items-center gap-2 px-4 text-sm font-semibold transition-colors ${
              annual === opt.id ? "bg-emerald text-primary-foreground" : "text-foreground hover:bg-secondary"
            }`}
          >
            {opt.label}
            {opt.note && (
              <span className={annual === opt.id ? "text-xs font-medium text-primary-foreground/80" : "text-xs font-medium text-muted-foreground"}>
                {opt.note}
              </span>
            )}
          </button>
        ))}
      </Reveal>

      {/* REGISTRU COMPARATIV */}
      <Reveal className="mt-6 overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-[30%] border-b border-border p-4 text-left align-bottom">
                <span className="text-xs font-semibold text-muted-foreground">
                  {en ? "What you get" : "Ce primești"}
                </span>
              </th>
              {PLANS.map((plan) => (
                <th key={plan.id} className="border-b border-l border-border p-0 text-left align-top">
                  <PlanColumn plan={plan} annual={annual} onSelect={selectPlan} checkingOut={checkingOut} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="border-b border-border p-3 text-left text-sm font-medium text-muted-foreground">
                  {row.label}
                </th>
                {PLANS.map((plan) => (
                  <td key={plan.id} className="border-b border-l border-border p-3 text-sm font-semibold text-foreground tnum">
                    {row.get(ENTITLEMENTS[plan.id], plan)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {/* BOOST-URI — sub planuri, exact unde le-a cerut clientul */}
      <section className="mt-12">
        <Reveal>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            {en ? "Boosts" : "Boost-uri"}
          </h2>
          <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground">
            {en
              ? `One boost lifts a listing above the rest of its band for ${BOOST_DURATION_DAYS} days. Boosted listings are marked as paid placement, so nobody is misled about why they rank.`
              : `Un boost ridică un anunț peste restul categoriei sale timp de ${BOOST_DURATION_DAYS} zile. Anunțurile promovate sunt marcate ca plasare plătită, ca nimeni să nu fie indus în eroare.`}
          </p>
        </Reveal>

        <Reveal className="mt-5 divide-y divide-border border border-border bg-card">
          {BOOST_PACKS.map((pack) => {
            const unit = boostUnitPrice(pack);
            const best = Math.abs(unit - cheapestUnit) < 0.001;
            return (
              <div key={pack.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-heading text-lg font-semibold text-foreground">
                    {pack.boosts} {en ? "boosts" : "boost-uri"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground tnum">
                    {unit.toFixed(2).replace(".", ",")} RON {en ? "per boost" : "pe boost"}
                    {best && (
                      <> · <span className="font-semibold text-emerald">{en ? "best rate" : "cel mai bun preț"}</span></>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-heading text-2xl font-semibold text-foreground tnum">
                    {pack.priceRon.toFixed(2).replace(".", ",")}
                    <span className="ml-1 font-body text-sm font-medium text-muted-foreground">RON</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => buyBoosts(pack)}
                    disabled={boostPending === pack.id}
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-emerald hover:text-emerald disabled:opacity-70"
                  >
                    {boostPending === pack.id ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {en ? "Opening" : "Se deschide"}</>
                    ) : (
                      <>{en ? "Buy" : "Cumpără"}</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </Reveal>

        <Reveal className="mt-4 flex flex-wrap items-center gap-3">
          <Stamp tone="ink">{en ? "Have a code?" : "Ai un cod?"}</Stamp>
          <p className="text-sm text-muted-foreground">
            {en ? "Redeem it in " : "Îl folosești în "}
            <a href="/account" className="font-semibold text-emerald hover:underline">
              {en ? "your account" : "Contul meu"}
            </a>
            {en ? " for bonus boosts." : " și primești boost-uri bonus."}
          </p>
        </Reveal>
      </section>

      <Hairline className="mt-12" />
      <p className="mt-4 text-xs text-muted-foreground">
        {en
          ? "Prices include VAT. Subscriptions renew automatically and can be cancelled at any time; boosts are a one-off purchase and do not expire until used."
          : "Prețurile includ TVA. Abonamentele se reînnoiesc automat și pot fi anulate oricând; boost-urile sunt o plată unică și nu expiră până nu sunt folosite."}
      </p>
    </div>
  );
}
