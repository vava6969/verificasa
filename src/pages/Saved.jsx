import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "@/components/PropertyCard";
import { Bookmark, Trash2, Home } from "lucide-react";

export default function Saved() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(null);
  const [properties, setProperties] = useState(null);

  const load = async () => {
    try {
      const list = await base44.entities.SavedProperty.filter({ user_id: user.id }, "-created_date", 200);
      setSaved(list);
      const props = await Promise.all(
        list.map((s) => base44.entities.Property.get(s.property_id).catch(() => null))
      );
      setProperties(props.filter(Boolean));
    } catch (e) {
      setSaved([]); setProperties([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) load();
    else { setSaved([]); setProperties([]); }
  }, [isAuthenticated, user?.id]);

  const remove = async (propertyId) => {
    const items = (saved || []).filter((s) => s.property_id === propertyId);
    try {
      for (const s of items) await base44.entities.SavedProperty.delete(s.id);
      toast({ title: "Eliminat din salvate" });
      load();
    } catch (e) { toast({ title: "Eroare", variant: "destructive" }); }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald text-white"><Bookmark className="h-5 w-5" /></span>
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Anunțuri salvate</h1>
          <p className="text-sm text-muted-foreground">Proprietățile pe care le-ai păstrat pentru mai târziu.</p>
        </div>
      </div>

      {properties === null ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <Home className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 font-heading text-lg font-semibold text-navy">Niciun anunț salvat</p>
          <p className="text-sm text-muted-foreground">Apasă inima pe un anunț sau „Salvează" pe pagina de detaliu.</p>
          <Button asChild className="mt-4 bg-emerald text-white"><Link to="/search">Caută proprietăți</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <div key={p.id} className="relative">
              <PropertyCard property={p} />
              <button onClick={() => remove(p.id)} className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-soft transition hover:bg-rose-500 hover:text-white" title="Elimină din salvate">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}