import { query } from "@/lib/db";

const EVENT_LABELS = {
  created: "Application created",
  analyzed: "Analysis completed",
  edited: "Application details edited",
  status_updated: "Application status updated",
  deleted: "Application deleted",
};

export function getEventLabel(eventType) {
  return EVENT_LABELS[eventType] || "Application activity";
}

export async function recordApplicationEvent({
  userId,
  sessionId = null,
  eventType,
  metadata = {},
}) {
  if (!userId || !eventType) return;

  await query(
    `INSERT INTO application_events (
      user_id,
      session_id,
      event_type,
      event_label,
      metadata,
      occurred_at
    ) VALUES ($1, $2, $3, $4, $5::jsonb, NOW())`,
    [
      userId,
      sessionId,
      eventType,
      getEventLabel(eventType),
      JSON.stringify(metadata),
    ],
  );
}
