import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getBalance, addCredits, BOOST_DURATION_DAYS } from "../../shared/boosts.js";

// Consumă un credit și promovează un anunț. Verifică server-side că anunțul
// chiar aparține celui care cere: boost-ul se scrie cu asServiceRole, deci
// RLS-ul de pe Property nu ne mai apără aici.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: "Trebuie să fii autentificat." });

    let body: any = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const propertyId = body?.property_id;
    if (!propertyId) return Response.json({ error: "property_id este necesar." });

    const svc = base44.asServiceRole;
    const p: any = await svc.entities.Property.get(propertyId);
    if (!p) return Response.json({ error: "Anunțul nu a fost găsit." });

    const role = String(me.role || "").toUpperCase();
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
    if (p.created_by_id !== me.id && !isAdmin) {
      return Response.json({ error: "Poți promova doar anunțurile tale." });
    }
    if (p.approval_status !== "APPROVED") {
      return Response.json({ error: "Anunțul trebuie aprobat înainte de a fi promovat." });
    }

    const balance = await getBalance(svc, me.id);
    if (balance < 1) {
      return Response.json({ error: "Nu ai boost-uri disponibile.", balance: 0 });
    }

    // Un boost activ se prelungește, nu se irosește.
    const now = Date.now();
    const currentEnd = p.boost_ends_date ? new Date(p.boost_ends_date).getTime() : 0;
    const from = currentEnd > now ? currentEnd : now;
    const endsDate = new Date(from + BOOST_DURATION_DAYS * 86400000).toISOString();

    await svc.entities.Boost.create({
      property_id: propertyId,
      user_id: me.id,
      starts_date: new Date(now).toISOString(),
      ends_date: endsDate,
      status: "active",
      credits_spent: 1,
    });

    // Câmpuri denormalizate: sortarea și ștampila „Promovat" le citesc direct
    // de pe anunț, fără un query separat per card.
    await svc.entities.Property.update(propertyId, {
      boost_active: true,
      boost_ends_date: endsDate,
    });

    const after = await addCredits(svc, {
      userId: me.id, delta: -1, reason: "spend", sourceId: propertyId, note: p.title || "",
    });

    return Response.json({ ok: true, balance: after, boost_ends_date: endsDate });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Eroare la promovare." });
  }
}
