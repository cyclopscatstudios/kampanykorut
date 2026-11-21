import { describe, expect, it } from "vitest";
import {
  applyPlayTimeEvent,
  MAX_ACTIVE_GAP_MS,
  type PlayTimeEvent,
  type PlayTimeRecord,
} from "./play-time";

const START = new Date("2026-11-20T10:00:00Z");
const at = (seconds: number) => new Date(START.getTime() + seconds * 1000);
const event = (type: PlayTimeEvent["type"]): PlayTimeEvent => ({
  sessionId: "session-1",
  campaignId: "2026",
  type,
});

function play(steps: [number, PlayTimeEvent["type"]][]) {
  let record: PlayTimeRecord | null = null;
  for (const [seconds, type] of steps) {
    record = applyPlayTimeEvent(record, event(type), at(seconds)) ?? record;
  }
  return record;
}

describe("applyPlayTimeEvent", () => {
  it("starts a session on the first start or heartbeat", () => {
    expect(applyPlayTimeEvent(null, event("start"), START)).toEqual({
      sessionId: "session-1",
      campaignId: "2026",
      status: "active",
      activeMs: 0,
      segments: 1,
      startedAt: START,
      lastActiveAt: START,
      finishedAt: null,
      revision: 0,
    });
    expect(applyPlayTimeEvent(null, event("heartbeat"), START)?.status).toBe(
      "active",
    );
  });

  it("ignores pause and finish for unknown sessions", () => {
    expect(applyPlayTimeEvent(null, event("pause"), START)).toBeNull();
    expect(applyPlayTimeEvent(null, event("finish"), START)).toBeNull();
  });

  it("adds up active time between heartbeats until the result screen", () => {
    const record = play([
      [0, "start"],
      [30, "heartbeat"],
      [60, "heartbeat"],
      [75, "finish"],
    ]);

    expect(record).toMatchObject({
      status: "finished",
      activeMs: 75_000,
      segments: 1,
      finishedAt: at(75),
    });
  });

  it("does not count the time spent away after a pause", () => {
    const record = play([
      [0, "start"],
      [30, "heartbeat"],
      [40, "pause"],
      [3600, "start"],
      [3630, "heartbeat"],
      [3650, "finish"],
    ]);

    expect(record).toMatchObject({ activeMs: 90_000, segments: 2 });
  });

  it("drops the open stretch when the pause never arrived", () => {
    const record = play([
      [0, "start"],
      [30, "heartbeat"],
      [30 + MAX_ACTIVE_GAP_MS / 1000 + 1, "start"],
      [30 + MAX_ACTIVE_GAP_MS / 1000 + 31, "heartbeat"],
    ]);

    expect(record).toMatchObject({ activeMs: 60_000, segments: 2 });
  });

  it("counts overlapping tabs of the same session only once", () => {
    const record = play([
      [0, "start"],
      [10, "start"],
      [30, "heartbeat"],
      [40, "heartbeat"],
    ]);

    expect(record).toMatchObject({ activeMs: 40_000, segments: 1 });
  });

  it("finishes from a paused session without adding the time away", () => {
    const record = play([
      [0, "start"],
      [20, "pause"],
      [500, "finish"],
    ]);

    expect(record).toMatchObject({ status: "finished", activeMs: 20_000 });
  });

  it("ignores events after the session finished or a repeated pause", () => {
    const finished = play([
      [0, "start"],
      [10, "finish"],
    ])!;
    const paused = play([
      [0, "start"],
      [10, "pause"],
    ])!;

    expect(applyPlayTimeEvent(finished, event("start"), at(20))).toBeNull();
    expect(applyPlayTimeEvent(paused, event("pause"), at(20))).toBeNull();
  });
});
