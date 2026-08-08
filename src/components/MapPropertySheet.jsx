import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Maximize, ArrowRight, ShieldCheck, BedDouble } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";

// Sliding bottom-sheet preview shown when tapping a property pin on mobile.
// Mini-card compact: imagine, badge Verificat, titlu, preț, specificații, 1 buton.
export default function MapPropertySheet({ property, onClose, lang }) {
  const { formatPrice } = useCountry();
  const en = lang === "en";
  const isVerified = property.owner_verified || property.verification_level === "field_certified" || property.ai_tour_verified;

  return (
    <AnimatePresence>
      {property && (
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
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="relative w-full rounded-t-3xl bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-2.5">
              <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            </div>
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full bg-secondary p-1.5 text-muted-foreground hover:bg-secondary/80"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex gap-3 p-4 pt-3">
              <Link to={`/property/${property.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                {property.images?.[0] ? (
                  <Image src={property.images[0]} fittingType="fill" className="h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                    <MapPin className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                {isVerified && (
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-emerald px-1.5 py-0.5 text-[9px] font-bold text-white shadow-soft">
                    <ShieldCheck className="h-2.5 w-2.5" /> {en ? "Verified" : "Verif."}
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-navy dark:text-foreground">
                  {formatPrice(property.price_monthly, property.currency)}
                </p>
                <p className="truncate text-sm font-semibold text-foreground">{property.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {property.city}
                  {property.zone ? `, ${property.zone}` : ""}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {property.rooms != null && (
                    <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {property.rooms} {en ? "r" : "cam."}</span>
                  )}
                  {property.surface_sqm && (
                    <span className="flex items-center gap-1"><Maximize className="h-3 w-3" /> {property.surface_sqm} mp</span>
                  )}
                  <span className="font-semibold text-emerald">
                    {property.transaction_type === "SALE"
                      ? en ? "Sale" : "Vânzare"
                      : en ? "Rent" : "Închiriere"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 px-4 pb-5">
              <Button asChild className="flex-1 gap-1.5 bg-emerald text-white hover:bg-emerald/90">
                <Link to={`/property/${property.id}`}>
                  {en ? "View details" : "Vezi detalii"} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}