import React from "react";

// VerifiCasa hero background — a bright, welcoming interior photo with a
// navy tint for legibility and a smooth fade into white at the bottom.
const HERO_PHOTO =
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80";

export default function HeroPhoto() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-navy-deep">
      <img src={HERO_PHOTO} alt="" aria-hidden="true" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/85 via-navy/65 to-navy/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-white sm:h-72" />
    </div>
  );
}