import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Phone, ShieldCheck, BadgeCheck, Clock, Home, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";
import { initials, avatarColor } from "@/lib/chatUtils";
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
    if (c === 0) return { average: 1, count: 0 };
    const sum = ratings.reduce((a, r) => a + (r.rating || 0), 0);
    return { average: (sum + 1) / (c + 1), count: c };
  }, [ratings]);

  const trustMarkers = [
    p.owner_verified && { icon: BadgeCheck, text: t("badge_owner_v") },
    (p.verification_level === "field_certified" || p.inspection_report_url) && { icon: Home, text: t("pd_trust_inspection") },
    { icon: Clock, text: t("pd_trust_response") },
  ].filter(Boolean);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft dark:bg-card sm:p-6">
      <h3 className="font-heading text-base font-bold text-navy dark:text-foreground">{t("contact_h")}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{t("contact_sub")}</p>

      {/* Agent identity */}
      <Link to={targetUserId ? `/profile/${targetUserId}` : "#"} className="mt-4 flex items-center gap-3 rounded-xl p-1 -m-1 transition hover:bg-secondary/50">
        {avatarUrl ? (
          <img src={avatarUrl} alt={sellerName} className="h-14 w-14 shrink-0 rounded-full object-cover" />
        ) : (
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${isProprietar ? "bg-emerald" : "bg-blue-600"}`}>
            {initials(sellerName)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-bold text-navy hover:text-emerald dark:text-foreground">{sellerName}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className={`inline-block h-2 w-2 rounded-full ${isProprietar ? "bg-emerald" : "bg-blue-500"}`} />
            {isProprietar ? t("pc_seller_landlord") : t("pc_seller_agent")}
          </p>
          {count > 0 && (
            <div className="mt-0.5 flex items-center gap-1">
              <RatingStars rating={average} size="sm" showNumber />
              <span className="text-xs text-muted-foreground">({count})</span>
            </div>
          )}
          {count === 0 && (
            <div className="mt-0.5 flex items-center gap-1">
              <RatingStars rating={1} size="sm" />
              <span className="text-xs text-muted-foreground">{t("up_no_reviews")}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Primary CTA */}
      <Button onClick={onMessage} className="mt-4 w-full gap-2 bg-emerald text-white shadow-soft hover:bg-emerald/90" size="lg">
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

      {/* Separator */}
      <div className="my-4 h-px bg-border" />

      {/* Trust markers */}
      <ul className="space-y-2">
        {trustMarkers.map((m, i) => {
          const Ico = m.icon;
          return (
            <li key={i} className="flex items-center gap-2 text-xs text-foreground/70">
              <Ico className="h-4 w-4 shrink-0 text-emerald" /> {m.text}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald" /> {t("pd_trust_footer")}
      </div>

      {/* Leave review button — visible only for authenticated non-owner users */}
      {user && targetUserId && user.id !== targetUserId && ownerUser && (
        <button
          onClick={() => setShowReviewModal(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald/30 py-2 text-xs font-semibold text-emerald transition hover:bg-emerald-soft"
        >
          <Star className="h-3.5 w-3.5" /> {t("up_leave_review")}
        </button>
      )}

      {showReviewModal && ownerUser && (
        <ReviewModal targetUser={ownerUser} onClose={() => setShowReviewModal(false)} />
      )}
    </div>
  );
}