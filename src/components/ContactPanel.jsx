import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Phone, ShieldCheck, BadgeCheck, Clock, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";
import { initials } from "@/lib/chatUtils";
import RatingStars from "@/components/RatingStars";
import ReviewModal from "@/components/ReviewModal";

// Panou de contact redesignat — fără formular, doar chat + telefon.
// Înlocuiește vechiul formular de „pre-calificare" cu un card curat tip Zillow.
export default function ContactPanel({ property, ownerUser, onMessage }) {
  const { t } = useCountry();
  const { user } = useAuth();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const p = property;
  const sellerName = p.posted_by_name || p.owner_name || ownerUser?.full_name || "Proprietar";
  const sellerRole = p.seller_role || (p.owner_verified ? "Proprietar" : "Agent");
  const isProprietar = sellerRole === "Proprietar";
  const avatarUrl = ownerUser?.avatar_url;
  const targetUserId = p.created_by_id || ownerUser?.id;
  const callPhone = (p.phone || "").replace(/\D/g, "");
  const waPhone = (p.whatsapp_phone || p.phone || "").replace(/\D/g, "");
  const hasPhone = !!callPhone && callPhone.length >= 6;
  const hasWhatsApp = !!waPhone && waPhone.length >= 6;

  // Fetch rating for this owner
  const [ratings, setRatings] = useState([]);
  useEffect(() => {
    if (!targetUserId) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await base44.entities.Rating.filter({ target_user_id: targetUserId }, "-created_date", 200);
        if (!cancelled) setRatings(list);
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, [targetUserId]);

  const { average, count } = useMemo(() => {
    const c = ratings.length;
    if (c === 0) return { average: 0, count: 0 };
    const sum = ratings.reduce((a, r) => a + (r.rating || 0), 0);
    return { average: sum / c, count: c };
  }, [ratings]);

  const trustMarkers = [
    p.owner_verified && { icon: BadgeCheck, text: t("badge_owner_v") },
    typeof p.trust_score === "number" && p.trust_score >= 40 && { icon: ShieldCheck, text: t("pd_trust_inspection") },
    { icon: Clock, text: t("pd_trust_response") },
  ].filter(Boolean);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-white shadow-soft dark:bg-card">
      <div className="h-[2px] bg-emerald" />
      <div className="p-5 sm:p-6">
      <h3 className="font-heading text-base font-bold text-navy dark:text-foreground">{t("contact_h")}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{t("contact_sub")}</p>

      {/* Agent identity */}
      <Link to={targetUserId ? `/profile/${targetUserId}` : "#"} className="mt-4 flex items-center gap-3 rounded-xl p-1.5 -m-1.5 transition-colors duration-200 hover:bg-secondary/50">
        <span className="relative shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={sellerName} className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald/20" />
          ) : (
            <span className={`flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white ring-2 ring-emerald/20 ${isProprietar ? "bg-emerald" : "bg-navy"}`}>
              {initials(sellerName)}
            </span>
          )}
          {p.owner_verified && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-white ring-2 ring-white dark:ring-card">
              <BadgeCheck className="h-3 w-3" />
            </span>
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-bold text-navy hover:text-emerald dark:text-foreground">{sellerName}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className={`inline-block h-2 w-2 rounded-full ${isProprietar ? "bg-emerald" : "bg-navy"}`} />
            {isProprietar ? t("pc_seller_landlord") : t("pc_seller_agent")}
          </p>
          {count > 0 && (
            <div className="mt-0.5 flex items-center gap-1">
              <RatingStars rating={average} size="sm" showNumber />
              <span className="text-xs text-muted-foreground">({count})</span>
            </div>
          )}
          {count === 0 && (
            <p className="mt-0.5 text-xs text-muted-foreground">{t("up_no_reviews")}</p>
          )}
        </div>
      </Link>

      {/* Primary CTA */}
      <Button onClick={onMessage} className="mt-4 w-full gap-2" size="lg">
        <MessageCircle className="h-5 w-5" /> {t("pd_msg_btn")}
      </Button>

      {/* Secondary actions */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {hasPhone ? (
          <Button asChild variant="outline" className="gap-1.5 border-emerald/30 text-emerald hover:bg-emerald-soft">
            <a href={`tel:${callPhone}`}><Phone className="h-4 w-4" /> {t("pc_call")}</a>
          </Button>
        ) : (
          <Button variant="outline" disabled className="gap-1.5 border-border text-muted-foreground">
            <Phone className="h-4 w-4" /> {t("pc_call")}
          </Button>
        )}
        {hasWhatsApp ? (
          <Button asChild variant="outline" className="gap-1.5 border-emerald/30 text-emerald hover:bg-emerald-soft">
            <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </Button>
        ) : (
          <Button variant="outline" disabled className="gap-1.5 border-border text-muted-foreground">
            WhatsApp
          </Button>
        )}
      </div>

      <div className="mt-4" />

      {/* Trust markers — ruled rows */}
      <div className="divide-y divide-border border-y border-border">
        {trustMarkers.map((m, i) => (
          <div key={i} className="flex items-baseline gap-2 py-2 text-xs font-medium text-foreground/75">
            <span aria-hidden="true" className="font-mono text-emerald">✓</span>
            {m.text}
          </div>
        ))}
      </div>

      <p className="stamp-line mt-4 text-center text-muted-foreground">{t("pd_trust_footer")}</p>

      {/* Leave review button — visible only for authenticated non-owner users */}
      {user && targetUserId && user.id !== targetUserId && ownerUser && (
        <button
          onClick={() => setShowReviewModal(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald/30 py-2 text-xs font-semibold text-emerald transition-colors duration-200 hover:bg-emerald-soft"
        >
          <Star className="h-3.5 w-3.5" /> {t("up_leave_review")}
        </button>
      )}

      {showReviewModal && ownerUser && (
        <ReviewModal targetUser={ownerUser} onClose={() => setShowReviewModal(false)} />
      )}
      </div>
    </div>
  );
}