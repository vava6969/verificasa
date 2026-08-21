import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCountry } from "@/components/CountryContext";
import { useToast } from "@/components/ui/use-toast";
import { BOOST_DURATION_DAYS } from "@/lib/plans";
import { applyBoost } from "@/lib/boosts";

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
                ? "You have no boosts left. Buy a pack or redeem a bonus code first."
                : "Nu mai ai boost-uri. Cumpără un pachet sau revendică un cod bonus mai întâi.")}
          </AlertDialogDescription>
        </AlertDialogHeader>

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
            <AlertDialogAction asChild className="min-h-[44px] rounded-full bg-emerald font-bold text-primary-foreground hover:bg-emerald/90">
              <Link to="/upgrade">{en ? "Buy boosts" : "Cumpără boost-uri"}</Link>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
