import { base44 } from "@/api/base44Client";

/**
 * Creates a notification record for a given recipient. Fire-and-forget —
 * never throws so it won't break the calling flow (comment/message/like).
 */
export async function createNotification({ userId, type, text, link, actorName }) {
  if (!userId) return;
  try {
    await base44.entities.Notification.create({
      user_id: userId,
      type: type || "system",
      text: text || "",
      link: link || "",
      actor_name: actorName || "",
      read: false,
    });
  } catch (e) {
    /* ignore — notifications are best-effort */
  }
}