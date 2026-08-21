import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Stinge boost-urile expirate și curăță câmpurile denormalizate de pe anunț.
// De rulat pe program (sau manual din Admin). Idempotent.
const ADMIN_ROLES = new Set(["admin", "ADMIN", "SUPER_ADMIN", "super_admin"]);

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id || !ADMIN_ROLES.has(me.role)) {
      return Response.json({ error: "Doar administratorii pot rula expirarea." });
    }

    const svc = base44.asServiceRole;
    const now = Date.now();

    const active = await svc.entities.Boost.filter({ status: "active" }, "-ends_date", 500);
    const expired = (active || []).filter((b: any) => new Date(b.ends_date).getTime() <= now);

    let cleared = 0;
    for (const b of expired) {
      try {
        await svc.entities.Boost.update(b.id, { status: "expired" });
        // Anunțul se curăță doar dacă nu mai are alt boost activ în viitor.
        const others = await svc.entities.Boost.filter(
          { property_id: b.property_id, status: "active" }, "-ends_date", 5
        );
        const stillActive = (others || []).some(
          (o: any) => o.id !== b.id && new Date(o.ends_date).getTime() > now
        );
        if (!stillActive) {
          await svc.entities.Property.update(b.property_id, { boost_active: false, boost_ends_date: "" });
          cleared++;
        }
      } catch (_) { /* best-effort */ }
    }

    return Response.json({ ok: true, checked: active?.length || 0, expired: expired.length, cleared });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Eroare la expirare." });
  }
}
