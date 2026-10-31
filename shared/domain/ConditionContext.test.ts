import { CampaignState, ElectionConfig, MayoralResult } from "../types";
import { createConditionContext } from "./ConditionContext";
import { mockElectionConfig } from "./mocks/mockElectionConfig";

const mayoralConfig = {
  ...mockElectionConfig,
  election: { type: "mayoral" },
  parties: [
    { id: "karacsony", name: "K", color: "#00f" },
    { id: "vitezy", name: "V", color: "#0f0" },
    { id: "szentkiralyi", name: "Sz", color: "#f60" },
    { id: "grundtner", name: "G", color: "#000" },
  ],
} as ElectionConfig;

const mayoralState = {
  activeCampaignId: "budapest_2024",
  turn: 26,
  isEnded: false,
  isBaseResultsAlreadyApplied: true,
  candidates: {
    szentkiralyi: { status: "inactive", inactiveReason: "withdrawal" },
  },
  campaignEvents: {
    triggeredEventIds: ["szentkiralyi_withdrawal"],
    pendingAnnouncementIds: [],
  },
  mayoralResult: {
    percentages: { karacsony: 0.48, vitezy: 0.52 },
  } as unknown as MayoralResult,
} as CampaignState;

describe("createConditionContext", () => {
  it("reads turn, answers, statuses and triggered events from the state", () => {
    const answers = [{ questionId: "q1", answerId: "A" }];
    const ctx = createConditionContext(mayoralState, answers, mayoralConfig);

    expect(ctx.turn).toBe(26);
    expect(ctx.answers).toBe(answers);
    expect(ctx.getCandidateStatus("szentkiralyi")).toBe("inactive");
    expect(ctx.getCandidateStatus("vitezy")).toBe("active");
    expect(ctx.triggeredEventIds).toEqual(["szentkiralyi_withdrawal"]);
  });

  it("uses the city-wide mayoral shares in a mayoral election", () => {
    const ctx = createConditionContext(mayoralState, [], mayoralConfig);

    expect(ctx.getSupport("vitezy")).toBe(0.52);
  });

  it("reports zero support for ballot candidates without valid votes", () => {
    const ctx = createConditionContext(mayoralState, [], mayoralConfig);

    expect(ctx.getSupport("szentkiralyi")).toBe(0);
    expect(ctx.getSupport("grundtner")).toBe(0);
  });

  it("reports no support for ids that are not on the ballot or without results", () => {
    expect(
      createConditionContext(mayoralState, [], mayoralConfig).getSupport(
        "fidesz",
      ),
    ).toBeUndefined();
    expect(
      createConditionContext(
        { ...mayoralState, mayoralResult: undefined },
        [],
        mayoralConfig,
      ).getSupport("vitezy"),
    ).toBeUndefined();
  });

  it("uses the candidate list shares in a parliamentary election", () => {
    const state = {
      activeCampaignId: "x",
      turn: 3,
      isEnded: false,
      isBaseResultsAlreadyApplied: true,
      results: {
        percentages: {
          candidateListResults: { party_a: 0.4 },
          partyListResults: { party_a: 0.9 },
        },
      },
    } as unknown as CampaignState;

    const ctx = createConditionContext(state, [], mockElectionConfig);

    expect(ctx.getSupport("party_a")).toBe(0.4);
    expect(ctx.triggeredEventIds).toEqual([]);
    expect(ctx.getCandidateStatus("party_a")).toBe("active");
  });
});
