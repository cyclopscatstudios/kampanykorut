import { CampaignEngine, type Decision } from "./CampaignEngine";
import { EffectType, type RawEffect } from "./EffectApplier.types";
import { EffectApplier } from "./EffectApplier";
import { MandateCalculator } from "./MandateCalculator";
import { ResultModifier } from "./ResultModifier";
import { DistrictVoteTransformer } from "./ResultTransformer/DistrictVoteTransformer";
import { UnionSwingTransformer } from "./ResultTransformer/UnionSwingTransformer";
import { VoteShareTransformer } from "./ResultTransformer/VoteShareTransformer";
import {
  VoterEnvironment,
  type VoterEnvironmentConfig,
} from "../VoterEnvironment";
import { candidateListData, partyListData } from "./mocks/mockListData";
import { ElectionConfigEngine } from "./ElectionConfigEngine";

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
    const voterEnvironmentConfig: VoterEnvironmentConfig = {
      maxTurnout: 85,
      eligibleVoters: 8215304,
      listData: candidateListData,
    };
    const electionConfig = {
      listSeats: 10,
      thresholdPercent: 5,
    };
    const electionConfigEngine = new ElectionConfigEngine(electionConfig);
    const voterEnvironment = new VoterEnvironment(voterEnvironmentConfig);
    const resultModifier = new ResultModifier(
      new UnionSwingTransformer(),
      new VoteShareTransformer(voterEnvironmentConfig, electionConfigEngine),
      new DistrictVoteTransformer(voterEnvironment),
    );

    campaignEngine = new CampaignEngine(
      candidateListData,
      partyListData,
      [],
      [],
      resultModifier,
      new EffectApplier(electionConfigEngine),
      new MandateCalculator(electionConfigEngine),
      electionConfigEngine,
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

    const result = campaignEngine.processTurn(gameState, decision);
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

    const result = campaignEngine.processTurn(gameState, decision);
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

    const result = campaignEngine.processTurn(gameState, decision);
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

    const result = campaignEngine.processTurn(gameState, decision);
    expect(result).toMatchSnapshot();
  });
});
