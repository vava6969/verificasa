import { useState } from "react";
import { jsPDF } from "jspdf";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";
import { LOGO_URL } from "@/components/VerifiCasaLogo";
import { useToast } from "@/components/ui/use-toast";

const C = {
  navy:    [27,  34,  44],
  navyMid: [40,  52,  68],
  gold:    [197, 160, 89],
  emerald: [0,   168, 89],
  mute:    [110, 120, 136],
  light:   [245, 246, 248],
  white:   [255, 255, 255],
  ink:     [30,  32,  38],
  border:  [220, 224, 230],
  bg:      [252, 253, 254],
};

// Strip Romanian diacritics → ASCII so Helvetica renders cleanly
const S = (s) =>
  s == null ? "" : String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Strip emojis and other non-latin glyphs that jsPDF's default Helvetica font
// cannot render (they show up as garbled mojibake like "Ø=P"). Keeps latin
// letters, digits, punctuation and whitespace only.
const stripGlyphs = (s) =>
  s == null
    ? ""
    : String(s)
        .replace(
          /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E000}-\u{F8FF}\u{1F1E6}-\u{1F1FF}\u{2300}-\u{23FF}]/gu,
          ""
        )
        .replace(/\s+/g, " ")
        .trim();
const SC = (s) => S(stripGlyphs(s));

const verifLabel = (p) =>
  p.verification_level === "field_certified"
    ? "Certificat pe teren"
    : p.ai_tour_verified
    ? "Video & AI verificat"
    : "Neverificat";

async function urlToDataURL(url) {
  // Prefer a <canvas> approach: load the image with crossOrigin so it can be
  // drawn to a canvas and re-encoded via toDataURL. This works for CDNs that
  // send `Access-Control-Allow-Origin` but block `fetch()` reader access.
  // Falls back to fetch+blob if the canvas approach throws.
  try {
    const fromCanvas = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 600;
          canvas.height = img.naturalHeight || 400;
          canvas.getContext("2d").drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
    if (fromCanvas) return fromCanvas;
  } catch {}

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

const fmt = (d) =>
  d?.startsWith("data:image/png")
    ? "PNG"
    : d?.startsWith("data:image/jpeg") || d?.startsWith("data:image/jpg")
    ? "JPEG"
    : "PNG";

function drawRoundedRect(doc, x, y, w, h, r, style = "F") {
  doc.roundedRect(x, y, w, h, r, r, style);
}

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
      const W = 210, H = 297, M = 16, cw = W - M * 2;
      let y = 0;

      const setFill = (c) => doc.setFillColor(c[0], c[1], c[2]);
      const setTxt  = (c) => doc.setTextColor(c[0], c[1], c[2]);
      const setDraw = (c) => doc.setDrawColor(c[0], c[1], c[2]);
      const setLw   = (w) => doc.setLineWidth(w);

      // ── PAGE BACKGROUND ──────────────────────────────────────────────────
      setFill(C.bg); doc.rect(0, 0, W, H, "F");

      // ── HEADER (navy gradient simulation) ────────────────────────────────
      setFill(C.navy);  doc.rect(0, 0, W, 32, "F");
      setFill(C.navyMid); doc.rect(0, 28, W, 6, "F"); // soft bottom fade

      // Logo
      const logo = await urlToDataURL(LOGO_URL);
      let logoRight = M;
      if (logo) {
        try { doc.addImage(logo, "PNG", M, 7, 14, 14); } catch {}
        logoRight = M + 18;
      }

      // Brand name
      doc.setFont("helvetica", "bold"); doc.setFontSize(17);
      setTxt(C.white);
      doc.text("VerifiCasa", logoRight, 16);

      // Tagline
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      setTxt(C.gold);
      doc.text("Inspectii & Verificari Imobiliare", logoRight, 21.5);

      // Date — top right
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      setTxt([190, 200, 210]);
      doc.text(new Date().toLocaleDateString("ro-RO"), W - M, 15, { align: "right" });

      // Gold accent line at header bottom
      setFill(C.gold); doc.rect(0, 32, W, 1.5, "F");
      y = 42;

      // ── TITLE BLOCK ───────────────────────────────────────────────────────
      doc.setFont("helvetica", "bold"); doc.setFontSize(18);
      setTxt(C.ink);
      const titleLines = doc.splitTextToSize(SC(p.title || "Proprietate"), cw);
      doc.text(titleLines, M, y);
      y += titleLines.length * 7 + 1;

      // Location + property code
      const locParts = [p.zone, p.city, p.county, "Romania"].filter(Boolean).join(", ");
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
      setTxt(C.mute);
      doc.text(SC(locParts), M, y); y += 5;
      if (p.landmark) {
        doc.setFontSize(8.5);
        doc.text(SC("Reper: " + p.landmark), M, y); y += 4.5;
      }
      // Property code badge
      doc.setFontSize(8); setTxt(C.mute);
      const codeStr = S("Cod Proprietate: " + (p.property_code || p.id?.slice(0, 8) || "—"));
      const codePillW = doc.getTextWidth(codeStr) + 6;
      setFill(C.border);
      drawRoundedRect(doc, M, y - 3.5, codePillW, 5.5, 1, "F");
      setTxt(C.navyMid);
      doc.text(codeStr, M + 3, y + 0.5);
      y += 9;

      // ── PRICE PILL ────────────────────────────────────────────────────────
      const priceTxt = S(formatPrice(p.price_monthly, p.currency) + "/luna");
      doc.setFont("helvetica", "bold"); doc.setFontSize(14);
      const priceW = doc.getTextWidth(priceTxt) + 12;
      setFill(C.emerald);
      drawRoundedRect(doc, M, y, priceW, 10, 2, "F");
      setTxt(C.white);
      doc.text(priceTxt, M + 6, y + 7);

      // Cost total pill (if utilities set)
      if (p.monthly_utilities_estimate) {
        const total = (p.price_monthly || 0) + (p.monthly_utilities_estimate || 0) + (p.maintenance_fee || 0);
        const totalTxt = S("Total lunar: ~" + formatPrice(total, p.currency));
        doc.setFontSize(9); doc.setFont("helvetica", "normal");
        const totalW = doc.getTextWidth(totalTxt) + 10;
        setFill(C.light); setDraw(C.border); setLw(0.2);
        drawRoundedRect(doc, M + priceW + 4, y + 1, totalW, 8, 1.5, "FD");
        setTxt(C.navyMid);
        doc.text(totalTxt, M + priceW + 9, y + 6.5);
      }
      y += 16;

      // ── COVER IMAGE (full-width, rounded) ────────────────────────────────
      const imgs = (p.images || []).slice(0, 4);
      if (imgs.length > 0) {
        const coverH = 65;
        const coverData = await urlToDataURL(imgs[0]);
        if (coverData) {
          try {
            // Draw white rounded card background
            setFill(C.white); setDraw(C.border); setLw(0.3);
            drawRoundedRect(doc, M - 1, y - 1, cw + 2, coverH + 2, 3, "FD");
            doc.addImage(coverData, fmt(coverData), M, y, cw, coverH);
          } catch {}
        } else {
          setFill(C.light); setDraw(C.border); setLw(0.3);
          drawRoundedRect(doc, M, y, cw, coverH, 3, "FD");
          setTxt(C.mute); doc.setFontSize(8);
          doc.text(S("Fotografie indisponibila"), W / 2, y + coverH / 2, { align: "center" });
        }
        y += coverH + 5;

        // Thumbnails row (up to 3)
        const thumbs = imgs.slice(1, 4);
        if (thumbs.length > 0) {
          const th = 28, tw = (cw - (thumbs.length - 1) * 3) / thumbs.length;
          let tx = M;
          for (const tu of thumbs) {
            const td = await urlToDataURL(tu);
            setFill(C.light); setDraw(C.border); setLw(0.2);
            drawRoundedRect(doc, tx, y, tw, th, 2, "FD");
            if (td) {
              try { doc.addImage(td, fmt(td), tx, y, tw, th); } catch {}
            }
            tx += tw + 3;
          }
          y += th + 6;
        }
      }

      // ── SPECS TABLE (card) ────────────────────────────────────────────────
      const specs = [
        ["Tip proprietate", p.property_type || "—"],
        ["Camere",          p.rooms != null ? String(p.rooms) : "—"],
        ["Suprafata",       p.surface_sqm != null ? `${p.surface_sqm} mp` : "—"],
        ["Etaj",            p.floor || "—"],
        ["An constructie",  p.building_year ? String(p.building_year) : "—"],
        ["Total etaje",     p.total_floors != null ? String(p.total_floors) : "—"],
        ["Depozit",         p.deposit != null ? S(formatPrice(p.deposit, p.currency)) : "—"],
        ["Disponibil",      p.available_from ? new Date(p.available_from).toLocaleDateString("ro-RO") : "Imediat"],
        ["Mobilat",         p.furnished ? "Da" : "Nu"],
        ["Parcare",         p.parking ? "Da" : "Nu"],
        ["Pet friendly",    p.pet_friendly ? "Da" : "Nu"],
        ["Comision",        p.commission_free ? "Fara comision" : "Standard"],
        ["Garantie",        p.deposit_option === "verificasa_guarantee" ? "VerifiCasa Guarantee" : "Standard"],
        ["Verificare",      verifLabel(p)],
      ];

      const sectionCard = (title, renderFn, estimatedH) => {
        if (y + estimatedH > H - 45) { doc.addPage(); setFill(C.bg); doc.rect(0, 0, W, H, "F"); y = 20; }
        // Card background
        setFill(C.white); setDraw(C.border); setLw(0.25);
        // We'll size after render; for now start
        const cardY = y;

        // Section title
        setFill(C.navy); doc.rect(M, y, cw, 8, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
        setTxt(C.white);
        doc.text(S(title), M + 5, y + 5.5);
        y += 11;

        renderFn();
        y += 4;

        // Draw card border around the whole section
        setDraw(C.border); setLw(0.25);
        doc.rect(M, cardY, cw, y - cardY);
      };

      sectionCard("DETALII PROPRIETATE", () => {
        const colW = cw / 2;
        const rows = Math.ceil(specs.length / 2);
        for (let row = 0; row < rows; row++) {
          const isShaded = row % 2 === 1;
          if (isShaded) { setFill([247, 248, 250]); doc.rect(M, y, cw, 6, "F"); }
          for (let col = 0; col < 2; col++) {
            const idx = row * 2 + col;
            if (idx >= specs.length) continue;
            const sx = M + col * colW + 3;
            doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); setTxt(C.mute);
            doc.text(S(specs[idx][0] + ":"), sx, y + 4.2);
            doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); setTxt(C.ink);
            doc.text(S(String(specs[idx][1] || "—")), sx + 44, y + 4.2);
          }
          y += 6;
        }
      }, specs.length * 3.5 + 20);

      y += 4;

      // ── FEATURES ─────────────────────────────────────────────────────────
      if (p.features?.length) {
        const featuresList = p.features.map((f) => SC(f));
        const perRow = 3;
        const rows = Math.ceil(featuresList.length / perRow);
        sectionCard("FACILITATI", () => {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < perRow; c++) {
              const fi = featuresList[r * perRow + c];
              if (!fi) continue;
              const fx = M + 3 + c * (cw / perRow);
              // small bullet dot
              setFill(C.emerald); doc.circle(fx + 1.5, y + 3, 1, "F");
              doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); setTxt(C.ink);
              doc.text(fi, fx + 4, y + 4.2);
            }
            y += 6;
          }
        }, rows * 7 + 20);
        y += 4;
      }

      // ── DESCRIPTION ──────────────────────────────────────────────────────
      if (p.description) {
        const descLines = doc.splitTextToSize(SC(p.description), cw - 10);
        const descH = descLines.length * 4.8 + 22;
        sectionCard("DESCRIERE", () => {
          doc.setFont("helvetica", "normal"); doc.setFontSize(9); setTxt(C.ink);
          for (const ln of descLines) {
            if (y > H - 50) { doc.addPage(); setFill(C.bg); doc.rect(0, 0, W, H, "F"); y = 20; }
            doc.text(ln, M + 5, y + 4);
            y += 4.8;
          }
        }, descH);
      }

      // ── FOOTER ───────────────────────────────────────────────────────────
      const fy = H - 40;
      // gold accent top of footer
      setFill(C.gold); doc.rect(0, fy, W, 1.5, "F");
      setFill(C.navy); doc.rect(0, fy + 1.5, W, 40, "F");

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=4&color=1B222C&data=${encodeURIComponent(listingUrl)}`;
      const qr = await urlToDataURL(qrUrl);
      if (qr) {
        // White bg for QR
        setFill(C.white); drawRoundedRect(doc, M, fy + 4, 28, 28, 2, "F");
        try { doc.addImage(qr, "PNG", M + 1, fy + 5, 26, 26); } catch {}
      }

      doc.setFont("helvetica", "bold"); doc.setFontSize(11); setTxt(C.white);
      doc.text(S("Vizualizeaza anuntul online"), M + 33, fy + 12);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); setTxt(C.gold);
      doc.text(listingUrl, M + 33, fy + 19);
      doc.setFontSize(7.5); setTxt([180, 190, 200]);
      doc.text(S("Scaneaza codul QR pentru tur virtual si contact direct cu proprietarul."), M + 33, fy + 26);

      // VerifiCasa branding bottom right
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); setTxt(C.gold);
      doc.text("VerifiCasa", W - M, fy + 35, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); setTxt([150, 160, 175]);
      doc.text(S("verificasa.site · Inspectii & Verificari Imobiliare"), W - M, fy + 39, { align: "right" });

      doc.save(`brosura-verificasa-${S(p.property_code || p.id?.slice(0, 8) || "prop")}.pdf`);
      toast({ title: "Broșură generată ✓", description: "PDF-ul a fost descărcat." });
    } catch (e) {
      console.error(e);
      toast({ title: "Eroare la generare", description: String(e?.message || e), variant: "destructive" });
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