import type { PlayTimeEventRequest } from "@shared/types";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";
import {
  HEARTBEAT_INTERVAL_MS,
  playTimePhase,
  PlayTimeTracker,
} from "./PlayTimeTracker";

const playing = {
  sessionId: "s1",
  campaignId: "2026",
  phase: "playing" as const,
};
const finished = { ...playing, phase: "finished" as const };

let visibility: DocumentVisibilityState = "visible";

function setVisibility(state: DocumentVisibilityState) {
  visibility = state;
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("playTimePhase", () => {
  it("maps game routes to playing and the result screen to finished", () => {
    expect(playTimePhase("/game/2026")).toEqual({
      campaignId: "2026",
      phase: "playing",
    });
    expect(playTimePhase("/game/2026/dashboard")?.phase).toBe("playing");
    expect(playTimePhase("/game/2026/coalition")?.phase).toBe("playing");
    expect(playTimePhase("/game/2026/end-results")?.phase).toBe("finished");
    expect(playTimePhase("/menu")).toBeNull();
    expect(playTimePhase("/new-game/classic/sides/2026")).toBeNull();
  });
});

describe("PlayTimeTracker", () => {
  let send: Mock<(sessionId: string, event: PlayTimeEventRequest) => void>;
  let tracker: PlayTimeTracker;

  const types = () => send.mock.calls.map(([, event]) => event.type);

  beforeEach(() => {
    vi.useFakeTimers();
    visibility = "visible";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(
      () => visibility,
    );
    send = vi.fn();
    tracker = new PlayTimeTracker(send);
  });

  afterEach(() => {
    tracker.update(null);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("starts, sends heartbeats and finishes without a pause in between", () => {
    tracker.update(playing);
    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS * 2);
    tracker.update({ ...playing, campaignId: "2026" });
    tracker.update(finished);
    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

    expect(types()).toEqual(["start", "heartbeat", "heartbeat", "finish"]);
    expect(send).toHaveBeenCalledWith("s1", {
      type: "finish",
      campaignId: "2026",
    });
  });

  it("pauses while the tab is hidden and resumes when it is shown", () => {
    tracker.update(playing);
    setVisibility("hidden");
    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS * 3);
    setVisibility("visible");

    expect(types()).toEqual(["start", "pause", "start"]);
  });

  it("pauses when the page is closed or the player leaves the game", () => {
    tracker.update(playing);
    window.dispatchEvent(new Event("pagehide"));
    tracker.update(null);
    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

    expect(types()).toEqual(["start", "pause", "pause"]);
  });

  it("waits for the tab to become visible before starting", () => {
    visibility = "hidden";
    tracker.update(playing);
    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);
    setVisibility("visible");

    expect(types()).toEqual(["start"]);
  });

  it("pauses the previous session when another one starts", () => {
    tracker.update(playing);
    tracker.update({ ...playing, sessionId: "s2" });

    expect(send.mock.calls).toEqual([
      ["s1", { type: "start", campaignId: "2026" }],
      ["s1", { type: "pause", campaignId: "2026" }],
      ["s2", { type: "start", campaignId: "2026" }],
    ]);
  });
});
