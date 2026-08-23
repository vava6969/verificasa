import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { BOOST_WARNING_DAYS_BEFORE } from "../../shared/boosts.js";

// Boost-urile durează 21 de zile de la ultima promovare (decizia clientului,
// 23.08 — înlocuiește decizia anterioară din 22.08, când nu expirau deloc).
// Funcția asta face DOUĂ treceri peste anunțurile cu boost activ:
//   1. Avertisment — dacă mai sunt ≤ BOOST_WARNING_DAYS_BEFORE zile și încă
//      nu s-a trimis avertismentul (boost_expiry_warned), trimite-l acum.
//   2. Expirare — dacă boost_ends_date a trecut, stinge boost_active și
//      anunță proprietarul. boost_count NU scade — e un contor istoric.
//
// De rulat pe program (din Base44, dacă platforma suportă scheduling pentru
// funcții) sau manual dintr-un buton de Admin. Idempotent: rularea de mai
// multe ori pe aceleași anunțuri nu retrimite avertismentul (boost_expiry_warned)
// și nu re-expiră ce e deja expirat (boost_active devine false o singură dată).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const now = new Date();
    const warnCutoff = new Date(now.getTime() + BOOST_WARNING_DAYS_BEFORE * 24 * 60 * 60 * 1000);

    const boosted: any[] = await svc.entities.Property.filter({ boost_active: true }, "-created_date", 500);

    let warned = 0;
    let expired = 0;

    for (const p of boosted) {
      if (!p.boost_ends_date) continue;
      const endsAt = new Date(p.boost_ends_date);

      if (endsAt <= now) {
        try {
          await svc.entities.Property.update(p.id, { boost_active: false });
          await svc.entities.Notification.create({
            user_id: p.created_by_id,
            type: "system",
            text: `Promovarea pentru „${p.title || "anunțul tău"}” a expirat.`,
            link: "/my-properties",
            actor_name: "VerifiCasa",
            read: false,
          });
          expired += 1;
        } catch (_) { /* best-effort — trecem la următorul anunț */ }
        continue;
      }

      if (endsAt <= warnCutoff && !p.boost_expiry_warned) {
        try {
          const daysLeft = Math.max(1, Math.ceil((endsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
          await svc.entities.Property.update(p.id, { boost_expiry_warned: true });
          await svc.entities.Notification.create({
            user_id: p.created_by_id,
            type: "system",
            text: `Promovarea pentru „${p.title || "anunțul tău"}” expiră în ${daysLeft} ${daysLeft === 1 ? "zi" : "zile"}.`,
            link: "/my-properties",
            actor_name: "VerifiCasa",
            read: false,
          });
          warned += 1;
        } catch (_) { /* best-effort — trecem la următorul anunț */ }
      }
    }

    return Response.json({ ok: true, checked: boosted.length, warned, expired });
  } catch (error: any) {
    return Response.json({ error: error?.message || String(error) });
  }
}
