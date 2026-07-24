import React from "react";

// VerifiCasa hero background — a warm, inviting Romanian apartment interior
// with a navy tint for text legibility and a smooth fade into white at the
// bottom so the hero blends into the page below.
const HERO_PHOTO =
  "https://media.base44.com/images/public/6a5ef7d63008cd71560dfe14/b41689aa7_generated_image.png";

export default function HeroPhoto() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-deep">
      <img src={HERO_PHOTO} alt="Interior apartament modern VerifiCasa" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-navy/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/70 via-navy/40 to-navy/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-white sm:h-72" />
    </div>
  );
}