import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getEntitlements, getActivePlan, countActiveListings } from "../../shared/entitlements.js";

// Verifică server-side dacă utilizatorul mai are voie să publice un anunț și
// câte fotografii poate încărca. Planurile vindeau „1 anunț activ" / „până la 5"
// dar nimic nu impunea nimic — un cont Basic putea publica cincizeci.
//
// Se apelează înainte de publicare (wizard) și e sursa de adevăr; verificarea
// din client e doar ca utilizatorul să vadă limita mai devreme.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: "Trebuie să fii autentificat." });

    let body: any = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const excludeId = body?.property_id || null;
    const photoCount = Number(body?.photo_count) || 0;

    const svc = base44.asServiceRole;
    const planId = await getActivePlan(svc, me.id);
    const ent = getEntitlements(planId);
    const used = await countActiveListings(svc, me.id, excludeId);

    const listingsOk = ent.activeListings === null || used < ent.activeListings;
    const photosOk = ent.photosPerListing === null || photoCount <= ent.photosPerListing;

    let error: string | null = null;
    if (!listingsOk) {
      error = ent.activeListings === 1
        ? "Planul tău permite un singur anunț activ. Dezactivează anunțul curent sau treci pe un plan superior."
        : `Planul tău permite ${ent.activeListings} anunțuri active, iar tu ai deja ${used}.`;
    } else if (!photosOk) {
      error = `Planul tău permite ${ent.photosPerListing} fotografii per anunț.`;
    }

    return Response.json({
      ok: listingsOk && photosOk,
      allowed: listingsOk && photosOk,
      error,
      plan_id: planId,
      used,
      limit_listings: ent.activeListings,
      limit_photos: ent.photosPerListing,
      remaining: ent.activeListings === null ? null : Math.max(0, ent.activeListings - used),
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Eroare la verificarea limitelor." });
  }
}
