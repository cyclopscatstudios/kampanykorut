import { CampaignState } from "../types";
import {
  getCampaignEventState,
  getCandidateStatus,
  getInactiveCandidateIds,
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
