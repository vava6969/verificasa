import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Calculează automat un scor de încredere (0-100) pentru un anunț, pe baza
// completitudinii lui — nu mai e nevoie de nicio verificare manuală/pe teren.
// Rulează non-blocant după fiecare publicare sau editare de anunț (vezi
// PropertyWizard.jsx și PropertyEditForm.jsx).
//
// Notă: răspundem mereu cu status 200 și un câmp `error` (nu coduri HTTP
// 4xx/5xx), pentru că SDK-ul base44 din browser aruncă o eroare generică
// ("fail code 4xx/5xx") pe orice status non-2xx.
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
    const p = await svc.entities.Property.get(property_id);
    if (!p) return Response.json({ error: "Anunțul nu a fost găsit." });

    let score = 0;

    // Poze — până la 25p (5p/poză, max 5 poze relevante)
    const photoCount = Array.isArray(p.images) ? p.images.length : 0;
    score += Math.min(photoCount, 5) * 5;

    // Descriere — până la 15p, proporțional cu lungimea (plafon la 120 caractere)
    const descLen = (p.description || "").trim().length;
    score += descLen >= 120 ? 15 : Math.round((descLen / 120) * 15);

    // Date de contact — până la 15p
    if (p.phone) score += 10;
    if (p.whatsapp_phone) score += 5;

    // Completitudine detalii de bază — până la 20p (4p fiecare)
    if (p.rooms != null) score += 4;
    if (p.surface_sqm != null) score += 4;
    if (p.floor) score += 4;
    if (p.available_from) score += 4;
    if (p.property_type) score += 4;

    // Preț valid — până la 10p
    if (typeof p.price_monthly === "number" && p.price_monthly > 0) score += 10;

    // Semnale suplimentare de încredere — până la 15p
    if (p.owner_verified) score += 8;
    if (p.tour_3d_url) score += 7;

    score = Math.max(0, Math.min(100, Math.round(score)));

    await svc.entities.Property.update(property_id, { trust_score: score });
    return Response.json({ ok: true, score });
  } catch (e) {
    return Response.json({ error: e?.message || "Eroare la calcularea scorului." });
  }
}
