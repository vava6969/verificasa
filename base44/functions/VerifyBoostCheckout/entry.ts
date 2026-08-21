import { secrets } from "base44:runtime";
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { addCredits } from "../../shared/boosts.js";

// Confirmă server-side o plată de boost-uri și scrie creditele în registru.
// Idempotent pe session_id: o reîncărcare a paginii de succes nu dublează.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: "Trebuie să fii autentificat." });

    let body: any = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const sessionId = body?.session_id;
    if (!sessionId) return Response.json({ error: "session_id lipsă." });

    const secretKey = secrets.get("StripeTest");
    if (!secretKey) return Response.json({ error: "Plățile nu sunt configurate încă." });

    const svc = base44.asServiceRole;

    const already = await svc.entities.BoostCredit.filter({ source_id: sessionId }, "-created_date", 1);
    if (already.length) {
      return Response.json({ ok: true, already_processed: true, balance: already[0].balance_after });
    }

    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const session: any = await res.json().catch(() => null);
    if (!res.ok || !session) {
      return Response.json({ error: session?.error?.message || `Stripe a refuzat cererea (HTTP ${res.status}).` });
    }
    if (session.payment_status !== "paid" || session.status !== "complete") {
      return Response.json({ error: "Plata nu este confirmată încă." });
    }
    const sessionUserId = session.client_reference_id || session.metadata?.user_id;
    if (sessionUserId !== me.id) return Response.json({ error: "Sesiunea de plată nu îți aparține." });

    const boosts = parseInt(session.metadata?.boosts || "0", 10);
    if (!boosts || boosts < 1) return Response.json({ error: "Pachet necunoscut în sesiunea de plată." });

    const balance = await addCredits(svc, {
      userId: me.id, delta: boosts, reason: "purchase", sourceId: sessionId,
      note: `Pachet ${session.metadata?.pack_id || ""}`,
    });

    return Response.json({ ok: true, boosts, balance });
  } catch (e: any) {
    return Response.json({ error: e?.message || String(e) });
  }
}
