import React, { useRef, useState } from "react";
import { Phone, MessageCircle, Mail, Download, X, BadgeCheck, Calendar, Globe } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { initials } from "@/lib/chatUtils";
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

  const phone = profile?.phone || null;
  const whatsapp = profile?.whatsapp_phone || null;
  const email = profile?.email || null;
  const memberSince = profile?.created_date
    ? new Date(profile.created_date).toLocaleDateString(en ? "en-GB" : "ro-RO", { month: "long", year: "numeric" })
    : "";

  const contactRows = [
    phone && {
      icon: Phone,
      label: en ? "Phone" : "Telefon",
      value: phone,
      href: `tel:${phone.replace(/\D/g, "")}`,
    },
    whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: whatsapp.startsWith("+") ? whatsapp : `+${whatsapp}`,
      href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
    },
    email && {
      icon: Mail,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
    },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-navy-deep/70 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        {/* The card itself */}
        <div
          ref={cardRef}
          className="overflow-hidden rounded-3xl border border-border bg-white shadow-glow dark:bg-card"
        >
          {/* Header — cover image with guaranteed object-fit to prevent squashing */}
          <div className="relative h-36 w-full overflow-hidden bg-navy">
            {profile?.cover_image_url ? (
              <img
                src={profile.cover_image_url}
                alt=""
                className="absolute inset-0 h-full w-full"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            ) : (
              <div className="absolute inset-0 gradient-navy" />
            )}
            {/* Subtle dark gradient at bottom so avatar/name pop, no green tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/25 to-transparent" />
          </div>

          {/* Avatar + name — circular avatar overlapping the header */}
          <div className="px-5 pb-4">
            <div className="-mt-14 flex items-end gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-full border-4 border-white shadow-soft dark:border-card"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              ) : (
                <span className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white text-2xl font-bold text-white shadow-soft dark:border-card ${isAgent ? "bg-blue-600" : "bg-emerald"}`}>
                  {initials(profile?.full_name || profile?.email)}
                </span>
              )}
              <div className="min-w-0 flex-1 pb-2">
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

            {/* Rating row — clean pill */}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 dark:bg-secondary/30">
              <RatingStars rating={count > 0 ? average : 1} size="sm" />
              <span className="text-sm font-semibold text-navy dark:text-foreground">
                {count > 0 ? average.toFixed(1) : "1.0"}
              </span>
              <span className="text-xs text-muted-foreground">
                · {count} {count === 1 ? (en ? "review" : "recenzie") : (en ? "reviews" : "recenzii")}
              </span>
            </div>

            {/* Contact rows — clean, well-spaced */}
            {contactRows.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {contactRows.map((row, i) => {
                  const Ico = row.icon;
                  return (
                    <a
                      key={i}
                      href={row.href}
                      target={row.href.startsWith("http") ? "_blank" : undefined}
                      rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition hover:border-emerald/40 hover:bg-emerald-soft/30"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                        <Ico className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{row.label}</p>
                        <p className="truncate text-sm font-semibold text-navy dark:text-foreground">{row.value}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {/* Footer meta */}
            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
              {memberSince && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {t("up_member_since")} {memberSince}
                </span>
              )}
              <span className="flex items-center gap-1 font-semibold text-emerald">
                <Globe className="h-3 w-3" /> VerifiCasa
              </span>
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
              <Download className="h-4 w-4" /> {downloading ? "..." : (en ? "Download" : "Descarcă")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}