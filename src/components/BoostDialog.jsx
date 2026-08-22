import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCountry } from "@/components/CountryContext";
import { useToast } from "@/components/ui/use-toast";
import { BOOST_DURATION_DAYS, SINGLE_BOOST_PACK } from "@/lib/plans";
import { applyBoost, buyBoostForProperty } from "@/lib/boosts";

// Confirmarea consumului unui boost. Cheltuirea unui credit e ireversibilă, iar
// până acum nimic din acest cod nu cerea confirmare pentru nimic — dialogul
// arată exact ce se consumă, cât rămâne și până când ține promovarea.
export default function BoostDialog({ open, onOpenChange, property, balance, onDone }) {
  const { lang } = useCountry();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const en = lang === "en";

  const hasCredits = balance >= 1;
  const now = Date.now();
  const currentEnd = property?.boost_ends_date ? new Date(property.boost_ends_date).getTime() : 0;
  const from = currentEnd > now ? currentEnd : now;
  const until = new Date(from + BOOST_DURATION_DAYS * 86400000);
  const untilLabel = until.toLocaleDateString(en ? "en-GB" : "ro-RO", { day: "2-digit", month: "long", year: "numeric" });
  const extending = currentEnd > now;

  // Sold zero: cumperi UNUL, pentru ACEST anunț, dintr-o singură apăsare.
  // Backendul pune property_id în metadata sesiunii Stripe, iar
  // VerifyBoostCheckout aplică boost-ul singur la întoarcere — omul nu plătește
  // ca apoi să mai apese încă un buton. Până acum funcția exista în
  // lib/boosts.js și nu o chema nimeni; butonul de aici trimitea la /upgrade,
  // adică pe altă pagină, ca să cumperi un pachet pe care nu îl cereai.
  //
  // Întoarcerea din Stripe e pe /my-properties (o decide CreateBoostCheckout),
  // deci cine cumpără de pe /owner aterizează pe cealaltă listă de anunțuri.
  const buyOne = async () => {
    if (!property?.id || pending) return;
    setPending(true);
    const res = await buyBoostForProperty(property.id);
    if (res.url) { window.location.href = res.url; return; }
    setPending(false);
    toast({
      title: en ? "Could not start the payment" : "Nu am putut porni plata",
      description: res.error,
      variant: "destructive",
    });
  };

  const confirm = async () => {
    if (!property?.id || pending) return;
    setPending(true);
    const res = await applyBoost(property.id);
    setPending(false);
    if (res.ok) {
      toast({
        title: en ? "Listing promoted" : "Anunț promovat",
        description: en ? `Visible until ${untilLabel}.` : `Vizibil până la ${untilLabel}.`,
      });
      onOpenChange(false);
      onDone?.(res);
    } else {
      toast({
        title: en ? "Could not promote" : "Nu am putut promova",
        description: res.error,
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-xl font-semibold">
            {extending
              ? (en ? "Extend the promotion?" : "Prelungești promovarea?")
              : (en ? "Promote this listing?" : "Promovezi acest anunț?")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {hasCredits
              ? (en
                ? "Promoted listings rank above the rest of their band and are labelled as paid placement."
                : "Anunțurile promovate se clasează peste restul categoriei lor și sunt marcate ca plasare plătită.")
              : (en
                ? `You have no boosts left. Buy one for this listing — ${SINGLE_BOOST_PACK.priceRon.toLocaleString("ro-RO", { minimumFractionDigits: 2 })} RON, applied as soon as you are back.`
                : `Nu mai ai boost-uri. Cumperi unul pentru acest anunț — ${SINGLE_BOOST_PACK.priceRon.toLocaleString("ro-RO", { minimumFractionDigits: 2 })} RON, se aplică singur la întoarcere.`)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!hasCredits && (
          // Pachetele rămân la un tap distanță — cine promovează des ia 6 sau
          // 12 deodată, la un preț pe boost mai mic.
          <p className="text-sm text-muted-foreground">
            {en ? "Boosting often? " : "Promovezi des? "}
            <Link to="/upgrade" className="font-semibold text-emerald underline-offset-4 hover:underline">
              {en ? "Packs of 3, 6 and 12 cost less per boost." : "Pachetele de 3, 6 și 12 costă mai puțin pe boost."}
            </Link>
          </p>
        )}

        {hasCredits && (
          <dl className="space-y-2 rounded-2xl bg-secondary/60 px-4 py-3">
            {[
              [en ? "Listing" : "Anunț", property?.title || "—"],
              [en ? "Cost" : "Cost", en ? "1 boost" : "1 boost"],
              [en ? "Balance after" : "Sold rămas", String(Math.max(0, balance - 1))],
              [en ? "Visible until" : "Vizibil până la", untilLabel],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="truncate text-right text-sm font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-[44px] rounded-full border-border">
            {en ? "Cancel" : "Anulează"}
          </AlertDialogCancel>
          {hasCredits ? (
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirm(); }}
              disabled={pending}
              className="min-h-[44px] gap-2 rounded-full bg-emerald font-bold text-primary-foreground hover:bg-emerald/90"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {extending ? (en ? "Extend" : "Prelungește") : (en ? "Promote" : "Promovează")}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); buyOne(); }}
              disabled={pending}
              className="min-h-[44px] gap-2 rounded-full bg-emerald font-bold text-primary-foreground hover:bg-emerald/90"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {en
                ? `Buy 1 boost · ${SINGLE_BOOST_PACK.priceRon.toLocaleString("ro-RO", { minimumFractionDigits: 2 })} RON`
                : `Cumpără 1 boost · ${SINGLE_BOOST_PACK.priceRon.toLocaleString("ro-RO", { minimumFractionDigits: 2 })} RON`}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
