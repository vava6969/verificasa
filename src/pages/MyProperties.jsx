import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PropertyEditForm from "@/components/PropertyEditForm";
import BoostDialog from "@/components/BoostDialog";
import { Image as UIImage } from "@/components/ui/image";
import { Stamp, Frank, PhotoMark } from "@/components/fisa";
import { fetchBoostBalance } from "@/lib/boosts";

// Anunțurile proprii — registru de rânduri, cu stare, promovare și editare.
export default function MyProperties() {
  const { user } = useAuth();
  const { formatPrice, lang } = useCountry();
  const { toast } = useToast();
  const en = lang === "en";
  const [properties, setProperties] = useState(null);
  const [editing, setEditing] = useState(null);
  const [balance, setBalance] = useState(0);
  const [boostTarget, setBoostTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    if (!user?.id) return;
    try {
      const ps = await base44.entities.Property.filter({ created_by_id: user.id }, "-created_date", 100);
      setProperties(ps);
    } catch (e) {
      setProperties([]);
    }
  };

  const loadBalance = async () => {
    if (!user?.id) return;
    setBalance(await fetchBoostBalance(user.id));
  };

  useEffect(() => { load(); loadBalance();   }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const unsub = base44.entities.Property.subscribe(() => load());
    return () => { try { unsub && unsub(); } catch { /* noop */ } };
     
  }, [user?.id]);

  useEffect(() => { document.title = `${en ? "My listings" : "Anunțurile mele"} – VerifiCasa`; }, [en]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await base44.entities.Property.delete(deleteTarget.id);
      toast({ title: en ? "Listing deleted" : "Anunț șters" });
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast({ title: en ? "Could not delete" : "Eroare la ștergere", variant: "destructive" });
    }
  };

  if (properties === null) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-56" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-sm" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            {en ? "My listings" : "Anunțurile mele"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {en ? "Manage what you have published." : "Gestionează anunțurile pe care le-ai postat."}
            {" "}
            <span className="font-semibold text-foreground tnum">{balance}</span>{" "}
            {en ? "boosts available" : "boost-uri disponibile"}.
          </p>
        </div>
        <Button asChild className="min-h-[44px] rounded bg-emerald text-primary-foreground hover:bg-emerald/90">
          <Link to="/post-property">{en ? "Add a listing" : "Adaugă anunț"}</Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="mt-8 border border-dashed border-border bg-card px-4 py-20 text-center">
          <p className="font-heading text-xl font-semibold text-foreground">
            {en ? "Nothing published yet." : "Nu ai adăugat niciun anunț încă."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {en ? "Publishing takes a few minutes." : "Postezi prima proprietate în câteva minute."}
          </p>
          <Link to="/post-property" className="mt-4 inline-flex min-h-[44px] items-center text-sm font-bold text-emerald transition-colors hover:text-foreground sm:min-h-0">
            {en ? "Add a listing" : "Adaugă anunț"} <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border border border-border bg-card">
          {properties.map((p) => {
            const boosted = p.boost_active;
            const boostUntil = p.boost_ends_date
              ? new Date(p.boost_ends_date).toLocaleDateString(en ? "en-GB" : "ro-RO", { day: "2-digit", month: "short" })
              : null;
            const approved = p.approval_status === "APPROVED";
            return (
              <div key={p.id} className="p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden border border-border bg-secondary">
                    {p.images?.[0] ? <UIImage src={p.images[0]} fittingType="fill" className="h-full w-full" /> : null}
                    {p.property_code && (
                      <>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/55 to-transparent" />
                        <PhotoMark className="bottom-1 left-1.5">{p.property_code}</PhotoMark>
                      </>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-heading text-lg font-semibold text-foreground">{p.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {p.zone ? `${p.zone}, ` : ""}{p.city} · {p.property_type}
                    </p>
                    <p className="mt-1 font-heading text-lg font-semibold text-foreground tnum">
                      {formatPrice(p.price_monthly, p.currency)}
                      <span className="ml-0.5 font-body text-xs font-medium text-muted-foreground">
                        {p.transaction_type === "SALE" ? "" : "/lună"}
                      </span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Stamp tone={approved ? "verde" : "ink"}>
                        {approved ? (en ? "Approved" : "Aprobat") : (en ? "Pending" : "În așteptare")}
                      </Stamp>
                      <Stamp tone="ink">{p.status}</Stamp>
                      {boosted && <Frank until={boostUntil} />}
                      <span className="ml-1 text-xs text-muted-foreground tnum">
                        {p.views_count || 0} {en ? "views" : "vizite"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setBoostTarget(p)}
                      disabled={!approved}
                      title={!approved ? (en ? "Approve the listing first" : "Anunțul trebuie aprobat întâi") : undefined}
                      className="min-h-[40px] rounded bg-emerald text-primary-foreground hover:bg-emerald/90 disabled:opacity-50"
                    >
                      {boosted ? (en ? "Extend" : "Prelungește") : (en ? "Promote" : "Promovează")}
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setEditing(editing === p.id ? null : p.id)}
                      className="min-h-[40px] rounded border-border"
                    >
                      {en ? "Edit" : "Editează"}
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setDeleteTarget(p)}
                      className="min-h-[40px] rounded border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      {en ? "Delete" : "Șterge"}
                    </Button>
                  </div>
                </div>

                {editing === p.id && <PropertyEditForm property={p} onDone={() => { setEditing(null); load(); }} />}
              </div>
            );
          })}
        </div>
      )}

      <BoostDialog
        open={!!boostTarget}
        onOpenChange={(v) => !v && setBoostTarget(null)}
        property={boostTarget}
        balance={balance}
        onDone={(res) => { setBalance(res.balance ?? balance - 1); load(); }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-none border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl font-semibold">
              {en ? "Delete this listing?" : "Ștergi acest anunț?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {en
                ? `"${deleteTarget?.title || ""}" will be removed from search and from the map. This cannot be undone from here.`
                : `„${deleteTarget?.title || ""}" va fi scos din căutare și de pe hartă. Acțiunea nu poate fi anulată de aici.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px] rounded border-border">
              {en ? "Cancel" : "Anulează"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              className="min-h-[44px] rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {en ? "Delete" : "Șterge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
