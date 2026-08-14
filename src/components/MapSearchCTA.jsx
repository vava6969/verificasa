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
    <div className="group relative overflow-hidden rounded-2xl border border-border shadow-soft dark:border-white/10">
      {/* Full-bleed illustration — generată cu Higgsfield, tema hartă/verificare */}
      <img
        src="/images/generated/map-search-cta-v3.png"
        alt="Toate proprietățile pe hartă"
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Gradient scrim so the text stays readable over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/10" />

      {/* Content */}
      <div className="relative flex min-h-[230px] flex-col justify-end p-6 sm:min-h-[270px] sm:p-8">
        <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
          {en ? "All properties on the map" : "Toate proprietățile pe hartă"}
        </h3>
        <p className="mt-1 max-w-md text-sm text-white/80">
          {en
            ? "Quickly see prices and how properties look in each area."
            : "Vezi rapid care sunt prețurile și cum arată proprietățile din jur."}
        </p>
        <Button
          asChild
          className="mt-4 w-fit gap-2 rounded-full bg-mint text-navy hover:bg-mint/90"
        >
          <Link to="/map">
            <MapPin className="h-4 w-4" /> {en ? "View map" : "Vezi harta"}
          </Link>
        </Button>
      </div>
    </div>
  );
}