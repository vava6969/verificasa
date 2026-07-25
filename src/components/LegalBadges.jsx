import React from "react";
import { ExternalLink } from "lucide-react";
import { Image } from "@/components/ui/image";

/**
 * Legal compliance badges for the footer (ANPC SAL + EU ODR).
 * Small, transparent-looking clickable images that blend with the dark navy footer.
 */
const badges = [
  {
    href: "https://anpc.ro/ce-este-sal/",
    src: "https://media.base44.com/images/public/6a5ef7d63008cd71560dfe14/3c60c8818_image.png",
    alt: "ANPC · Soluționarea alternativă a litigiilor",
  },
  {
    href: "https://consumer-redress.ec.europa.eu/site-relocation_en",
    src: "https://media.base44.com/images/public/6a5ef7d63008cd71560dfe14/73106bd1d_image.png",
    alt: "Soluționarea online a litigiilor (ODR · UE)",
  },
];

export default function LegalBadges() {
  return (
    <div className="mt-5 space-y-2.5">
      {badges.map((b) => (
        <a
          key={b.href}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          title={b.alt}
          className="group block w-44 overflow-hidden rounded-lg border border-white/15 bg-white/95 opacity-90 transition hover:opacity-100 hover:border-emerald/60 hover:shadow-soft"
        >
          <Image
            src={b.src}
            alt={b.alt}
            fittingType="fit"
            className="w-full"
          />
        </a>
      ))}
    </div>
  );
}