import React, { useState } from "react";
import { Star, X, Loader2, BadgeCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useCountry } from "@/components/CountryContext";
import { useHasConversation } from "@/hooks/useRatings";
import { StarPicker } from "@/components/RatingStars";
import { initials, avatarColor } from "@/lib/chatUtils";

// Modal for submitting a review about a user (owner/agent).
// Only authenticated users who had a conversation can leave a verified review.
export default function ReviewModal({ targetUser, onClose }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useCountry();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const hasConversation = useHasConversation(targetUser?.id, user?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: t("rv_select_rating"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Rating.create({
        target_user_id: targetUser.id,
        reviewer_user_id: user.id,
        reviewer_name: user.full_name || user.email,
        reviewer_avatar_url: user.avatar_url || "",
        rating,
        comment: comment.trim(),
        is_verified: hasConversation,
      });
      toast({ title: t("rv_submitted") });
      onClose();
    } catch (err) {
      toast({ title: t("rv_error"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-navy-deep/60 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 shadow-glow sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-navy dark:text-foreground">{t("rv_title")}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Target user */}
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
          {targetUser?.avatar_url ? (
            <img src={targetUser.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColor(targetUser?.id)}`}>
              {initials(targetUser?.full_name)}
            </span>
          )}
          <div>
            <p className="font-semibold text-navy dark:text-foreground">{targetUser?.full_name || targetUser?.email}</p>
            <p className="text-xs text-muted-foreground">{targetUser?.seller_type === "Agent" ? t("up_agent") : t("up_landlord")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star picker */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold text-navy dark:text-foreground">{t("rv_your_rating")}</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold text-navy dark:text-foreground">{t("rv_comment")} <span className="text-muted-foreground">({t("rv_optional")})</span></p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder={t("rv_comment_ph")}
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
            />
          </div>

          {/* Verified badge info */}
          {hasConversation && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-soft px-3 py-2 text-xs text-emerald">
              <BadgeCheck className="h-4 w-4" /> {t("rv_verified_expl")}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald py-3 text-sm font-bold text-white shadow-soft transition hover:bg-emerald/90 disabled:opacity-50"
          >
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("rv_submitting")}</> : <><Star className="h-4 w-4 fill-white" /> {t("rv_submit")}</>}
          </button>
        </form>
      </div>
    </div>
  );
}