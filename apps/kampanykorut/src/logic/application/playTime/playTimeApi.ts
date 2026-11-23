import type { PlayTimeEventRequest } from "@shared/types";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export function sendPlayTimeEvent(
  sessionId: string,
  event: PlayTimeEventRequest,
) {
  fetch(
    `${API_BASE}/api/v1/play-time/${encodeURIComponent(sessionId)}/events`,
    {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
    },
  ).catch(() => undefined);
}
