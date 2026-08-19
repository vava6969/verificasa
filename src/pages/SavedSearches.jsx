import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, Trash2, ArrowRight } from "lucide-react";

export default function SavedSearches() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState(null);

  const load = async () => {
    try {
      const list = await base44.entities.SavedSearch.filter({ user_id: user.id }, "-created_date", 100);
      setItems(list);
    } catch (e) { setItems([]); }
  };
  useEffect(() => {
    if (isAuthenticated) load(); else setItems([]);
  }, [isAuthenticated, user?.id]);

  const remove = async (id) => {
    try { await base44.entities.SavedSearch.delete(id); toast({ title: "Căutare ștearsă" }); load(); }
    catch (e) { toast({ title: "Eroare", variant: "destructive" }); }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald text-white"><SearchIcon className="h-5 w-5" /></span>
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Căutări salvate</h1>
          <p className="text-sm text-muted-foreground">Filtele tale preferate, gata de rulat din nou.</p>
        </div>
      </div>

      {items === null ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 font-heading text-lg font-semibold text-navy">Nicio căutare salvată</p>
          <p className="text-sm text-muted-foreground">Apasă „Salvează căutarea" pe pagina de căutare.</p>
          <Button asChild className="mt-4 bg-emerald text-white"><Link to="/search">Caută proprietăți</Link></Button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((s) => {
            const qs = s.query_string || "";
            const label = s.label || qs || "Căutare";
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 shadow-soft">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald"><SearchIcon className="h-4 w-4" /></span>
                <Link to={`/search?${qs}`} className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy">{label}</p>
                  <p className="truncate text-xs text-muted-foreground">/search?{qs}</p>
                </Link>
                <Button asChild size="sm" className="bg-emerald text-white">
                  <Link to={`/search?${qs}`}>Vezi rezultate <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <button onClick={() => remove(s.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive" title="Șterge">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}