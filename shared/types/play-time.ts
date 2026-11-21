export const PLAY_TIME_EVENT_TYPES = [
  "start",
  "heartbeat",
  "pause",
  "finish",
] as const;

export type PlayTimeEventType = (typeof PLAY_TIME_EVENT_TYPES)[number];

export interface PlayTimeEventRequest {
  type: PlayTimeEventType;
  campaignId: string;
}
