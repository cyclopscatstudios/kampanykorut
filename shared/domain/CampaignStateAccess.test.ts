import { CampaignState } from "../types";
import {
  acknowledgeAnnouncement,
  getCampaignEventState,
  getCandidateStatus,
  getInactiveCandidateIds,
  getPendingAnnouncement,
} from "./CampaignStateAccess";

const legacyState = {} as Pick<CampaignState, "candidates" | "campaignEvents">;

describe("CampaignStateAccess", () => {
  it("treats every candidate as active in a save without candidate state", () => {
    expect(getCandidateStatus(legacyState, "szentkiralyi")).toBe("active");
    expect(getInactiveCandidateIds(legacyState)).toEqual([]);
  });

  it("returns the stored status and the inactive candidates in a stable order", () => {
    const state = {
      candidates: {
        vitezy: { status: "active" },
        szentkiralyi: {
          status: "inactive",
          inactiveReason: "withdrawal",
          endorsedCandidateId: "vitezy",
          changedAtTurn: 26,
        },
        grundtner: { status: "inactive", inactiveReason: "other" },
      },
    } as Pick<CampaignState, "candidates">;

    expect(getCandidateStatus(state, "szentkiralyi")).toBe("inactive");
    expect(getCandidateStatus(state, "vitezy")).toBe("active");
    expect(getCandidateStatus(state, "karacsony")).toBe("active");
    expect(getInactiveCandidateIds(state)).toEqual([
      "grundtner",
      "szentkiralyi",
    ]);
  });

  it("returns empty event state for a save without campaign events", () => {
    expect(getCampaignEventState(legacyState)).toEqual({
      triggeredEventIds: [],
      pendingAnnouncementIds: [],
    });
  });

  it("returns the stored event state", () => {
    const campaignEvents = {
      triggeredEventIds: ["szentkiralyi_withdrawal"],
      pendingAnnouncementIds: ["szentkiralyi_withdrawal"],
    };

    expect(getCampaignEventState({ campaignEvents })).toEqual(campaignEvents);
  });
});

describe("announcements", () => {
  const events = [
    { id: "silent", conditions: [] },
    {
      id: "withdrawal",
      conditions: [],
      announcement: { title: "Visszalép", body: "Változott a mezőny." },
    },
  ];
  const state = {
    activeCampaignId: "x",
    turn: 3,
    isEnded: false,
    isBaseResultsAlreadyApplied: true,
    campaignEvents: {
      triggeredEventIds: ["silent", "withdrawal"],
      pendingAnnouncementIds: ["missing", "withdrawal"],
    },
  } as CampaignState;

  it("returns the first pending announcement that exists in the events", () => {
    expect(getPendingAnnouncement(state, events)).toEqual({
      eventId: "withdrawal",
      announcement: events[1].announcement,
    });
    expect(getPendingAnnouncement(state, [])).toBeUndefined();
    expect(getPendingAnnouncement(legacyState, events)).toBeUndefined();
  });

  it("removes an acknowledged announcement and keeps the triggered events", () => {
    const next = acknowledgeAnnouncement(state, "withdrawal");

    expect(next.campaignEvents).toEqual({
      triggeredEventIds: ["silent", "withdrawal"],
      pendingAnnouncementIds: ["missing"],
    });
    expect(state.campaignEvents?.pendingAnnouncementIds).toEqual([
      "missing",
      "withdrawal",
    ]);
  });

  it("returns the same state when there is nothing to acknowledge", () => {
    expect(acknowledgeAnnouncement(state, "unknown")).toBe(state);
  });
});
