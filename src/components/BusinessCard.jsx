import React, { useRef, useState } from "react";
import { Phone, MessageCircle, Mail, Download, X, BadgeCheck, Calendar } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { initials, avatarColor } from "@/lib/chatUtils";
import RatingStars from "@/components/RatingStars";

// Compact, professional business card modal for a user profile.
// Shows contact info, rating, reviews count, and key details.
export default function BusinessCard({ user: profile, ratings = [], average = 0, count = 0, onClose }) {
  const { t, lang } = useCountry();
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const en = lang === "en";
  const isAgent = profile?.seller_type === "Agent" || (profile?.role || "").toUpperCase() === "AGENT";

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `card-${(profile?.full_name || "verificasa").replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      // best-effort
    } finally {
      setDownloading(false);
    }
  };

  const phone = profile?.phone_public !== false ? profile?.phone : null;
  const whatsapp = profile?.whatsapp_visible !== false ? profile?.whatsapp_phone : null;
  const email = profile?.email || null;
  const memberSince = profile?.created_date
    ? new Date(profile.created_date).toLocaleDateString(en ? "en-GB" : "ro-RO", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-navy-deep/60 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        {/* The card itself */}
        <div
          ref={cardRef}
          className="overflow-hidden rounded-3xl border border-border bg-white shadow-glow dark:bg-card"
        >
          {/* Header band */}
          <div className="relative h-20 bg-gradient-to-r from-emerald to-emerald/80">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald/90 to-navy/40" />
            {profile?.cover_image_url && (
              <img src={profile.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            )}
          </div>

          {/* Avatar + name */}
          <div className="px-5 pb-5">
            <div className="-mt-10 flex items-end gap-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-2xl border-4 border-white object-cover dark:border-card" />
              ) : (
                <span className={`flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white text-xl font-bold text-white dark:border-card ${isAgent ? "bg-blue-600" : "bg-emerald"}`}>
                  {initials(profile?.full_name || profile?.email)}
                </span>
              )}
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-heading text-lg font-bold text-navy dark:text-foreground">{profile?.full_name || profile?.email}</h3>
                  {profile?.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isAgent ? t("up_agent") : t("up_landlord")}
                  {isAgent && profile?.agency_name ? ` · ${profile.agency_name}` : ""}
                </p>
              </div>
            </div>

            {/* Rating row */}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-soft/50 px-3 py-2">
              <RatingStars rating={count > 0 ? average : 1} size="sm" />
              <span className="text-sm font-semibold text-navy dark:text-foreground">
                {count > 0 ? average.toFixed(1) : "1.0"}
              </span>
              <span className="text-xs text-muted-foreground">
                · {count} {count === 1 ? (en ? "review" : "recenzie") : (en ? "reviews" : "recenzii")}
              </span>
            </div>

            {/* Contact rows */}
            <div className="mt-4 space-y-2">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition hover:border-emerald/40 hover:bg-emerald-soft/30">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{en ? "Phone" : "Telefon"}</p>
                    <p className="truncate text-sm font-semibold text-navy dark:text-foreground">{phone}</p>
                  </div>
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition hover:border-emerald/40 hover:bg-emerald-soft/30">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">WhatsApp</p>
                    <p className="truncate text-sm font-semibold text-navy dark:text-foreground">+{whatsapp}</p>
                  </div>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition hover:border-emerald/40 hover:bg-emerald-soft/30">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                    <p className="truncate text-sm font-semibold text-navy dark:text-foreground">{email}</p>
                  </div>
                </a>
              )}
            </div>

            {/* Footer meta */}
            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
              {memberSince && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {t("up_member_since")} {memberSince}
                </span>
              )}
              <span className="font-semibold text-emerald">VerifiCasa</span>
            </div>
          </div>
        </div>

        {/* Actions below the card */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-white py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary dark:bg-card"
          >
            <span className="flex items-center justify-center gap-1.5">
              <X className="h-4 w-4" /> {en ? "Close" : "Închide"}
            </span>
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 rounded-xl bg-emerald py-2.5 text-sm font-semibold text-white hover:bg-emerald/90 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-1.5">
              <Download className="h-4 w-4" /> {downloading ? (en ? "..." : "...") : (en ? "Download" : "Descarcă")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}