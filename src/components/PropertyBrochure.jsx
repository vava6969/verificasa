import { useState } from "react";
import { jsPDF } from "jspdf";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";
import { LOGO_URL } from "@/components/VerifiCasaLogo";
import { useToast } from "@/components/ui/use-toast";

const C = {
  navy: [27, 34, 44],
  gold: [197, 160, 89],
  emerald: [0, 168, 89],
  mute: [90, 98, 112],
  light: [240, 241, 243],
  white: [255, 255, 255],
  ink: [33, 33, 39],
};

// jsPDF's built-in Helvetica only encodes CP1252, which lacks Romanian
// diacritics (a, s, t). Strip them to ASCII so the PDF text renders cleanly.
const S = (s) => (s == null ? "" : String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

const verifLabel = (p) =>
  p.verification_level === "field_certified" ? "Pe teren (Certified)"
    : p.ai_tour_verified ? "Video & AI"
    : "Ne verificat";

async function urlToDataURL(url) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const imgFmt = (d) =>
  d.startsWith("data:image/png") ? "PNG"
    : d.startsWith("data:image/jpeg") || d.startsWith("data:image/jpg") ? "JPEG"
    : "PNG";

// Elegant multi-page PDF brochure (A4) with a navy header band, cover gallery,
// full property specs, features, description and a QR code linking to the live
// listing — a printable handout a visitor (or agent) can take offline.
export default function PropertyBrochure({ property, className = "" }) {
  const { formatPrice } = useCountry();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const p = property || {};
  const listingUrl = `${window.location.origin}/property/${p.id}`;

  const build = async () => {
    setBusy(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210, H = 297, M = 14, cw = W - M * 2;
      const fill = (c) => doc.setFillColor(c[0], c[1], c[2]);
      const txt = (c) => doc.setTextColor(c[0], c[1], c[2]);
      const draw = (c) => doc.setDrawColor(c[0], c[1], c[2]);
      let y = 0;

      // ---------- Header band ----------
      fill(C.navy); doc.rect(0, 0, W, 24, "F");
      let lx = M;
      const logo = await urlToDataURL(LOGO_URL);
      if (logo) { try { doc.addImage(logo, "PNG", M, 6, 12, 12); } catch {} lx = M + 16; }
      txt(C.white); doc.setFont("helvetica", "bold"); doc.setFontSize(16);
      doc.text(S("VerifiCasa"), lx, 13);
      txt(C.gold); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text(S("Inspectii & Verificari Imobiliare"), lx, 17.5);
      txt([200, 200, 200]); doc.setFontSize(8);
      doc.text(new Date().toLocaleDateString("ro-RO"), W - M, 13, { align: "right" });
      y = 32;

      // ---------- Title + location ----------
      txt(C.navy); doc.setFont("helvetica", "bold"); doc.setFontSize(17);
      const titleLines = doc.splitTextToSize(S(p.title || "Proprietate"), cw);
      doc.text(titleLines, M, y);
      y += titleLines.length * 6.2 + 1;

      txt(C.mute); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      const locParts = [p.zone, p.city, "Romania"].filter(Boolean).join(", ");
      doc.text(S(locParts), M, y); y += 5;
      if (p.landmark) { doc.text(S(`Reper: ${p.landmark}`), M, y); y += 5; }
      doc.setFontSize(8.5);
      doc.text(S(`Cod Proprietate: ${p.property_code || p.id}`), M, y); y += 8;

      // ---------- Price pill ----------
      const priceLbl = S(`${formatPrice(p.price_monthly, p.currency)}/luna`);
      doc.setFont("helvetica", "bold"); doc.setFontSize(14);
      const pw = doc.getTextWidth(priceLbl) + 8;
      fill(C.emerald); doc.roundedRect(M, y, pw, 9, 1.5, 1.5, "F");
      txt(C.white); doc.text(priceLbl, M + 4, y + 6.2);
      y += 14;

      // ---------- Cover + thumbnails ----------
      const imgs = (p.images || []).slice(0, 4);
      if (imgs.length) {
        const ch = 58;
        const cover = await urlToDataURL(imgs[0]);
        if (cover) {
          try { doc.addImage(cover, imgFmt(cover), M, y, cw, ch); } catch {}
        } else { fill(C.light); doc.rect(M, y, cw, ch, "F"); }
        draw(C.navy); doc.setLineWidth(0.3); doc.rect(M, y, cw, ch);
        y += ch + 4;
        const thumbs = imgs.slice(1, 4);
        if (thumbs.length) {
          const tw = (cw - (thumbs.length - 1) * 3) / thumbs.length;
          let tx = M;
          for (const tu of thumbs) {
            const td = await urlToDataURL(tu);
            if (td) { try { doc.addImage(td, imgFmt(td), tx, y, tw, 24); } catch {} }
            else { fill(C.light); doc.rect(tx, y, tw, 24, "F"); }
            draw(C.mute); doc.rect(tx, y, tw, 24);
            tx += tw + 3;
          }
          y += 28;
        }
      }

      // ---------- Specs grid ----------
      const specs = [
        ["Tip proprietate", p.property_type],
        ["Camere", p.rooms != null ? String(p.rooms) : "-"],
        ["Suprafata", p.surface_sqm != null ? `${p.surface_sqm} mp` : "-"],
        ["Etaj", p.floor || "-"],
        ["An constructie", p.building_year ? String(p.building_year) : "-"],
        ["Total etaje", p.total_floors != null ? String(p.total_floors) : "-"],
        ["Depozit", p.deposit != null ? formatPrice(p.deposit, p.currency) : "-"],
        ["Disponibil", p.available_from ? new Date(p.available_from).toLocaleDateString("ro-RO") : "Imediat"],
        ["Mobilat", p.furnished ? "Da" : "Nu"],
        ["Parcare", p.parking ? "Da" : "Nu"],
        ["Pet friendly", p.pet_friendly ? "Da" : "Nu"],
        ["Comision", p.commission_free ? "Fara comision" : "Standard"],
        ["Garantie", p.deposit_option === "verificasa_guarantee" ? "VerifiCasa (0)" : "Standard"],
        ["Verificare", verifLabel(p)],
      ];
      const block = (title, render) => {
        if (y > H - 70) { doc.addPage(); y = 20; }
        txt(C.navy); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        doc.text(S(title), M, y); y += 6;
        render();
      };
      block("Detalii proprietate", () => {
        doc.setFontSize(9);
        const colW = cw / 2;
        specs.forEach((s, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          const sx = M + col * colW;
          const sy = y + row * 6;
          txt(C.mute); doc.setFont("helvetica", "normal");
          doc.text(S(`${s[0]}:`), sx, sy);
          txt(C.ink); doc.setFont("helvetica", "bold");
          doc.text(S(String(s[1] || "-")), sx + 42, sy);
        });
        y += Math.ceil(specs.length / 2) * 6 + 3;
      });

      if (p.features?.length) {
        block("Facilitati", () => {
          doc.setFont("helvetica", "normal"); doc.setFontSize(8.8);
          txt(C.ink);
          const lines = doc.splitTextToSize(S(p.features.join("  -  ")), cw);
          doc.text(lines, M, y);
          y += lines.length * 4.6 + 3;
        });
      }

      if (p.description) {
        block("Descriere", () => {
          doc.setFont("helvetica", "normal"); doc.setFontSize(9.2);
          txt(C.ink);
          const lines = doc.splitTextToSize(S(p.description), cw);
          let dy = y;
          for (const ln of lines) {
            if (dy > H - 40) { doc.addPage(); dy = 20; }
            doc.text(ln, M, dy);
            dy += 4.8;
          }
          y = dy + 4;
        });
      }

      // ---------- Footer with QR ----------
      const fy = H - 36;
      fill(C.navy); doc.rect(0, fy, W, 36, "F");
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&data=${encodeURIComponent(listingUrl)}`;
      const qr = await urlToDataURL(qrUrl);
      if (qr) { try { doc.addImage(qr, "PNG", M, fy + 5, 26, 26); } catch {} }
      txt(C.white); doc.setFont("helvetica", "bold"); doc.setFontSize(12);
      doc.text(S("Vezi anuntul online"), M + 33, fy + 12);
      txt(C.gold); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(listingUrl, M + 33, fy + 18);
      txt([210, 210, 210]); doc.setFontSize(7.5);
      doc.text(S("Scaneaza pentru tur virtual si contact direct cu proprietarul."), M + 33, fy + 25);

      doc.save(`brosura-verificasa-${S(p.property_code || p.id || "proprietate")}.pdf`);
      toast({ title: "Broșură PDF generată", description: "Fișierul a fost descărcat." });
    } catch (e) {
      toast({ title: "Generare eșuată", description: "Încearcă din nou.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={build}
        disabled={busy}
        variant="outline"
        className="w-full gap-1.5 border-gold/40 text-gold-deep hover:bg-gold-soft dark:text-gold"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        {busy ? "Generez broșură..." : "Descarcă Broșură PDF"}
      </Button>
    </div>
  );
}