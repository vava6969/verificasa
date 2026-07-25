import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Called right after a user posts a new property. We fan-out a
    // "approval pending" notification to every admin so they can
    // approve / reject the listing from the Admin panel.
    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const propertyId = body.property_id;
    const title = body.title || "Anunț nou";
    const ownerName = body.owner_name || "Un utilizator";
    if (!propertyId) {
      return Response.json({ error: "property_id required" }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.list();
    const adminRoles = ["ADMIN", "admin", "SUPER_ADMIN", "super_admin"];
    const admins = (users || []).filter((u) => adminRoles.includes(u.role));

    let notified = 0;
    if (admins.length) {
      const notes = admins.map((a) => ({
        user_id: a.id,
        type: "property",
        text: `Anunț nou „${title}" așteaptă aprobarea ta.`,
        link: "/admin",
        actor_name: ownerName,
        read: false,
      }));
      await base44.asServiceRole.entities.Notification.bulkCreate(notes);
      notified = notes.length;
    }

    return Response.json({ ok: true, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});