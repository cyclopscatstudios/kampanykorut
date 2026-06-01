import {
  Decision,
  EffectType,
  ElectionConfig,
  RawEffect,
} from "@/shared/types";
import { CampaignEngine } from "./CampaignEngine";
import { EffectApplier } from "./EffectApplier";
import { MandateCalculator } from "./MandateCalculator";
import { ResultModifier } from "./ResultModifier";
import { candidateListData, partyListData } from "./mocks/mockListData";
import { container } from "tsyringe";

let campaignEngine: CampaignEngine;

const gameState = {
  activeCampaignId: "test-campaign",
  turn: 0,
  candidateListData,
  partyListData,
  isEnded: false,
};

const getDecision = (effects: RawEffect[]): Decision => ({
  questionId: "q1",
  answerId: "a1",
  effects,
});

describe("CampaignEngine", () => {
  beforeAll(() => {
    const resultModifier = container.resolve(ResultModifier);

    campaignEngine = new CampaignEngine(
      candidateListData,
      partyListData,
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
          fidesz: 5,
          opposition: -3,
        },
      },
    ]);

    const result = campaignEngine.processTurn(gameState, decision, [], {
      showAdvisorFeedback: true,
      language: "en",
    });
    expect(result).toMatchSnapshot();
  });
  it("should apply party-share typed decision", () => {
    const decision = getDecision([
      {
        type: EffectType.VoteAllocation,
        params: {
          newVotes: 100000,
          share: {
            fidesz: 0.6,
            opposition: 0.4,
          },
        },
      },
    ]);

    const result = campaignEngine.processTurn(gameState, decision, [], {
      showAdvisorFeedback: true,
      language: "en",
    });
    expect(result).toMatchSnapshot();
  });
  it("should apply motivation typed decision", () => {
    const decision = getDecision([
      {
        type: EffectType.TurnoutChange,
        params: {
          fidesz: 4,
          opposition: -2,
        },
      },
    ]);

    const result = campaignEngine.processTurn(gameState, decision, [], {
      showAdvisorFeedback: true,
      language: "en",
    });
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
            targetParty: "ellenzek",
            from: { party: "fidesz", type: "party" },
          },
        ],
      },
    ]);

    const result = campaignEngine.processTurn(gameState, decision, [], {
      showAdvisorFeedback: true,
      language: "en",
    });
    expect(result).toMatchSnapshot();
  });
});

describe("CampaignEngine.createInitialState", () => {
  let engine: CampaignEngine;

  beforeAll(() => {
    engine = new CampaignEngine(
      candidateListData,
      partyListData,
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
    expect(result.candidateListData).toEqual(candidateListData);
  });

  it("returns savedState directly when it has candidateListData", () => {
    const savedState = {
      activeCampaignId: "test-campaign",
      turn: 5,
      isEnded: false,
      candidateListData,
      partyListData,
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
    expect(result.candidateListData).toEqual(candidateListData);
  });

  it("applies baseResults when creating fresh state", () => {
    const electionConfig: ElectionConfig = {
      baseResults: { fidesz: 0.45, ellenzek: 0.35 },
      thresholdPercent: 5,
    };

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
      candidateListData,
    };
    const electionConfig: ElectionConfig = {
      baseResults: { fidesz: 0.99 },
      thresholdPercent: 5,
    };

    const result = engine.createInitialState(
      "test-campaign",
      savedState,
      electionConfig,
    );

    expect(result).toBe(savedState);
  });
});
