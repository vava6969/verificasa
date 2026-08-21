import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, MessageCircle, BadgeCheck, Building2, Calendar, Loader2, Star, Plus,
  Bookmark, Share2, Check, CreditCard,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCountry } from "@/components/CountryContext";
import { useToast } from "@/components/ui/use-toast";
import { initials } from "@/lib/chatUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Image as UIImage } from "@/components/ui/image";
import PropertyCard from "@/components/PropertyCard";
import { buildCoverMap } from "@/lib/covers";
import RatingStars, { RatingBreakdown } from "@/components/RatingStars";
import ReviewItem from "@/components/ReviewItem";
import ReviewModal from "@/components/ReviewModal";
import BusinessCard from "@/components/BusinessCard";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useCountry();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("listings");
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const coverMap = useMemo(() => buildCoverMap(properties || []), [properties]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBusinessCard, setShowBusinessCard] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [shared, setShared] = useState(false);

  const en = lang === "en";
  const dateLocale = en ? "en-GB" : "ro-RO";

  // Load profile user
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const u = await base44.entities.User.get(id);
        if (cancelled) return;
        setProfile(u);
      } catch (e) {
        if (cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Load ratings
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadingRatings(true);
    (async () => {
      try {
        const list = await base44.entities.Rating.filter({ target_user_id: id }, "-created_date", 200);
        if (!cancelled) setRatings(list);
      } catch (e) {
        if (!cancelled) setRatings([]);
      } finally {
        if (!cancelled) setLoadingRatings(false);
      }
    })();
    const unsubscribe = base44.entities.Rating.subscribe((event) => {
      setRatings((prev) => {
        const p = event.data;
        if (event.type === "delete") return prev.filter((x) => x.id !== event.id);
        if (!p || p.target_user_id !== id) return prev;
        const idx = prev.findIndex((x) => x.id === p.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = p; return n; }
        return [p, ...prev];
      });
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [id]);

  // Progressive stars: starts at 1.0 with no reviews, grows toward the true
  // average as reviews accumulate (Bayesian average with a prior of 1).
  const { average, count, distribution } = useMemo(() => {
    const c = ratings.length;
    if (c === 0) return { average: 1, count: 0, distribution: {} };
    const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
    const dist = {};
    ratings.forEach((r) => { const s = Math.round(r.rating); dist[s] = (dist[s] || 0) + 1; });
    return { average: (sum + 1) / (c + 1), count: c, distribution: dist };
  }, [ratings]);

  // Load listings when tab is listings
  useEffect(() => {
    if (tab !== "listings" || !id) return;
    let cancelled = false;
    setLoadingProps(true);
    (async () => {
      try {
        const list = await base44.entities.Property.filter(
          { created_by_id: id, approval_status: "APPROVED", status: "Activ" },
          "-created_date",
          100
        );
        if (!cancelled) setProperties(list);
      } catch (e) {
        if (!cancelled) setProperties([]);
      } finally {
        if (!cancelled) setLoadingProps(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tab, id]);

  // Check if profile is saved by current user
  useEffect(() => {
    if (!user || !id || user.id === id) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await base44.entities.SavedProfile.filter(
          { user_id: user.id, target_user_id: id },
          "-created_date",
          1
        );
        if (!cancelled) setProfileSaved(list.length > 0);
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, [user, id]);

  const handleMessage = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      const existing = await base44.entities.Conversation.filter(
        { $or: [
          { buyer_id: user.id, seller_id: id },
          { buyer_id: id, seller_id: user.id },
        ]},
        "-created_date",
        1
      );
      if (existing.length > 0) {
        navigate(`/messages/${existing[0].id}`);
      } else {
        const conv = await base44.entities.Conversation.create({
          property_id: "direct",
          property_title: profile?.full_name || "Conversație directă",
          buyer_id: user.id,
          buyer_name: user.full_name || user.email,
          seller_id: id,
          seller_name: profile?.full_name || profile?.email || "Utilizator",
        });
        navigate(`/messages/${conv.id}`);
      }
    } catch (e) {
      toast({ title: t("pc_err_msg"), variant: "destructive" });
    }
  };

  const toggleSaveProfile = async () => {
    if (!user) { navigate("/login"); return; }
    setSavingProfile(true);
    try {
      if (profileSaved) {
        const list = await base44.entities.SavedProfile.filter(
          { user_id: user.id, target_user_id: id },
          "-created_date",
          10
        );
        for (const s of list) await base44.entities.SavedProfile.delete(s.id);
        setProfileSaved(false);
        toast({ title: en ? "Profile removed" : "Profil eliminat" });
      } else {
        await base44.entities.SavedProfile.create({ user_id: user.id, target_user_id: id });
        setProfileSaved(true);
        toast({ title: en ? "Profile saved" : "Profil salvat" });
      }
    } catch (e) {
      toast({ title: t("pc_err_msg"), variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const shareProfile = async () => {
    const url = window.location.href;
    const shareData = {
      title: profile?.full_name || "Profil VerifiCasa",
      text: en ? `Check out ${profile?.full_name}'s profile on VerifiCasa` : `Profilul lui ${profile?.full_name} pe VerifiCasa`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        toast({ title: en ? "Link copied" : "Link copiat" });
      }
    } catch (e) {
      try {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        toast({ title: en ? "Link copied" : "Link copiat" });
      } catch {}
    }
  };

  const isOwnProfile = user?.id === id;
  const isAgent = profile?.seller_type === "Agent" || (profile?.role || "").toUpperCase() === "AGENT";
  const memberSince = profile?.created_date
    ? new Date(profile.created_date).toLocaleDateString(dateLocale, { month: "long", year: "numeric" })
    : "";
  const lastActive = profile?.last_active
    ? new Date(profile.last_active).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })
    : "";

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-40 w-full rounded" />
        <Skeleton className="mt-4 h-12 w-64 rounded" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded" />)}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="font-heading text-2xl font-bold text-navy dark:text-foreground">{t("not_found")}</p>
        <Button asChild className="mt-4 bg-emerald text-primary-foreground"><Link to="/">{t("back_home")}</Link></Button>
      </div>
    );
  }

  // Progressive stars: average already starts at 1.0 and grows with reviews
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Link to="/search" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-navy dark:hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("up_back")}
      </Link>

      {/* Profile header with cover image */}
      <div className="mt-4 overflow-hidden rounded border border-border bg-white shadow-soft dark:bg-card">
        <div className="relative h-32 sm:h-40">
          {profile.cover_image_url ? (
            <UIImage src={profile.cover_image_url} fittingType="fill" className="h-full w-full" />
          ) : (
            <div className="h-full w-full bg-emerald" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <div className="px-4 pb-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="-mt-12 h-20 w-20 shrink-0 rounded-full border-4 border-white object-cover dark:border-card sm:-mt-14 sm:h-24 sm:w-24" />
              ) : (
                <span className={`-mt-12 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white text-2xl font-bold text-white dark:border-card sm:-mt-14 sm:h-24 sm:w-24 ${isAgent ? "bg-blue-600" : "bg-emerald"}`}>
                  {initials(profile.full_name || profile.email)}
                </span>
              )}
              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-xl font-bold text-navy dark:text-foreground sm:text-2xl">{profile.full_name || profile.email}</h1>
                  {profile.is_verified && (
                    <span className="flex items-center gap-1 rounded bg-emerald-soft px-2 py-0.5 text-[11px] font-bold text-emerald">
                      <BadgeCheck className="h-3.5 w-3.5" /> {t("up_verified_landlord")}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className={`inline-block h-2 w-2 rounded-full ${isAgent ? "bg-blue-500" : "bg-emerald"}`} />
                    {isAgent ? t("up_agent") : t("up_landlord")}
                  </span>
                  {isAgent && profile.agency_name && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" /> {profile.agency_name}
                    </span>
                  )}
                </div>
                {/* Rating — progressive stars, starts at 1.0 */}
                <div className="mt-1.5 flex items-center gap-2">
                  <RatingStars rating={average} size="sm" showNumber />
                  <span className="text-xs text-muted-foreground">
                    {count > 0
                      ? (count === 1 ? t("up_review_singular", { count }) : t("up_reviews_count", { count }))
                      : (en ? "No reviews yet" : "Fără recenzii")}
                  </span>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex shrink-0 flex-wrap gap-2">
              {!isOwnProfile && (
                <Button onClick={handleMessage} className="gap-2 bg-emerald text-white shadow-soft hover:bg-emerald/90">
                  <MessageCircle className="h-4 w-4" /> {t("up_send_message")}
                </Button>
              )}
              {!isOwnProfile && user && (
                <Button onClick={() => setShowReviewModal(true)} variant="outline" className="gap-2 border-emerald/30 text-emerald hover:bg-emerald-soft">
                  <Star className="h-4 w-4" /> {t("up_leave_review")}
                </Button>
              )}
              {!isOwnProfile && user && (
                <Button
                  onClick={toggleSaveProfile}
                  disabled={savingProfile}
                  variant="outline"
                  className={`gap-2 ${profileSaved ? "border-emerald bg-emerald-soft text-emerald" : "border-border text-muted-foreground hover:border-emerald/50"}`}
                >
                  {profileSaved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  <span className="hidden sm:inline">{profileSaved ? (en ? "Saved" : "Salvat") : (en ? "Save" : "Salvează")}</span>
                </Button>
              )}
              <Button
                onClick={shareProfile}
                variant="outline"
                className="gap-2 border-border text-muted-foreground hover:border-emerald/50 hover:text-emerald"
              >
                {shared ? <Check className="h-4 w-4 text-emerald" /> : <Share2 className="h-4 w-4" />}
                <span className="hidden sm:inline">{en ? "Share" : "Distribuie"}</span>
              </Button>
              <Button
                onClick={() => setShowBusinessCard(true)}
                variant="outline"
                className="gap-2 border-border text-muted-foreground hover:border-emerald/50 hover:text-emerald"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">{en ? "Business card" : "Card de vizită"}</span>
              </Button>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-sm text-foreground/70">{profile.bio}</p>
          )}

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {memberSince && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {t("up_member_since")} {memberSince}
              </span>
            )}
            {lastActive && profile.show_activity_status !== false && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald" /> {t("up_last_active")} {lastActive}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("listings")}
          className={`relative px-4 py-2.5 text-sm font-semibold transition ${tab === "listings" ? "text-emerald" : "text-muted-foreground hover:text-foreground"}`}
        >
          {t("up_tab_listings")}
          {properties.length > 0 && <span className="ml-1.5 text-xs">({properties.length})</span>}
          {tab === "listings" && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald" />}
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`relative px-4 py-2.5 text-sm font-semibold transition ${tab === "reviews" ? "text-emerald" : "text-muted-foreground hover:text-foreground"}`}
        >
          {t("up_tab_reviews")}
          {count > 0 && <span className="ml-1.5 text-xs">({count})</span>}
          {tab === "reviews" && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald" />}
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-5">
        {tab === "listings" && (
          loadingProps ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald" /></div>
          ) : properties.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">{t("up_no_listings")}</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => <PropertyCard key={p.id} property={p} coverMap={coverMap} />)}
            </div>
          )
        )}

        {tab === "reviews" && (
          loadingRatings ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald" /></div>
          ) : count === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex justify-center"><RatingStars rating={1} size="lg" /></div>
              <p className="mt-3 text-sm text-muted-foreground">{t("up_no_reviews")}</p>
              {!isOwnProfile && user && (
                <Button onClick={() => setShowReviewModal(true)} variant="outline" className="mt-4 gap-2 border-emerald/30 text-emerald">
                  <Plus className="h-4 w-4" /> {t("up_leave_review")}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Breakdown */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 rounded border border-border bg-white p-5 dark:bg-card">
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-4xl font-bold text-navy dark:text-foreground">{average.toFixed(1)}</span>
                    <div>
                      <RatingStars rating={average} size="sm" />
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {count === 1 ? t("up_review_singular", { count }) : t("up_reviews_count", { count })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("up_rating_breakdown")}</p>
                    <RatingBreakdown distribution={distribution} total={count} />
                  </div>
                </div>
              </div>
              {/* Review list */}
              <div className="space-y-3 lg:col-span-2">
                {ratings.map((r) => <ReviewItem key={r.id} review={r} isOwner={isOwnProfile} />)}
              </div>
            </div>
          )
        )}
      </div>

      {showReviewModal && (
        <ReviewModal targetUser={profile} onClose={() => setShowReviewModal(false)} />
      )}
      {showBusinessCard && (
        <BusinessCard user={profile} ratings={ratings} average={average} count={count} onClose={() => setShowBusinessCard(false)} />
      )}
    </div>
  );
}