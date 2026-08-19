import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import PropertyEditForm from "@/components/PropertyEditForm";
import { Image as UIImage } from "@/components/ui/image";
import { Home, Pencil, Trash2, Plus, MapPin, Eye } from "lucide-react";

// "My Properties" — shows only the logged-in user's listings with edit/delete.
// Empty state invites them to add their first listing.
export default function MyProperties() {
  const { user } = useAuth();
  const { formatPrice } = useCountry();
  const { toast } = useToast();
  const [properties, setProperties] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    if (!user?.id) return;
    try {
      const ps = await base44.entities.Property.filter({ created_by_id: user.id }, "-created_date", 100);
      setProperties(ps);
    } catch (e) {
      setProperties([]);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  // Real-time: admin approval/rejection or own edits refresh this list live.
  useEffect(() => {
    if (!user?.id) return;
    const unsub = base44.entities.Property.subscribe(() => load());
    return () => { try { unsub && unsub(); } catch { /* noop */ } };
  }, [user?.id]);

  const handleDelete = async (id) => {
    if (!confirm("Sigur ștergi acest anunț?")) return;
    try {
      await base44.entities.Property.delete(id);
      toast({ title: "Anunț șters" });
      load();
    } catch (e) {
      toast({ title: "Eroare la ștergere", variant: "destructive" });
    }
  };

  if (properties === null) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-56" />
        <div className="mt-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-navy">Proprietățile mele</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestionează anunțurile pe care le-ai postat.</p>
        </div>
        <Button asChild className="bg-emerald text-white hover:bg-emerald/90">
          <a href="/post-property" target="_blank" rel="noopener noreferrer"><Plus className="h-4 w-4" /> Adaugă Anunț</a>
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="mt-8 rounded-lg border-2 border-dashed border-border bg-white py-20 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-soft">
            <Home className="h-8 w-8 text-emerald" />
          </div>
          <p className="mt-4 font-heading text-xl font-bold text-navy">Nu ai adăugat niciun anunț încă.</p>
          <p className="mt-1 text-sm text-muted-foreground">Postează prima ta proprietate în câteva minute.</p>
          <Button asChild className="mt-5 bg-emerald text-white hover:bg-emerald/90">
            <a href="/post-property" target="_blank" rel="noopener noreferrer"><Plus className="h-4 w-4" /> Adaugă Anunț</a>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {properties.map((p) => (
            <div key={p.id} className="rounded-lg border border-border bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {p.images?.[0] ? <UIImage src={p.images[0]} fittingType="fill" className="h-full w-full" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold text-navy line-clamp-1">{p.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {p.zone}, {p.city} · {p.property_type}</p>
                  <p className="mt-1 text-sm font-bold text-navy">{formatPrice(p.price_monthly, p.currency)}<span className="text-xs font-medium text-muted-foreground">/lună</span></p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {p.views_count || 0}</span>
                  <span className={`rounded-sm px-2 py-0.5 text-[11px] font-semibold ${p.approval_status === "APPROVED" ? "bg-emerald-soft text-emerald" : "bg-gold-soft text-gold-deep"}`}>{p.approval_status === "APPROVED" ? "Aprobat" : "În așteptare"}</span>
                  <span className={`rounded-sm px-2 py-0.5 text-[11px] font-semibold ${p.status === "Activ" ? "bg-emerald-soft text-emerald" : "bg-secondary text-muted-foreground"}`}>{p.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(editing === p.id ? null : p.id)} className="gap-1">
                    <Pencil className="h-3.5 w-3.5" /> Editează
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(p.id)} className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" /> Șterge
                  </Button>
                </div>
              </div>

              {editing === p.id && <PropertyEditForm property={p} onDone={() => { setEditing(null); load(); }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}