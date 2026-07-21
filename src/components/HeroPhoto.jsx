import React from "react";

// Ambient hero background (static photo) with a navy tint for legibility and a
// smooth fade into white at the bottom, so the hero blends into the page below.
const HERO_PHOTO =
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80";

export default function HeroPhoto() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-navy-deep">
      {/* Background photo (stock, decorative) */}
      <img
        src={HERO_PHOTO}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover"
      />

      {/* Navy tint for legibility + depth (kept airy so the photo breathes) */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/75 via-navy/55 to-navy/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/50 to-transparent" />

      {/* Smooth fade into white at the bottom — blends the photo into the page */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-white sm:h-64" />
    </div>
  );
}