import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
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
        <div className="overflow-hidden rounded-xl bg-slate-50 sm:shrink-0">
          <Image
            src="https://media.base44.com/images/public/6a5ef7d63008cd71560dfe14/c39d91807_image.png"
            alt="Toate proprietățile pe hartă"
            fittingType="fill"
            className="h-36 w-full sm:h-44 sm:w-56"
          />
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