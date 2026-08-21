import React from "react";
import { cn } from "@/lib/utils";
import { isImplausible } from "@/lib/listingSanity";

// Insignele care stau PE fotografia unui card. Fiecare e o pastilă solidă cu
// iconița lucioasă a aplicației — aceeași limbă vizuală ca insignele de plan,
// nu contururi desenate cu linie. Sunt intenționat mari: pe telefon trebuie să
// se citească dintr-o privire, nu să fie descifrate.

const KINDS = {
  // Fundal închis, nu auriu: iconița e din aur lucios și dispare pe auriu.
  promovat: {
    img: "/images/generated/badge-promovat.png",
    label: { ro: "Promovat", en: "Promoted" },
    className: "bg-[#1E1608]/95 text-[#F5CE7C] shadow-[0_1px_4px_rgba(0,0,0,0.4)]",
  },
  verificat: {
    img: "/images/generated/plan-badge-basic-v2.png",
    label: { ro: "Verificat", en: "Verified" },
    className: "bg-white text-[#12603D] shadow-[0_1px_3px_rgba(0,0,0,0.22)] dark:bg-neutral-900 dark:text-emerald",
  },
  agent: {
    img: "/images/generated/plan-badge-agent-v2.png",
    label: { ro: "Agent", en: "Agent" },
    className: "bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.22)] dark:bg-neutral-900 dark:text-white",
  },
  pro: {
    img: "/images/generated/plan-badge-pro-v2.png",
    label: { ro: "Pro", en: "Pro" },
    className: "bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.22)] dark:bg-neutral-900 dark:text-white",
  },
  basic: {
    img: "/images/generated/plan-badge-basic-v2.png",
    label: { ro: "Basic", en: "Basic" },
    className: "bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.22)] dark:bg-neutral-900 dark:text-white",
  },
};

const SIZES = {
  sm: { chip: "h-6 gap-1 pl-1 pr-2.5 text-[11px]", img: "h-4 w-4" },
  md: { chip: "h-7 gap-1.5 pl-1 pr-3 text-xs", img: "h-5 w-5" },
  lg: { chip: "h-8 gap-1.5 pl-1.5 pr-3.5 text-[13px]", img: "h-6 w-6" },
};

export function PropertyBadge({ kind, size = "md", lang = "ro", className, children }) {
  const meta = KINDS[kind];
  if (!meta) return null;
  const s = SIZES[size] || SIZES.md;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold leading-none",
        s.chip,
        meta.className,
        className
      )}
    >
      <img
        src={meta.img}
        alt=""
        aria-hidden="true"
        className={cn("shrink-0 object-contain", s.img)}
        loading="lazy"
      />
      {children || (lang === "en" ? meta.label.en : meta.label.ro)}
    </span>
  );
}

/**
 * Rândul standard de insigne pentru un card: promovarea întâi (e plătită și
 * trebuie declarată), apoi cine a postat, apoi verificarea.
 *
 * Verificarea se citește din `verification_level`, nu din `trust_score`:
 * scorul se calculează într-o funcție de backend care nu a rulat încă pe
 * anunțurile existente, deci ar lăsa aproape toate anunțurile fără insignă,
 * deși 27 dintre ele chiar sunt verificate.
 */
export function PropertyBadgeRow({ property, planId, size = "md", lang = "ro", className }) {
  const boosted = property?.boost_active || property?.featured;
  const isAgent = property?.seller_role === "Agent";
  // Un anunț implauzibil (preț de sute de mii, o cameră pe 345 mp) nu are voie
  // să poarte „Verificat", oricât de mare i-ar fi scorul din date.
  const verified =
    !isImplausible(property) &&
    ((property?.verification_level && property.verification_level !== "unverified") ||
      (typeof property?.trust_score === "number" && property.trust_score >= 40));
  const plan = planId && KINDS[planId] ? planId : null;

  if (!boosted && !verified && !isAgent && !plan) return null;

  return (
    <div className={cn("pointer-events-none flex flex-wrap items-center gap-1.5", className)}>
      {boosted && <PropertyBadge kind="promovat" size={size} lang={lang} />}
      {isAgent && <PropertyBadge kind="agent" size={size} lang={lang} />}
      {verified && <PropertyBadge kind="verificat" size={size} lang={lang} />}
      {plan && !boosted && !isAgent && <PropertyBadge kind={plan} size={size} lang={lang} />}
    </div>
  );
}

export default PropertyBadge;
