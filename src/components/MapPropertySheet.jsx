import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Image } from "@/components/ui/image";
import { Stamp, Frank, PhotoMark } from "@/components/fisa";

const EASE = [0.16, 1, 0.3, 1];

// Fișa scurtă care urcă de jos când atingi o ștampilă pe hartă. Formă de
// registru: panou solid, colț drept sus, fapte pe un rând tabular.
export default function MapPropertySheet({ property, onClose, lang }) {
  const { formatPrice } = useCountry();
  const en = lang === "en";
  const p = property;
  const isVerified =
    p?.owner_verified || p?.verification_level === "field_certified" || p?.ai_tour_verified;
  const boosted = p?.boost_active || p?.featured;
  const boostUntil = p?.boost_ends_date
    ? new Date(p.boost_ends_date).toLocaleDateString(en ? "en-GB" : "ro-RO", { day: "2-digit", month: "short" })
    : null;

  return (
    <AnimatePresence>
      {p && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[1200] flex items-end bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.42, ease: EASE }}
            className="relative w-full border-t border-border bg-background pb-[max(env(safe-area-inset-bottom),12px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-2.5">
              <div className="h-1 w-10 rounded-sm bg-border" />
            </div>
            <button
              onClick={onClose}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:bg-secondary"
              aria-label={en ? "Close" : "Închide"}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex gap-3 p-4 pt-3">
              <Link to={`/property/${p.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden border border-border">
                {p.images?.[0] ? (
                  <Image src={p.images[0]} fittingType="fill" className="h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                    <span className="text-[10px] text-muted-foreground">—</span>
                  </div>
                )}
                {p.surface_sqm != null && (
                  <>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/55 to-transparent" />
                    <PhotoMark className="bottom-1 left-1.5">{p.surface_sqm} MP</PhotoMark>
                  </>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <p className="font-heading text-xl font-semibold text-foreground tnum">
                  {formatPrice(p.price_monthly, p.currency)}
                </p>
                <p className="truncate text-sm font-semibold text-foreground">{p.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {p.city}{p.zone ? `, ${p.zone}` : ""}
                </p>

                <dl className="mt-1.5 flex flex-wrap items-baseline gap-x-3 text-xs">
                  {p.rooms != null && (
                    <div className="flex items-baseline gap-1">
                      <dt className="text-muted-foreground">{en ? "rooms" : "cam."}</dt>
                      <dd className="font-semibold tnum">{p.rooms}</dd>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <dt className="text-muted-foreground">{en ? "type" : "tip"}</dt>
                    <dd className="font-semibold">
                      {p.transaction_type === "SALE" ? (en ? "Sale" : "Vânzare") : (en ? "Rent" : "Închiriere")}
                    </dd>
                  </div>
                </dl>

                {(isVerified || boosted) && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {isVerified && <Stamp tone="verde">{en ? "Verified" : "Verificat"}</Stamp>}
                    {boosted && <Frank until={boostUntil} />}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 pb-4">
              <Link
                to={`/property/${p.id}`}
                className="flex min-h-[44px] w-full items-center justify-center rounded bg-emerald px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-emerald/90"
              >
                {en ? "Open the record" : "Deschide fișa"} <span className="ml-1.5" aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
