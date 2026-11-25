import type { PlayTimeEventType } from "@shared/types/play-time";

export const HEARTBEAT_INTERVAL_MS = 30_000;
export const MAX_ACTIVE_GAP_MS = 3 * HEARTBEAT_INTERVAL_MS;

export type PlayTimeStatus = "active" | "paused" | "finished";

export interface PlayTimeRecord {
  sessionId: string;
  campaignId: string;
  status: PlayTimeStatus;
  activeMs: number;
  segments: number;
  startedAt: Date;
  lastActiveAt: Date;
  finishedAt: Date | null;
  revision: number;
}

export interface PlayTimeEvent {
  sessionId: string;
  campaignId: string;
  type: PlayTimeEventType;
}

function continuesSegment(record: PlayTimeRecord, now: Date) {
  const gap = now.getTime() - record.lastActiveAt.getTime();
  return record.status === "active" && gap <= MAX_ACTIVE_GAP_MS;
}

export function applyPlayTimeEvent(
  record: PlayTimeRecord | null,
  event: PlayTimeEvent,
  now: Date,
): PlayTimeRecord | null {
  if (!record) {
    if (event.type === "pause" || event.type === "finish") return null;
    return {
      sessionId: event.sessionId,
      campaignId: event.campaignId,
      status: "active",
      activeMs: 0,
      segments: 1,
      startedAt: now,
      lastActiveAt: now,
      finishedAt: null,
      revision: 0,
    };
  }

  if (record.status === "finished") return null;

  const continues = continuesSegment(record, now);
  const activeMs =
    record.activeMs +
    (continues
      ? Math.max(0, now.getTime() - record.lastActiveAt.getTime())
      : 0);

  switch (event.type) {
    case "start":
    case "heartbeat":
      return {
        ...record,
        status: "active",
        activeMs,
        segments: continues ? record.segments : record.segments + 1,
        lastActiveAt: now,
      };
    case "pause":
      if (record.status === "paused") return null;
      return { ...record, status: "paused", activeMs, lastActiveAt: now };
    case "finish":
      return {
        ...record,
        status: "finished",
        activeMs,
        lastActiveAt: now,
        finishedAt: now,
      };
  }
}
