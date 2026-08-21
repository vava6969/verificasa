import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { useToast } from "@/components/ui/use-toast";
import { Meter, Stamp } from "@/components/fisa";
import { getEntitlements, BOOST_DURATION_DAYS } from "@/lib/plans";
import { fetchMyActiveSubscription } from "@/lib/subscriptions";
import { fetchBoostBalance, fetchActiveListingCount, redeemCoupon } from "@/lib/boosts";

// „Limitele contului" — cererea clientului (punctul 7): ce limite ai și cât ai
// consumat. Plus soldul de boost-uri și revendicarea unui cod, tot aici, ca
// utilizatorul să vadă într-un singur loc ce are și ce a folosit.
export default function AccountLimits({ className = "" }) {
  const { user } = useAuth();
  const { lang } = useCountry();
  const { toast } = useToast();
  const en = lang === "en";

  const [planId, setPlanId] = useState(undefined);
  const [used, setUsed] = useState(0);
  const [balance, setBalance] = useState(0);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    const [sub, count, bal] = await Promise.all([
      fetchMyActiveSubscription(user.id),
      fetchActiveListingCount(user.id),
      fetchBoostBalance(user.id),
    ]);
    setPlanId(sub?.plan_id || null);
    setUsed(count);
    setBalance(bal);
  };

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) { setPlanId(null); return undefined; }
    (async () => { if (!cancelled) await load(); })();
    return () => { cancelled = true; };
     
  }, [user?.id]);

  const onRedeem = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || redeeming) return;
    setRedeeming(true);
    const res = await redeemCoupon(trimmed);
    setRedeeming(false);
    if (res.ok) {
      setCode("");
      setBalance(res.balance ?? balance + (res.boosts || 0));
      toast({
        title: en ? "Code redeemed" : "Cod revendicat",
        description: en
          ? `${res.boosts} bonus boosts added to your account.`
          : `${res.boosts} boost-uri bonus au fost adăugate în cont.`,
      });
    } else {
      toast({
        title: en ? "Code not accepted" : "Codul nu a fost acceptat",
        description: (en && res.error_en) ? res.error_en : res.error,
        variant: "destructive",
      });
    }
  };

  if (planId === undefined) {
    return <div className={`h-40 animate-pulse border border-border bg-card ${className}`} />;
  }

  const ent = getEntitlements(planId);
  const planLabel = planId ? planId.charAt(0).toUpperCase() + planId.slice(1) : (en ? "No plan" : "Fără plan");

  return (
    <section className={`border border-border bg-card ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {en ? "Account limits" : "Limitele contului"}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {en ? "What your plan allows, and what you have used." : "Ce îți permite planul și cât ai folosit."}
          </p>
        </div>
        <Stamp tone={planId ? "verde" : "ink"}>{planLabel}</Stamp>
      </div>

      <div className="divide-y divide-border px-4">
        <Meter
          label={en ? "Active listings" : "Anunțuri active"}
          used={used}
          limit={ent.activeListings}
          unlimited={ent.activeListings === null}
        />
        <Meter
          label={en ? "Photos per listing" : "Fotografii per anunț"}
          used={0}
          limit={ent.photosPerListing}
          unlimited={ent.photosPerListing === null}
          reset={en ? "Applies to each listing separately." : "Se aplică fiecărui anunț în parte."}
        />
      </div>

      {ent.activeListings !== null && used >= ent.activeListings && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-sm text-foreground">
            {en
              ? "You have used every listing slot on this plan."
              : "Ai folosit toate locurile de anunț din acest plan."}
          </p>
          <Link to="/upgrade" className="mt-1 inline-flex min-h-[44px] items-center text-sm font-bold text-emerald transition-colors hover:text-foreground sm:min-h-0">
            {en ? "See what Pro includes" : "Vezi ce include Pro"} <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      {/* Boost-uri: sold + revendicare cod */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-muted-foreground">{en ? "Boosts available" : "Boost-uri disponibile"}</p>
          <p className="font-heading text-2xl font-semibold text-foreground tnum">{balance}</p>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {en
            ? `One boost lifts a listing for ${BOOST_DURATION_DAYS} days. Spend them from My listings.`
            : `Un boost ridică un anunț ${BOOST_DURATION_DAYS} zile. Îi folosești din Anunțurile mele.`}
        </p>

        <form onSubmit={onRedeem} className="mt-3 flex flex-wrap gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={en ? "Bonus code" : "Cod bonus"}
            aria-label={en ? "Bonus code" : "Cod bonus"}
            className="min-h-[44px] min-w-0 flex-1 rounded border border-border bg-background px-3 text-sm uppercase text-foreground outline-none focus:border-emerald"
          />
          <button
            type="submit"
            disabled={redeeming || !code.trim()}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-emerald hover:text-emerald disabled:opacity-50"
          >
            {redeeming ? <><Loader2 className="h-4 w-4 animate-spin" /> {en ? "Checking" : "Se verifică"}</> : (en ? "Redeem" : "Revendică")}
          </button>
        </form>

        <Link to="/upgrade" className="mt-3 inline-flex min-h-[44px] items-center text-sm font-bold text-emerald transition-colors hover:text-foreground sm:min-h-0">
          {en ? "Buy boosts" : "Cumpără boost-uri"} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
