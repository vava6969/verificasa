// #6 — Comentariu nou la o proprietate → email + notificare către proprietar.
import { client, sendVC, notify, getUserById, getPropertyById, APP_URL } from "../../shared/email.js";

export default async function(req) {
  try {
    const base44 = await client(req);

    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const propertyId = body.property_id;
    const propertyTitle = body.property_title || "Proprietate";
    const authorName = body.author_name || "Un utilizator";
    const content = body.content || "";
    if (!propertyId) {
      return Response.json({ error: "property_id required" }, { status: 400 });
    }

    // Only email the owner of the property when the commenter is not the owner.
    const property = body.property_id_resolved ? null : await getPropertyById(base44, propertyId);
    const ownerId = (property && property.created_by_id) || body.owner_id || null;
    const commenterId = body.commenter_id || null;
    if (!ownerId || ownerId === commenterId) {
      return Response.json({ ok: true, skipped: true });
    }

    const owner = await getUserById(base44, ownerId);
    if (!owner || !owner.email) {
      return Response.json({ ok: true, skipped: true });
    }

    const subject = `💬 Ai un comentariu nou la proprietatea ta`;
    const bodyText = [
      `Salut!`,
      ``,
      `Cineva a lăsat o întrebare sau un comentariu la una dintre proprietățile tale:`,
      ``,
      `🏠 Proprietate: ${propertyTitle}`,
      `👤 Utilizator: ${authorName}`,
      `💬 Comentariu: „${content}"`,
      ``,
      `👉 Răspunde la comentariu în platformă: ${APP_URL}/property/${propertyId}`,
    ].join("\n");

    const emailed = await sendVC(base44, { to: owner.email, subject, body: bodyText });
    const notified = await notify(base44, {
      user_id: owner.id, type: "comment",
      text: `${authorName} a comentat la anunțul tău „${propertyTitle}".`,
      link: `/property/${propertyId}`, actor_name: authorName,
    });

    return Response.json({ ok: true, emailed, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}