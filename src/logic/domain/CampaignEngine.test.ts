import { CampaignEngine, type Decision } from "./CampaignEngine";
import { EffectApplier } from "./EffectApplier";
import { MandateCalculator } from "./MandateCalculator";
import { ResultModifier } from "./ResultModifier";
import { candidateListData, partyListData } from "./mocks/mockListData";
import { type RawEffect, EffectType } from "../types/campaignEngine.types";
import { container } from "tsyringe";

let campaignEngine: CampaignEngine;

const gameState = {
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
    });
    expect(result).toMatchSnapshot();
  });
});
