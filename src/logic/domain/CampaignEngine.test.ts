import { CampaignEngine, type Decision } from "./CampaignEngine";
import { EffectType, type RawEffect } from "./EffectApplier.types";
import { EffectApplier } from "./EffectApplier";
import { MandateCalculator } from "./MandateCalculator";
import { ResultModifier } from "./ResultModifier";
import { DistrictTargetTransform } from "./ResultTransformer/DistrictTargetTransform";
import { NationalSwingTransform } from "./ResultTransformer/NationalSwingTransform";
import { PipelineTransform } from "./ResultTransformer/PipelineTransform";
import {
  VoterEnvironment,
  type VoterEnvironmentConfig,
} from "../VoterEnvironment";
import { candidateListData, partyListData } from "./mocks/mockListData";

let campaignEngine: CampaignEngine;

const gameState = {
  turn: 0,
  candidateListData,
  partyListData,
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
    const voterEnvironment = new VoterEnvironment(voterEnvironmentConfig);
    const resultModifier = new ResultModifier(
      new NationalSwingTransform(),
      new PipelineTransform(voterEnvironmentConfig, electionConfig),
      new DistrictTargetTransform(voterEnvironment),
    );

    campaignEngine = new CampaignEngine(
      candidateListData,
      partyListData,
      [],
      [],
      resultModifier,
      new EffectApplier(electionConfig),
      new MandateCalculator(electionConfig),
    );
  });
  it("should apply the party-swing typed decision", () => {
    const decision = getDecision([{
      type: EffectType.PartySwing,
      params: {
        fidesz: 5,
        opposition: -3,
      },
    }]);

    const result = campaignEngine.processTurn(gameState, decision);
    expect(result).toMatchSnapshot();
  });
  it("should apply party-share typed decision", () => {
    const decision = getDecision([{
      type: EffectType.PartyShare,
      params: {
        newVotes: 100000,
        share: {
          fidesz: 0.6,
          opposition: 0.4,
        },
      },
    }]);

    const result = campaignEngine.processTurn(gameState, decision);
    expect(result).toMatchSnapshot();
  });
  it("should apply motivation typed decision", () => {
    const decision = getDecision([{
      type: EffectType.Motivation,
      params: {
        fidesz: 4,
        opposition: -2,
      },
    }]);

    const result = campaignEngine.processTurn(gameState, decision);
    expect(result).toMatchSnapshot();
  });
  it("should apply district typed decision", () => {
    const decision = getDecision([{
      type: EffectType.District,
      params: [
        {
          amount: 50,
          megyekod: 1,
          oevk: 1,
          targetParty: "ellenzek",
          from: { party: "fidesz", type: "party" },
        },
      ],
    }]);

    const result = campaignEngine.processTurn(gameState, decision);
    expect(result).toMatchSnapshot();
  });
});
