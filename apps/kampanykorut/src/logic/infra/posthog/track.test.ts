import posthog from "posthog-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCampaignOutcome,
  getLoadDurationBucket,
  getMayoralCampaignOutcome,
  getRunProperties,
  getStorageKeyKind,
} from "./events";
import { resetTrackOnce, track, trackOnce } from "./track";

vi.mock("posthog-js", () => ({
  default: {
    __loaded: false,
    capture: vi.fn(),
    has_opted_out_capturing: vi.fn(() => false),
  },
}));

const mockedPosthog = posthog as unknown as {
  __loaded: boolean;
  capture: ReturnType<typeof vi.fn>;
  has_opted_out_capturing: ReturnType<typeof vi.fn>;
};

describe("track", () => {
  beforeEach(() => {
    mockedPosthog.__loaded = true;
    mockedPosthog.capture.mockClear();
    mockedPosthog.has_opted_out_capturing.mockReturnValue(false);
    resetTrackOnce();
  });

  it("captures the event with its properties", () => {
    track("landing_exited", { target: "menu" });
    expect(mockedPosthog.capture).toHaveBeenCalledWith("landing_exited", {
      target: "menu",
    });
  });

  it("is a no-op when PostHog was not initialized", () => {
    mockedPosthog.__loaded = false;
    track("landing_exited", { target: "menu" });
    expect(mockedPosthog.capture).not.toHaveBeenCalled();
  });

  it("is a no-op when the player opted out", () => {
    mockedPosthog.has_opted_out_capturing.mockReturnValue(true);
    track("landing_exited", { target: "menu" });
    expect(mockedPosthog.capture).not.toHaveBeenCalled();
  });

  it("sends a once-per-run event only once per key", () => {
    const run = getRunProperties("session-1", "campaign");
    const other = getRunProperties("session-2", "campaign");
    trackOnce(run.run_id, "first_question_viewed", run);
    trackOnce(run.run_id, "first_question_viewed", run);
    trackOnce(other.run_id, "first_question_viewed", other);
    expect(mockedPosthog.capture).toHaveBeenCalledTimes(2);
  });
});

describe("event property helpers", () => {
  it("builds run properties with a combined side id", () => {
    expect(
      getRunProperties("session", "2022", {
        partyId: "fidesz",
        candidateId: "orban_viktor",
      }),
    ).toEqual({
      run_id: expect.any(String),
      campaign_id: "2022",
      side_id: "fidesz/orban_viktor",
    });
    expect(
      getRunProperties("run", "2022", { partyId: "fidesz" }).side_id,
    ).toBeUndefined();
  });

  it("keeps one random run id per session without exposing the session id", () => {
    const first = getRunProperties("stored-session-id", "2022").run_id;

    expect(first).not.toBe("stored-session-id");
    expect(getRunProperties("stored-session-id", "2026").run_id).toBe(first);
    expect(getRunProperties("another-session-id", "2022").run_id).not.toBe(
      first,
    );
  });

  it.each([
    [0, "<1s"],
    [999, "<1s"],
    [1000, "1-3s"],
    [2999, "1-3s"],
    [3000, "3-10s"],
    [10000, ">10s"],
  ])("buckets %i ms as %s", (ms, bucket) => {
    expect(getLoadDurationBucket(ms)).toBe(bucket);
  });

  it.each([
    ["kampanykorut_campaignState-abc", "campaign_state"],
    ["kampanykorut_turnHistory-abc", "turn_history"],
    ["kampanykorut_settings", "other"],
  ])("classifies storage key %s as %s", (key, kind) => {
    expect(getStorageKeyKind(key)).toBe(kind);
  });

  it.each([
    ["tisza", true, "tisza", "win"],
    ["fidesz", true, "tisza", "loss"],
    ["tisza", false, "tisza", "deadlock"],
    [undefined, false, "tisza", "deadlock"],
  ] as const)(
    "winner %s with majority %s for player %s is a %s",
    (winner, hasMajority, player, outcome) => {
      expect(getCampaignOutcome(winner, hasMajority, player)).toBe(outcome);
    },
  );

  it.each([
    [{ kind: "winner", candidateId: "vitezy" }, "win"],
    [{ kind: "winner", candidateId: "karacsony" }, "loss"],
    [{ kind: "tie", candidateIds: ["vitezy", "karacsony"] }, "deadlock"],
    [{ kind: "no_winner" }, "deadlock"],
    [undefined, "deadlock"],
  ] as const)("mayoral outcome %j for vitezy is a %s", (result, outcome) => {
    expect(
      getMayoralCampaignOutcome(
        result as Parameters<typeof getMayoralCampaignOutcome>[0],
        "vitezy",
      ),
    ).toBe(outcome);
  });
});
