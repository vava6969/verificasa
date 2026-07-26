import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";
import { LOGO_URL } from "@/components/VerifiCasaLogo";
import { useToast } from "@/components/ui/use-toast";

// Generates a shareable Instagram/WhatsApp story card (PNG) for a property,
// featuring the VerifiCasa logo and a QR code linking back to the listing.
export default function ShareableStoryCard({ property, className = "" }) {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const { formatPrice } = useCountry();
  const { toast } = useToast();

  const p = property || {};
  const cover = p.images?.[0];
  const url = `${window.location.origin}/property/${p.id}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(url)}`;

  const isField = p.verification_level === "field_certified";
  const isVideo = !!p.ai_tour_verified;

  const chips = [];
  if (p.rooms != null) chips.push(`${p.rooms} camere`);
  if (p.surface_sqm != null) chips.push(`${p.surface_sqm} mp`);
  if (p.pet_friendly) chips.push("Pet friendly");
  if (p.furnished) chips.push("Mobilat");
  if (p.parking) chips.push("Parcare");

  const handleGenerate = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `verificasa-${p.id || "proprietate"}.png`;
      a.click();
      toast({ title: "Card generat", description: "Imaginea a fost descărcată — o poți partaja pe Instagram/WhatsApp." });
    } catch (e) {
      toast({ title: "Generare eșuată", description: "Încearcă din nou.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleGenerate}
        disabled={busy}
        variant="outline"
        className="w-full gap-1.5 border-emerald/40 text-emerald hover:bg-emerald-soft"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
        {busy ? "Generez..." : "Generează Card Partajabil"}
      </Button>

      {/* Offscreen card rendered for html2canvas capture */}
      <div className="pointer-events-none absolute -left-[9999px] top-0">
        <div
          ref={cardRef}
          style={{ width: 380, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
          className="overflow-hidden rounded-[28px] bg-white shadow-xl"
        >
          {cover ? (
            <div className="relative h-52 w-full">
              <img src={cover} crossOrigin="anonymous" alt={p.title} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-52 w-full" style={{ background: "linear-gradient(135deg,#1B222C,#00A859)" }} />
          )}

          {(isField || isVideo) && (
            <div className="px-5 pt-3">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: "#C5A059", color: "#1B222C" }}
              >
                {isField ? "🥇 VerifiCasa Certified" : "🟢 Verificat Video & AI"}
              </span>
            </div>
          )}

          <div className="px-5 pt-3">
            <h3 className="text-[18px] font-extrabold leading-tight" style={{ color: "#1B222C" }}>{p.title}</h3>
            <p className="mt-1 text-[12px]" style={{ color: "#5a6270" }}>
              {p.zone ? `${p.zone}, ` : ""}{p.city}, România
            </p>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-[24px] font-extrabold" style={{ color: "#1B222C" }}>
                {formatPrice(p.price_monthly, p.currency)}
              </span>
              <span className="text-[12px]" style={{ color: "#5a6270" }}>/lună</span>
            </div>

            {chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {chips.map((c, i) => (
                  <span key={i} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#E8F7EF", color: "#00A859" }}>
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 px-5 py-3" style={{ background: "#F4F1E8" }}>
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} crossOrigin="anonymous" alt="VerifiCasa" className="h-9 w-9 rounded-full object-cover" />
              <div className="leading-none">
                <span className="block text-[14px] font-extrabold tracking-tight" style={{ color: "#1B222C" }}>VerifiCasa</span>
                <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#C5A059" }}>Inspecții & Verificări</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <img src={qr} crossOrigin="anonymous" alt="QR" className="h-16 w-16" />
              <span className="mt-1 text-[7px] font-semibold uppercase tracking-wide" style={{ color: "#5a6270" }}>Scanează</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}