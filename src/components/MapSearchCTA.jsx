import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useCountry } from "@/components/CountryContext";
import { Button } from "@/components/ui/button";

// Promotional card on the homepage: "Toate proprietățile pe hartă" → /map
export default function MapSearchCTA() {
  const { lang } = useCountry();
  const en = lang === "en";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft dark:border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center">
        {/* Illustration */}
        <div className="relative flex h-36 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-soft to-gold-soft sm:h-40 sm:w-52 sm:shrink-0 dark:from-emerald/10 dark:to-gold/10">
          {/* Decorative map pins */}
          <span className="absolute left-5 top-5 h-3 w-3 rounded-full bg-rose-500/70 shadow-sm" />
          <span className="absolute right-6 top-8 h-2.5 w-2.5 rounded-full bg-rose-500/50" />
          <span className="absolute bottom-6 left-10 h-2.5 w-2.5 rounded-full bg-rose-500/60" />
          <span className="absolute bottom-8 right-10 h-3 w-3 rounded-full bg-rose-500/70 shadow-sm" />
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-8 translate-y-4 rounded-full bg-rose-500/40" />
          {/* Central map icon */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald/30 bg-white/70 backdrop-blur-sm dark:bg-white/10">
            <MapPin className="h-10 w-10 text-emerald" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 text-center sm:p-6 sm:text-left">
          <h3 className="font-heading text-lg font-bold text-navy sm:text-xl dark:text-foreground">
            {en ? "All properties on the map" : "Toate proprietățile pe hartă"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {en
              ? "Quickly see prices and how properties look in each area."
              : "Vezi rapid care sunt prețurile și cum arată proprietățile din jur."}
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-3 gap-2 rounded-full border-2 border-emerald bg-transparent text-emerald hover:bg-emerald-soft"
          >
            <Link to="/map">
              <MapPin className="h-4 w-4" /> {en ? "View map" : "Vezi harta"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}