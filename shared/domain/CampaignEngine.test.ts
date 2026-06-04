import { container } from "tsyringe";
import { CampaignEngine } from "./CampaignEngine";
import { EffectApplier } from "./EffectApplier";
import { MandateCalculator } from "./MandateCalculator";
import { campaignState } from "./mocks/mockCampaignState";
import { mockElectionConfig } from "./mocks/mockElectionConfig";
import { mockCandidateListData, mockPartyListData } from "./mocks/mockListData";
import { ResultModifier } from "./ResultModifier";
import {
  Decision,
  EffectType,
  ElectionConfig,
  RawEffect,
} from "@/shared/types";

let campaignEngine: CampaignEngine;

const getDecision = (effects: RawEffect[]): Decision => ({
  questionId: "q1",
  answerId: "a1",
  effects,
});

describe("CampaignEngine", () => {
  beforeAll(() => {
    const resultModifier = container.resolve(ResultModifier);

    campaignEngine = new CampaignEngine(
      mockCandidateListData,
      mockPartyListData,
      [],
      [],
      resultModifier,
      container.resolve(EffectApplier),
      container.resolve(MandateCalculator),
    );
  });
  it("should apply the party-swing typed decision", () => {
    const decision = getDecision([
      {
        type: EffectType.UniformSwing,
        params: {
          party_a: 5,
          party_b: -3,
        },
      },
    ]);

    const result = campaignEngine.processTurn(
      campaignState,
      decision,
      [],
      {
        showAdvisorFeedback: true,
        language: "en",
      },
      mockElectionConfig,
    );
    expect(result).toMatchSnapshot();
  });
  it("should apply party-share typed decision", () => {
    const decision = getDecision([
      {
        type: EffectType.VoteAllocation,
        params: {
          newVotes: 100000,
          share: {
            party_a: 0.6,
            party_b: 0.4,
          },
        },
      },
    ]);

    const result = campaignEngine.processTurn(
      campaignState,
      decision,
      [],
      {
        showAdvisorFeedback: true,
        language: "en",
      },
      mockElectionConfig,
    );
    expect(result).toMatchSnapshot();
  });
  it("should apply motivation typed decision", () => {
    const decision = getDecision([
      {
        type: EffectType.TurnoutChange,
        params: {
          party_a: 4,
          party_b: -2,
        },
      },
    ]);

    const result = campaignEngine.processTurn(
      campaignState,
      decision,
      [],
      {
        showAdvisorFeedback: true,
        language: "en",
      },
      mockElectionConfig,
    );
    expect(result).toMatchSnapshot();
  });
  it("should apply district typed decision", () => {
    const decision = getDecision([
      {
        type: EffectType.DistrictVoteTransfer,
        params: [
          {
            amount: 50,
            megyekod: 1,
            oevk: 1,
            targetParty: "party_b",
            from: { party: "party_a", type: "party" },
          },
        ],
      },
    ]);

    const result = campaignEngine.processTurn(
      campaignState,
      decision,
      [],
      {
        showAdvisorFeedback: true,
        language: "en",
      },
      mockElectionConfig,
    );
    expect(result).toMatchSnapshot();
  });
});

describe("CampaignEngine.createInitialState", () => {
  let engine: CampaignEngine;

  beforeAll(() => {
    engine = new CampaignEngine(
      mockCandidateListData,
      mockPartyListData,
      [],
      [],
      container.resolve(ResultModifier),
      container.resolve(EffectApplier),
      container.resolve(MandateCalculator),
    );
  });

  it("creates fresh state when savedState is null", () => {
    const result = engine.createInitialState("test-campaign", null);

    expect(result.turn).toBe(0);
    expect(result.isEnded).toBe(false);
    expect(result.candidateListData).toEqual(mockCandidateListData);
  });

  it("returns savedState directly when it has candidateListData", () => {
    const savedState = {
      activeCampaignId: "test-campaign",
      turn: 5,
      isEnded: false,
      candidateListData: mockCandidateListData,
      partyListData: mockPartyListData,
    };

    const result = engine.createInitialState("test-campaign", savedState);

    expect(result).toBe(savedState);
    expect(result.turn).toBe(5);
  });

  it("creates fresh state when savedState has no candidateListData", () => {
    const savedState = {
      activeCampaignId: "test-campaign",
      turn: 3,
      isEnded: false,
    };

    const result = engine.createInitialState("test-campaign", savedState);

    expect(result.turn).toBe(0);
    expect(result.candidateListData).toEqual(mockCandidateListData);
  });

  it("applies baseResults when creating fresh state", () => {
    const electionConfig = {
      baseResults: { party_a: 3, party_b: -2 },
      thresholdPercent: 5,
    } as unknown as ElectionConfig;

    const withBase = engine.createInitialState(
      "test-campaign",
      null,
      electionConfig,
    );
    const withoutBase = engine.createInitialState("test-campaign", null);

    expect(withBase.candidateListData).not.toEqual(
      withoutBase.candidateListData,
    );
  });

  it("baseResults are ignored when savedState has candidateListData", () => {
    const savedState = {
      activeCampaignId: "test-campaign",
      turn: 2,
      isEnded: false,
      candidateListData: mockCandidateListData,
    };
    const electionConfig = {
      baseResults: { party_a: 99 },
      thresholdPercent: 5,
    } as unknown as ElectionConfig;

    const result = engine.createInitialState(
      "test-campaign",
      savedState,
      electionConfig,
    );

    expect(result).toBe(savedState);
  });
});
