import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "@/components/PropertyCard";
import { Bookmark, Trash2, Home, UserCircle } from "lucide-react";
import { initials, avatarColor } from "@/lib/chatUtils";
import RatingStars from "@/components/RatingStars";

export default function Saved() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("properties");
  const [saved, setSaved] = useState(null);
  const [properties, setProperties] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState(null);
  const [profileUsers, setProfileUsers] = useState(null);

  const loadProperties = async () => {
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

  const loadProfiles = async () => {
    try {
      const list = await base44.entities.SavedProfile.filter({ user_id: user.id }, "-created_date", 200);
      setSavedProfiles(list);
      const users = await Promise.all(
        list.map((s) => base44.entities.User.get(s.target_user_id).catch(() => null))
      );
      setProfileUsers(users.filter(Boolean));
    } catch (e) {
      setSavedProfiles([]); setProfileUsers([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) { loadProperties(); loadProfiles(); }
    else { setSaved([]); setProperties([]); setSavedProfiles([]); setProfileUsers([]); }
  }, [isAuthenticated, user?.id]);

  const remove = async (propertyId) => {
    const items = (saved || []).filter((s) => s.property_id === propertyId);
    try {
      for (const s of items) await base44.entities.SavedProperty.delete(s.id);
      toast({ title: "Eliminat din salvate" });
      loadProperties();
    } catch (e) { toast({ title: "Eroare", variant: "destructive" }); }
  };

  const removeProfile = async (targetUserId) => {
    const items = (savedProfiles || []).filter((s) => s.target_user_id === targetUserId);
    try {
      for (const s of items) await base44.entities.SavedProfile.delete(s.id);
      toast({ title: "Profil eliminat" });
      loadProfiles();
    } catch (e) { toast({ title: "Eroare", variant: "destructive" }); }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-emerald/80 text-white shadow-soft"><Bookmark className="h-5 w-5" /></span>
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy dark:text-foreground">Salvate</h1>
          <p className="text-sm text-muted-foreground">Proprietățile și profilurile pe care le-ai păstrat.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("properties")}
          className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition ${tab === "properties" ? "text-emerald" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Home className="h-4 w-4" /> Anunțuri
          {properties && properties.length > 0 && <span className="text-xs">({properties.length})</span>}
          {tab === "properties" && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald" />}
        </button>
        <button
          onClick={() => setTab("profiles")}
          className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition ${tab === "profiles" ? "text-emerald" : "text-muted-foreground hover:text-foreground"}`}
        >
          <UserCircle className="h-4 w-4" /> Profiluri
          {profileUsers && profileUsers.length > 0 && <span className="text-xs">({profileUsers.length})</span>}
          {tab === "profiles" && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald" />}
        </button>
      </div>

      {/* Properties tab */}
      {tab === "properties" && (
        properties === null ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded border border-dashed border-border bg-gradient-to-b from-secondary/40 to-transparent py-20 text-center">
            <span className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald/20 to-gold/10 blur-md" />
              <Home className="relative h-8 w-8 text-emerald/70" />
            </span>
            <p className="mt-3 font-heading text-lg font-semibold text-navy dark:text-foreground">Niciun anunț salvat</p>
            <p className="text-sm text-muted-foreground">Apasă inima pe un anunț sau „Salvează" pe pagina de detaliu.</p>
            <Button asChild className="mt-4 bg-emerald text-white"><Link to="/search">Caută proprietăți</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <div key={p.id} className="relative">
                <PropertyCard property={p} />
                <button onClick={() => remove(p.id)} className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded bg-white/90 text-rose-500 shadow-soft transition hover:bg-rose-500 hover:text-white" title="Elimină din salvate">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Profiles tab */}
      {tab === "profiles" && (
        profileUsers === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded" />)}
          </div>
        ) : profileUsers.length === 0 ? (
          <div className="rounded border border-dashed border-border bg-gradient-to-b from-secondary/40 to-transparent py-20 text-center">
            <span className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald/20 to-gold/10 blur-md" />
              <UserCircle className="relative h-8 w-8 text-emerald/70" />
            </span>
            <p className="mt-3 font-heading text-lg font-semibold text-navy dark:text-foreground">Niciun profil salvat</p>
            <p className="text-sm text-muted-foreground">Salvează profiluri de proprietari sau agenți pentru a le găsi rapid.</p>
            <Button asChild className="mt-4 bg-emerald text-white"><Link to="/search">Caută proprietăți</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profileUsers.map((u) => (
              <div key={u.id} className="relative overflow-hidden rounded border border-border bg-white p-4 shadow-soft dark:bg-card">
                <button
                  onClick={() => removeProfile(u.id)}
                  className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-secondary/80 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                  title="Elimină profilul"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Link to={`/profile/${u.id}`} className="flex items-center gap-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${avatarColor(u.id)}`}>
                      {initials(u.full_name || u.email)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-bold text-navy hover:text-emerald dark:text-foreground">{u.full_name || u.email}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${u.seller_type === "Agent" ? "bg-blue-500" : "bg-emerald"}`} />
                      {u.seller_type === "Agent" ? "Agent Imobiliar" : "Proprietar"}
                    </p>
                    {u.agency_name && <p className="truncate text-xs text-muted-foreground">{u.agency_name}</p>}
                    <div className="mt-1 flex items-center gap-1">
                      <RatingStars rating={5} size="sm" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}