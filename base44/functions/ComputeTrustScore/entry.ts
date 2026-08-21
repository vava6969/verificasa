import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Scorul de încredere (0-100), reconstruit ca scor de DOVEZI, nu ca metru de
// completare a formularului. Clientul avea dreptate: vechea versiune număra
// pozele și lungimea descrierii, deci putea doar să crească și o controla
// integral cel care posta.
//
// Patru benzi + scăderi. Ponderea e deliberată: banda pe care postatorul o
// controlează complet valorează cel mai puțin, iar banda confirmată de
// altcineva valorează cel mai mult.
//
//   Dovezi verificate     45  — lucruri confirmate de altcineva
//   Măsurători             20  — citirile de instrument, ponderate după cât de
//                                greu e de falsificat fiecare
//   Calitatea anunțului    20  — poze/descriere/completitudine (plafonat jos)
//   Coerență de piață      15  — preț/mp față de anunțurile aprobate de același
//                                tip din același oraș (cerut explicit de client)
//   Scăderi                 —  — reclamații nerezolvate, vechime, contact invalid
//
// Detalierea se salvează în Property.trust_breakdown și se afișează public pe
// pagina anunțului: un anunț care punctează prost arată DE CE.
//
// Notă: răspundem mereu cu status 200 și un câmp `error` (SDK-ul din browser
// aruncă o eroare generică pe orice status non-2xx).

const MIN_COMPARABLES = 5;

function band(key: string, label: string, points: number, max: number, reason: string) {
  return { key, label, points: Math.round(points), max, reason };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: "Trebuie să fii autentificat." });

    let body: any = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const { property_id } = body;
    if (!property_id) return Response.json({ error: "property_id este necesar" });

    const svc = base44.asServiceRole;
    const p: any = await svc.entities.Property.get(property_id);
    if (!p) return Response.json({ error: "Anunțul nu a fost găsit." });

    const bands: any[] = [];
    const deductions: any[] = [];

    // ---- 1. Dovezi verificate (max 45) — confirmate de altcineva ----
    let ev = 0;
    const evParts: string[] = [];
    if (p.owner_verified) { ev += 12; evParts.push("proprietar verificat"); }
    if (p.verification_level === "field_certified") { ev += 15; evParts.push("certificat pe teren"); }
    else if (p.verification_level === "video_ai") { ev += 7; evParts.push("verificare video"); }
    if (p.approved_by_id && p.approval_status === "APPROVED") { ev += 8; evParts.push("aprobat de un administrator"); }
    if (p.tour_3d_url) { ev += 6; evParts.push("tur 3D"); }
    if (p.inspection_report_url) { ev += 4; evParts.push("raport de inspecție"); }
    ev = Math.min(ev, 45);
    bands.push(band("evidence", "Dovezi verificate", ev, 45,
      evParts.length ? `Confirmat: ${evParts.join(", ")}.` : "Nicio verificare independentă încă."));

    // ---- 2. Măsurători (max 20) — ponderate după cât de greu e de falsificat ----
    let ms = 0;
    const msParts: string[] = [];
    if (p.noise_db != null) { ms += 5; msParts.push("zgomot"); }
    if (p.internet_speed_mbps != null) { ms += 4; msParts.push("internet"); }
    if (p.water_pressure_ok != null) { ms += 3; msParts.push("presiune apă"); }
    if (p.light_orientation) { ms += 3; msParts.push("orientare"); }
    if (p.metro_distance_min != null) { ms += 2; msParts.push("transport"); }
    if (p.monthly_utilities_estimate != null) { ms += 2; msParts.push("utilități"); }
    if (p.maintenance_fee != null) { ms += 1; msParts.push("întreținere"); }
    ms = Math.min(ms, 20);
    bands.push(band("measured", "Măsurători", ms, 20,
      msParts.length ? `Înregistrate: ${msParts.join(", ")}.` : "Nicio măsurătoare înregistrată."));

    // ---- 3. Calitatea anunțului (max 20) — plafonat jos, e partea gestionabilă ----
    const photoCount = Array.isArray(p.images) ? p.images.length : 0;
    const descLen = (p.description || "").trim().length;
    let q = 0;
    q += Math.min(photoCount, 6) * 1.5;                       // max 9
    q += descLen >= 240 ? 5 : Math.round((descLen / 240) * 5); // max 5
    if (p.rooms != null && p.surface_sqm != null) q += 2;
    if (p.floor && p.building_year != null) q += 2;
    if (p.available_from) q += 1;
    if (p.phone) q += 1;
    q = Math.min(Math.round(q), 20);
    bands.push(band("quality", "Calitatea anunțului", q, 20,
      `${photoCount} ${photoCount === 1 ? "fotografie" : "fotografii"}, descriere de ${descLen} caractere.`));

    // ---- 4. Coerență de piață (max 15) — comparativ cu anunțurile existente ----
    let market = 0;
    let marketReason = "";
    let marketApplies = false;
    const sqm = Number(p.surface_sqm) || 0;
    const price = Number(p.price_monthly) || 0;

    if (sqm > 0 && price > 0 && p.city && p.property_type) {
      try {
        const peers: any[] = await svc.entities.Property.filter(
          {
            city: p.city,
            property_type: p.property_type,
            transaction_type: p.transaction_type || "RENT",
            approval_status: "APPROVED",
          },
          "-created_date",
          200
        );
        const rates = peers
          .filter((x: any) => x.id !== p.id && Number(x.surface_sqm) > 0 && Number(x.price_monthly) > 0)
          .map((x: any) => Number(x.price_monthly) / Number(x.surface_sqm))
          .filter((r: number) => isFinite(r) && r > 0);

        if (rates.length >= MIN_COMPARABLES) {
          marketApplies = true;
          const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
          const variance = rates.reduce((a, b) => a + (b - mean) ** 2, 0) / rates.length;
          const sd = Math.sqrt(variance) || mean * 0.15;
          const rate = price / sqm;
          const z = Math.abs(rate - mean) / sd;
          // în ±1σ = punctaj complet; degradează liniar; peste 3σ = 0 și semnalat
          market = z <= 1 ? 15 : z >= 3 ? 0 : Math.round(15 * (1 - (z - 1) / 2));
          const pct = Math.round(((rate - mean) / mean) * 100);
          marketReason =
            z >= 3
              ? `Preț atipic: ${pct > 0 ? "+" : ""}${pct}% față de media zonei (${rates.length} anunțuri comparabile).`
              : `${pct > 0 ? "+" : ""}${pct}% față de media a ${rates.length} anunțuri comparabile din ${p.city}.`;
        } else {
          marketReason = `Sub ${MIN_COMPARABLES} anunțuri comparabile în ${p.city}; banda nu se aplică.`;
        }
      } catch (_) {
        marketReason = "Comparația de piață nu a putut fi rulată.";
      }
    } else {
      marketReason = "Lipsesc suprafața sau prețul pentru comparație.";
    }
    if (marketApplies) bands.push(band("market", "Coerență de piață", market, 15, marketReason));

    // ---- 5. Scăderi ----
    // Reclamații nerezolvate
    try {
      const reports: any[] = await svc.entities.Report.filter(
        { target_id: property_id, target_type: "property" }, "-created_date", 50
      );
      // Doar sesizările încă deschise scad scorul — cele rezolvate sau
      // respinse de admin nu (vezi enum-ul Report.status).
      const open = reports.filter((r: any) => (r.status || "PENDING") === "PENDING");
      if (open.length) {
        const pts = Math.min(open.length * 6, 18);
        deductions.push({ key: "reports", label: "Reclamații nerezolvate", points: pts, reason: `${open.length} ${open.length === 1 ? "sesizare deschisă" : "sesizări deschise"}.` });
      }
    } catch (_) { /* best-effort */ }

    // Vechime: anunțul neatins de 60+ zile începe să se stingă
    const touched = p.updated_date || p.created_date;
    if (touched) {
      const days = Math.floor((Date.now() - new Date(touched).getTime()) / 86400000);
      if (days > 60) {
        const pts = Math.min(Math.floor((days - 60) / 30) * 4 + 4, 16);
        deductions.push({ key: "stale", label: "Anunț neactualizat", points: pts, reason: `Fără modificări de ${days} de zile.` });
      }
    }

    // Contact invalid
    const digits = (p.phone || "").replace(/\D/g, "");
    if (!digits || digits.length < 9) {
      deductions.push({ key: "contact", label: "Contact incomplet", points: 6, reason: "Numărul de telefon lipsește sau e invalid." });
    }

    // ---- Total, rescalat dacă banda de piață nu se aplică ----
    const rawMax = bands.reduce((a, b) => a + b.max, 0);
    const rawPoints = bands.reduce((a, b) => a + b.points, 0);
    const scaled = rawMax > 0 ? (rawPoints / rawMax) * 100 : 0;
    const totalDeductions = deductions.reduce((a, d) => a + d.points, 0);
    const score = Math.max(0, Math.min(100, Math.round(scaled - totalDeductions)));

    const breakdown = {
      version: 2,
      computed_at: new Date().toISOString(),
      bands,
      deductions,
      market_applies: marketApplies,
      market_note: marketApplies ? undefined : marketReason,
    };

    await svc.entities.Property.update(property_id, {
      trust_score: score,
      trust_breakdown: JSON.stringify(breakdown).slice(0, 4000),
    });

    return Response.json({ ok: true, score, breakdown });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Eroare la calcularea scorului." });
  }
}
