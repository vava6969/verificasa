// Shared email + notification helpers used by all VerifiCasa notification
// backend functions. Keep logic here so every function stays in sync.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ADMIN_ROLES = ["ADMIN", "admin", "SUPER_ADMIN", "super_admin"];
export const FROM_NAME = "VerifiCasa";
export const APP_URL = "https://verificasa.site";

export async function client(req) {
  return createClientFromRequest(req);
}

export async function getAdmins(base44) {
  const users = await base44.asServiceRole.entities.User.list();
  return (users || []).filter((u) => ADMIN_ROLES.includes(u.role));
}

// Best-effort email send. SendEmail only reaches registered app users —
// failures (unregistered address) are swallowed and reported via the flag.
export async function sendVC(base44, { to, subject, body }) {
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body, from_name: FROM_NAME });
    return true;
  } catch (_) {
    return false;
  }
}

export async function notify(base44, { user_id, type, text, link, actor_name }) {
  if (!user_id) return false;
  try {
    await base44.asServiceRole.entities.Notification.create({
      user_id, type: type || "system", text: text || "", link: link || "", actor_name: actor_name || "", read: false,
    });
    return true;
  } catch (_) {
    return false;
  }
}

export async function notifyMany(base44, notes) {
  if (!notes || !notes.length) return 0;
  try {
    await base44.asServiceRole.entities.Notification.bulkCreate(notes);
    return notes.length;
  } catch (_) {
    return 0;
  }
}

export async function getUserById(base44, id) {
  if (!id) return null;
  try {
    return await base44.asServiceRole.entities.User.get(id);
  } catch (_) {
    return null;
  }
}

export async function getPropertyById(base44, id) {
  if (!id) return null;
  try {
    return await base44.asServiceRole.entities.Property.get(id);
  } catch (_) {
    return null;
  }
}