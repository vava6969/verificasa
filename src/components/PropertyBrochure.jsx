import { useState } from "react";
import { jsPDF } from "jspdf";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import { LOGO_URL } from "@/components/VerifiCasaLogo";
import { useToast } from "@/components/ui/use-toast";

// Strictly black-on-white palette for a clean, printable brochure.
const C = {
  ink:    [30,  32,  38],   // headline / body text
  navy:    [27, 34, 44],
  mute:    [90, 96, 108],   // secondary text
  gold:    [197, 160, 89],
  emerald: [0, 168, 89],
  border: [220, 224, 230],
  light:  [244, 246, 250],
  white:  [255, 255, 255],
};

// Strip Romanian diacritics → ASCII so the built-in Helvetica font renders cleanly.
const S = (s) =>
  s == null ? "" : String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Strip emojis / non-latin glyphs that jsPDF's default font can't render.
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

// Loads an image as a base64 data URL via the server-side ProxyImage backend
// function. This bypasses browser CORS restrictions for images hosted on
// external CDNs (e.g. elit casaimobiliare.ro) that don't send the
// `Access-Control-Allow-Origin` header, which is what was preventing listing
// photos from appearing in the PDF.
async function urlToDataURL(url) {
  if (!url) return null;
  try {
    const r = await base44.functions.invoke("ProxyImage", { url });
    if (r && r.dataUrl && r.dataUrl.length > 256) return r.dataUrl;
  } catch {}
  return null;
}

const dataFmt = (d) => {
  if (!d) return "PNG";
  if (d.startsWith("data:image/png")) return "PNG";
  if (d.startsWith("data:image/jpeg") || d.startsWith("data:image/jpg")) return "JPEG";
  if (d.startsWith("data:image/webp")) return "WEBP";
  return "PNG";
};

function card(doc, x, y, w, h, r) {
  doc.setFillColor(C.white[0], C.white[1], C.white[2]);
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, w, h, r, r, "FD");
}

export default function PropertyBrochure({ property, className = "" }) {
  const { formatPrice, t, lang } = useCountry();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const p = property || {};
  const listingUrl = `${window.location.origin}/property/${p.id}`;
  const locale = lang === "en" ? "en-GB" : "ro-RO";

  const verifLabel = (p) =>
    p.verification_level === "field_certified"
      ? t("brochure_verif_certified")
      : p.ai_tour_verified
      ? t("brochure_verif_video")
      : t("brochure_verif_unverified");

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

      // ── PAGE BACKGROUND (white) ────────────────────────────────────────────
      setFill(C.white); doc.rect(0, 0, W, H, "F");

      // ── HEADER (black-on-white, gold accent) ──────────────────────────────
      const logo = await urlToDataURL(LOGO_URL);
      let logoRight = M;
      if (logo) {
        try { doc.addImage(logo, "PNG", M, 9, 14, 14); } catch {}
        logoRight = M + 18;
      }
      doc.setFont("helvetica", "bold"); doc.setFontSize(17);
      setTxt(C.ink); doc.text("VerifiCasa", logoRight, 18);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      setTxt(C.gold);
      doc.text(S(t("brochure_tagline")), logoRight, 23.5);

      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      setTxt(C.mute);
      doc.text(new Date().toLocaleDateString(locale), W - M, 17, { align: "right" });

      setFill(C.gold); doc.rect(0, 28, W, 1.2, "F");
      y = 38;

      // ── TITLE BLOCK (black on white) ───────────────────────────────────────
      doc.setFont("helvetica", "bold"); doc.setFontSize(18); setTxt(C.ink);
      const titleLines = doc.splitTextToSize(SC(p.title || t("brochure_default_title")), cw);
      doc.text(titleLines, M, y);
      y += titleLines.length * 7 + 2;

      const locParts = [p.zone, p.city, p.county, t("card_country")].filter(Boolean).join(", ");
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); setTxt(C.mute);
      doc.text(SC(locParts), M, y); y += 5;
      if (p.landmark) {
        doc.setFontSize(8.5);
        doc.text(SC(t("brochure_reper") + p.landmark), M, y); y += 4.5;
      }
      // Property code pill
      doc.setFontSize(8); setTxt(C.mute);
      const codeStr = S(t("brochure_code") + (p.property_code || (p.id ? p.id.slice(0, 8) : "—")));
      const codePillW = doc.getTextWidth(codeStr) + 6;
      setFill(C.light); setDraw(C.border); setLw(0.2);
      doc.roundedRect(M, y - 3.5, codePillW, 5.5, 1, 1, "FD");
      setTxt(C.ink);
      doc.text(codeStr, M + 3, y + 0.5);
      y += 9;

      // ── PRICE PILL ─────────────────────────────────────────────────────────
      const priceTxt = S(formatPrice(p.price_monthly, p.currency) + t("card_per_month"));
      doc.setFont("helvetica", "bold"); doc.setFontSize(14);
      const priceW = doc.getTextWidth(priceTxt) + 12;
      setFill(C.emerald);
      doc.roundedRect(M, y, priceW, 10, 2, 2, "F");
      setTxt(C.white);
      doc.text(priceTxt, M + 6, y + 7);

      if (p.monthly_utilities_estimate) {
        const total = (p.price_monthly || 0) + (p.monthly_utilities_estimate || 0) + (p.maintenance_fee || 0);
        const totalTxt = S(t("brochure_total_month") + formatPrice(total, p.currency));
        doc.setFontSize(9); doc.setFont("helvetica", "normal");
        const totalW = doc.getTextWidth(totalTxt) + 10;
        setFill(C.light); setDraw(C.border); setLw(0.2);
        doc.roundedRect(M + priceW + 4, y + 1, totalW, 8, 1.5, 1.5, "FD");
        setTxt(C.ink);
        doc.text(totalTxt, M + priceW + 9, y + 6.5);
      }
      y += 16;

      // ── COVER IMAGE + THUMBNAILS (first 3 listing photos) ──────────────────
      const imgs = (p.images || []).slice(0, 3);
      if (imgs.length > 0) {
        const coverH = 65;
        const coverData = await urlToDataURL(imgs[0]);
        if (coverData) {
          card(doc, M - 1, y - 1, cw + 2, coverH + 2, 3);
          try { doc.addImage(coverData, dataFmt(coverData), M, y, cw, coverH, undefined, "FAST"); } catch {}
        } else {
          card(doc, M, y, cw, coverH, 3);
          setTxt(C.mute); doc.setFontSize(8);
          doc.text(S(t("brochure_no_image")), W / 2, y + coverH / 2, { align: "center" });
        }
        y += coverH + 5;

        // First-3-photo rule already limits `imgs` to 3; show the remaining as thumbnails.
        const thumbs = imgs.slice(1);
        if (thumbs.length > 0) {
          const th = 28, tw = (cw - (thumbs.length - 1) * 3) / thumbs.length;
          let tx = M;
          for (const tu of thumbs) {
            card(doc, tx, y, tw, th, 2);
            const td = await urlToDataURL(tu);
            if (td) { try { doc.addImage(td, dataFmt(td), tx, y, tw, th, undefined, "FAST"); } catch {} }
            tx += tw + 3;
          }
          y += th + 6;
        }
      }

      // ── HELPERS: section card with light header (black on white) ──────────
      const sectionCard = (title, renderFn, estimatedH) => {
        if (y + estimatedH > H - 50) { doc.addPage(); setFill(C.white); doc.rect(0, 0, W, H, "F"); y = 20; }
        const cardY = y;
        // Title row with thin gold accent line under it
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); setTxt(C.ink);
        doc.text(S(title), M, y + 4.5);
        setFill(C.gold); doc.rect(M, y + 6.5, cw, 0.6, "F");
        y += 10;
        renderFn();
        // Outer border around the whole section
        setDraw(C.border); setLw(0.25);
        doc.rect(M, cardY, cw, y - cardY);
        y += 6;
      };

      // ── SPECS TABLE ────────────────────────────────────────────────────────
      const specs = [
        [t("brochure_spec_type"),       p.property_type || "—"],
        [t("brochure_spec_rooms"),      p.rooms != null ? String(p.rooms) : "—"],
        [t("brochure_spec_surface"),    p.surface_sqm != null ? `${p.surface_sqm} mp` : "—"],
        [t("brochure_spec_floor"),      p.floor || "—"],
        [t("brochure_spec_year"),       p.building_year ? String(p.building_year) : "—"],
        [t("brochure_spec_total_fl"),   p.total_floors != null ? String(p.total_floors) : "—"],
        [t("brochure_spec_deposit"),   p.deposit != null ? S(formatPrice(p.deposit, p.currency)) : "—"],
        [t("brochure_spec_avail"),     p.available_from ? new Date(p.available_from).toLocaleDateString(locale) : t("brochure_immediate")],
        [t("brochure_spec_furnished"), p.furnished ? t("brochure_spec_yes") : t("brochure_spec_no")],
        [t("brochure_spec_parking"),   p.parking ? t("brochure_spec_yes") : t("brochure_spec_no")],
        [t("brochure_spec_pet"),       p.pet_friendly ? t("brochure_spec_yes") : t("brochure_spec_no")],
        [t("brochure_spec_commission"),p.commission_free ? t("brochure_commission_free") : t("brochure_commission_standard")],
        [t("brochure_spec_guarantee"), p.deposit_option === "verificasa_guarantee" ? t("brochure_guarantee_vc") : t("brochure_guarantee_standard")],
        [t("brochure_spec_verification"), verifLabel(p)],
      ];

      sectionCard(t("brochure_specs_section"), () => {
        const colW = cw / 2;
        const rows = Math.ceil(specs.length / 2);
        for (let row = 0; row < rows; row++) {
          const isShaded = row % 2 === 1;
          if (isShaded) { setFill(C.light); doc.rect(M, y, cw, 6, "F"); }
          for (let col = 0; col < 2; col++) {
            const idx = row * 2 + col;
            if (idx >= specs.length) continue;
            const sx = M + col * colW + 3;
            doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
            setTxt(C.mute);
            doc.text(S(specs[idx][0] + ":"), sx, y + 4.2);
            doc.setFont("helvetica", "bold"); setTxt(C.ink);
            doc.text(S(String(specs[idx][1] || "—")), sx + 44, y + 4.2);
          }
          y += 6;
        }
      }, specs.length * 3.5 + 18);

      // ── FACILITIES ──────────────────────────────────────────────────────────
      if (p.features?.length) {
        const featuresList = p.features.map((f) => SC(f));
        const perRow = 3;
        const rows = Math.ceil(featuresList.length / perRow);
        sectionCard(t("brochure_facilities_section"), () => {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < perRow; c++) {
              const fi = featuresList[r * perRow + c];
              if (!fi) continue;
              const fx = M + 3 + c * (cw / perRow);
              setFill(C.emerald); doc.circle(fx + 1.5, y + 3, 1, "F");
              doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); setTxt(C.ink);
              doc.text(fi, fx + 4, y + 4.2);
            }
            y += 6;
          }
        }, rows * 7 + 18);
      }

      // ── DESCRIPTION ─────────────────────────────────────────────────────────
      if (p.description) {
        const descLines = doc.splitTextToSize(SC(p.description), cw - 10);
        const descH = descLines.length * 4.8 + 18;
        sectionCard(t("brochure_desc_section"), () => {
          doc.setFont("helvetica", "normal"); doc.setFontSize(9); setTxt(C.ink);
          for (const ln of descLines) {
            if (y > H - 50) { doc.addPage(); setFill(C.white); doc.rect(0, 0, W, H, "F"); y = 20; }
            doc.text(ln, M + 5, y + 4);
            y += 4.8;
          }
        }, descH);
      }

      // ── FOOTER (black on white, with QR) ────────────────────────────────────
      const fy = H - 36;
      setFill(C.gold); doc.rect(0, fy, W, 1.2, "F");
      setFill(C.white); doc.rect(0, fy + 1.2, W, 35, "F");

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=4&color=1B222C&data=${encodeURIComponent(listingUrl)}`;
      const qr = await urlToDataURL(qrUrl);
      if (qr) {
        setFill(C.white); setDraw(C.border); setLw(0.2);
        doc.roundedRect(M, fy + 4, 28, 28, 2, 2, "FD");
        try { doc.addImage(qr, "PNG", M + 1, fy + 5, 26, 26, undefined, "FAST"); } catch {}
      }

      doc.setFont("helvetica", "bold"); doc.setFontSize(11); setTxt(C.ink);
      doc.text(S(t("brochure_view_online")), M + 33, fy + 11);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); setTxt(C.mute);
      doc.text(listingUrl, M + 33, fy + 18);
      doc.setFontSize(7.5);
      doc.text(S(t("brochure_scan_line")), M + 33, fy + 25);

      doc.setFont("helvetica", "bold"); doc.setFontSize(8); setTxt(C.gold);
      doc.text("VerifiCasa", W - M, fy + 32, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); setTxt(C.mute);
      doc.text(S(t("brochure_footer_tagline")), W - M, fy + 36, { align: "right" });

      doc.save(`${S(t("brochure_filename"))}-${S(p.property_code || (p.id ? p.id.slice(0, 8) : "prop"))}.pdf`);
      toast({ title: t("toast_brochure_ok_title"), description: t("toast_brochure_ok_desc") });
    } catch (e) {
      console.error(e);
      toast({ title: t("toast_brochure_err_title"), description: t("toast_brochure_err_desc"), variant: "destructive" });
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
        {busy ? t("btn_generating_brochure") : t("btn_brochure_pdf")}
      </Button>
    </div>
  );
}