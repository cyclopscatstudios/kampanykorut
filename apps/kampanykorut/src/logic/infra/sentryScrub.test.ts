import { describe, expect, it } from "vitest";
import { REDACTED, scrubSentryData } from "./sentryScrub";

describe("scrubSentryData", () => {
  it("redacts game decisions and session ids at any depth", () => {
    expect(
      scrubSentryData({
        message: "Failed to process turn",
        extra: {
          data: {
            campaignId: "2022_beke_vs_remeny",
            sessionId: "abc",
            turn: 4,
            answerId: "B",
            playerSide: { partyId: "fidesz", candidateId: "orban_viktor" },
            selectedDistrict: 3,
          },
        },
        tags: { campaignId: "2022_beke_vs_remeny", sessionId: "abc" },
        breadcrumbs: [{ data: { data: { targetSessionId: "def" } } }],
      }),
    ).toEqual({
      message: "Failed to process turn",
      extra: {
        data: {
          campaignId: "2022_beke_vs_remeny",
          sessionId: REDACTED,
          turn: 4,
          answerId: REDACTED,
          playerSide: REDACTED,
          selectedDistrict: REDACTED,
        },
      },
      tags: { campaignId: "2022_beke_vs_remeny", sessionId: REDACTED },
      breadcrumbs: [{ data: { data: { targetSessionId: REDACTED } } }],
    });
  });

  it("removes session ids from urls", () => {
    expect(
      scrubSentryData({
        request: {
          url: "https://kampanykorut.hu/game/2026?sessionId=abc-123&x=1",
        },
        spans: [{ description: "GET /game/2026/end-results?sessionId=abc" }],
      }),
    ).toEqual({
      request: {
        url: `https://kampanykorut.hu/game/2026?sessionId=${REDACTED}&x=1`,
      },
      spans: [
        { description: `GET /game/2026/end-results?sessionId=${REDACTED}` },
      ],
    });
  });

  it("leaves unrelated values and errors untouched", () => {
    const error = new Error("boom");
    const scrubbed = scrubSentryData({ error, count: 2, ok: true, none: null });

    expect(scrubbed.error).toBe(error);
    expect(scrubbed).toMatchObject({ count: 2, ok: true, none: null });
  });
});
