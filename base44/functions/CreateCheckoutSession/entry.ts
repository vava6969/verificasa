import { secrets } from "base44:runtime";
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Creează o sesiune Stripe Checkout (mod abonament) pentru planul + intervalul
// cerut din pagina „Planuri Upgrade” și returnează URL-ul de plată către care
// frontend-ul redirecționează browserul. Cheia secretă Stripe rămâne doar pe
// server — necesită secretul StripeTest setat în Settings → Secrets ale acestei
// aplicații (Stripe Dashboard → Developers → API keys, momentan sk_test_...
// din sandbox-ul Stripe; la lansare, adaugă un secret separat cu cheia live
// și schimbă numele de mai jos).
//
// Prețurile sunt cele create în Stripe (mod test) pentru VerifiCasa Basic/Pro/Agent,
// lunar + anual, în RON — vezi PlanuriUpgrade.jsx pentru sumele afișate în UI.
const PRICE_MAP: Record<string, { monthly: string; yearly: string }> = {
  basic: { monthly: "price_1U4lpPPq70JhwVjjf3HRAvrG", yearly: "price_1U4lpSPq70JhwVjj6EQtrzc4" },
  pro: { monthly: "price_1U4lpVPq70JhwVjjIx1V9Yfa", yearly: "price_1U4lpXPq70JhwVjj0lyu1xZW" },
  agent: { monthly: "price_1U4lpaPq70JhwVjjxrzOPFZ3", yearly: "price_1U4lpcPq70JhwVjjPyfjXJGK" },
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    // Notă: răspundem mereu cu status 200 și un câmp `error` (nu coduri HTTP 4xx/5xx)
    // pentru că SDK-ul base44 din browser aruncă o eroare generică pe orice status
    // non-2xx și mesajul nostru detaliat nu mai ajunge la utilizator.
    if (!me?.id) return Response.json({ error: "Trebuie să fii autentificat." });

    const secretKey = secrets.get("StripeTest");
    if (!secretKey) {
      return Response.json({ error: "Plățile nu sunt configurate încă — lipsește secretul StripeTest." });
    }

    let body: any = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const { plan_id, interval } = body || {};
    const priceId = PRICE_MAP[plan_id]?.[interval];
    if (!priceId) {
      return Response.json({ error: "Plan sau interval de facturare necunoscut." });
    }

    const origin = req.headers.get("origin") || req.headers.get("referer") || "https://verificasa.ro";
    const baseUrl = origin.replace(/\/$/, "").replace(/\/upgrade.*$/, "");

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("success_url", `${baseUrl}/upgrade?checkout=success`);
    params.set("cancel_url", `${baseUrl}/upgrade?checkout=cancelled`);
    params.set("client_reference_id", me.id);
    if (me.email) params.set("customer_email", me.email);
    params.set("metadata[plan_id]", plan_id);
    params.set("metadata[user_id]", me.id);
    params.set("subscription_data[metadata][plan_id]", plan_id);
    params.set("subscription_data[metadata][user_id]", me.id);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const sessionJson = await stripeRes.json().catch(() => null);
    if (!stripeRes.ok || !sessionJson?.url) {
      const detail = sessionJson?.error?.message || `Stripe a refuzat cererea (HTTP ${stripeRes.status}).`;
      return Response.json({ error: detail });
    }

    return Response.json({ ok: true, url: sessionJson.url });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) });
  }
}
