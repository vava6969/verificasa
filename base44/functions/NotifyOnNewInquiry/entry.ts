import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const inquiry = body.inquiry || {};
    const propertyId = inquiry.property_id || body.property_id;
    const propertyTitle = inquiry.property_title || body.property_title || "Proprietate";
    const name = inquiry.name || body.name || "Un chiriaș";
    const email = inquiry.email || body.email || "—";
    const phone = inquiry.phone || body.phone || "—";
    const occupation = inquiry.occupation || body.occupation || "—";
    const income = inquiry.estimated_income || body.estimated_income;
    const moveDate = inquiry.move_date || body.move_date || "—";
    const visitDate = inquiry.preferred_visit_date || body.preferred_visit_date || "—";
    const message = inquiry.message || body.message || "—";
    const appUrl = body.app_url || "https://app.base44.com";

    if (!propertyId) {
      return Response.json({ error: "property_id required" }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.list();
    const adminRoles = ["ADMIN", "admin", "SUPER_ADMIN", "super_admin"];
    const admins = (users || []).filter((u) => adminRoles.includes(u.role));

    let emailed = 0;
    let notified = 0;

    const subject = `Cerere nouă de închiriere — ${propertyTitle}`;
    const bodyText = [
      `Ai primit o cerere nouă de la un chiriaș pentru ${propertyTitle}.`,
      ``,
      `Nume: ${name}`,
      `Email: ${email}`,
      `Telefon: ${phone || "—"}`,
      `Ocupație: ${occupation || "—"}`,
      income ? `Venit estimat lunar: ${income}` : null,
      `Data mutării: ${moveDate || "—"}`,
      `Data vizionării preferată: ${visitDate || "—"}`,
      ``,
      `Mesaj:`,
      message || "—",
      ``,
      `Vezi și gestionează cererea din panoul tău: ${appUrl}`,
    ].filter(Boolean).join("\n");

    const notes = [];
    for (const a of admins) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: a.email,
          subject,
          body: bodyText,
          from_name: "VerifiCasa",
        });
        emailed += 1;
      } catch (e) {
        // Email delivery to this admin failed (e.g. not a registered user) —
        // continue; the in-app notification still reaches them.
      }
      notes.push({
        user_id: a.id,
        type: "message",
        text: `Cerere nouă de la ${name} pentru „${propertyTitle}".`,
        link: "/my-properties",
        actor_name: name,
        read: false,
      });
    }

    if (notes.length) {
      await base44.asServiceRole.entities.Notification.bulkCreate(notes);
      notified = notes.length;
    }

    return Response.json({ ok: true, emailed, notified, admins: admins.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}