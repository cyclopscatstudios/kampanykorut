import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "../../src/logic/application";
import {
  ConditionalRawEffect,
  DistrictTarget,
  EffectType,
  RawEffect,
} from "../types";
import { CampaignConfig } from "../types/configs/campaign-config";
import { EffectApplier } from "./EffectApplier";
import { mockElectionConfig } from "./mocks/mockElectionConfig";
import { mockCandidateListData } from "./mocks/mockListData";

let effectApplier: EffectApplier;

const config = {
  electionConfig: mockElectionConfig,
} as unknown as CampaignConfig;

const FIXED_SESSION_ID = "fixed-test-session-id";

const electionConfigEngine = container.resolve(ConfigEngine);
electionConfigEngine.configure(config);

describe("ElectionEffectApplier – PartySwing", () => {
  const stateEngine = container.resolve(StateEngine);
  (stateEngine as unknown as { sessionId: string }).sessionId =
    FIXED_SESSION_ID;
  beforeEach(() => {
    effectApplier = container.resolve(EffectApplier);
  });

  it("should call modifyByTarget with correct parameters", () => {
    const effect: RawEffect = {
      type: EffectType.UniformSwing,
      params: {
        party_a: -1,
      },
    };

    const result = effectApplier.getAppliedEffects(
      [effect],
      mockCandidateListData,
      0,
    );
    expect(result).toEqual([
      {
        type: EffectType.UniformSwing,
        baseShare: { party_a: 52.5 },
        targetShare: { party_a: 51.5 },
      },
    ]);
  });

  it("should call modifyByMotivation with correct parameters", () => {
    const effect: RawEffect = {
      type: EffectType.TurnoutChange,
      params: {
        party_a: 0.5,
        party_b: 1,
      },
    };
    const result = effectApplier.getAppliedEffects(
      [effect],
      mockCandidateListData,
      0,
    );
    expect(result).toEqual([
      {
        type: EffectType.TurnoutChange,
        motivationDelta: {
          party_a: 99.5,
          party_b: 100,
        },
      },
    ]);
  });

  it("should return correct result for PartyShare effect", () => {
    const effect: RawEffect = {
      type: EffectType.VoteAllocation,
      params: {
        newVotes: 1000,
        share: {
          party_a: 0.6,
          party_b: 0.4,
        },
      },
    };
    const result = effectApplier.getAppliedEffects(
      [effect],
      mockCandidateListData,
      0,
    );
    expect(result).toEqual([
      {
        type: EffectType.VoteAllocation,
        newVotes: 1000,
        share: {
          party_a: 0.6,
          party_b: 0.4,
        },
      },
    ]);
  });

  it("should return correct result for District effect", () => {
    const effect: RawEffect = {
      type: EffectType.DistrictVoteTransfer,
      params: [
        {
          amount: 100,
          megyekod: 1,
          oevk: 1,
          targetParty: "party_a",
          from: {
            party: "party_b",
            type: "party",
          },
        },
      ] as DistrictTarget[],
    };
    const result = effectApplier.getAppliedEffects(
      [effect],
      mockCandidateListData,
      0,
    );
    expect(result).toEqual([
      {
        target: [
          {
            amount: 100,
            from: {
              party: "party_b",
              type: "party",
            },
            megyekod: 1,
            oevk: 1,
            targetParty: "party_a",
          },
        ],
        type: "district-vote-transfer",
      },
    ]);
  });

  describe("EffectApplier – Conditional Effects", () => {
    it("should apply replace conditional effect", () => {
      stateEngine.saveState("turnHistory", {
        questionId: "q1",
        answerId: "a1",
      });
      const effect: RawEffect = {
        type: EffectType.DistrictVoteTransfer,
        params: [
          {
            amount: 100,
            megyekod: 1,
            oevk: 1,
            targetParty: "party_a",
            from: {
              party: "ellenzek",
              type: "party",
            },
          },
        ] as DistrictTarget[],
      };
      const conditionalEffect: ConditionalRawEffect = {
        if: [
          {
            questionId: "q1",
            answerId: "a1",
          },
        ],
        effects: [
          {
            type: EffectType.VoteAllocation,
            params: {
              newVotes: 1000,
              share: {
                fidesz: 0.6,
                ellenzek: 0.4,
              },
            },
          },
        ],
        mode: "replace",
      };
      const result = effectApplier.getAppliedEffects(
        [effect],
        mockCandidateListData,
        0,
        [conditionalEffect],
      );
      expect(result).toEqual([
        {
          type: "vote-allocation",
          newVotes: 1000,
          share: {
            fidesz: 0.6,
            ellenzek: 0.4,
          },
        },
      ]);
    });
    it("should apply merge conditional effect", () => {
      stateEngine.saveState("turnHistory", {
        questionId: "q1",
        answerId: "a1",
      });
      const effect: RawEffect = {
        type: EffectType.DistrictVoteTransfer,
        params: [
          {
            amount: 100,
            megyekod: 1,
            oevk: 1,
            targetParty: "party_a",
            from: {
              party: "party_b",
              type: "party",
            },
          },
        ] as DistrictTarget[],
      };
      const conditionalEffect: ConditionalRawEffect = {
        if: [
          {
            questionId: "q1",
            answerId: "a1",
          },
        ],
        effects: [
          {
            type: EffectType.VoteAllocation,
            params: {
              newVotes: 1000,
              share: {
                party_a: 0.6,
                party_b: 0.4,
              },
            },
          },
        ],
        mode: "merge",
      };
      const result = effectApplier.getAppliedEffects(
        [effect],
        mockCandidateListData,
        0,
        [conditionalEffect],
      );
      expect(result).toEqual([
        {
          target: [
            {
              amount: 100,
              from: {
                party: "party_b",
                type: "party",
              },
              megyekod: 1,
              oevk: 1,
              targetParty: "party_a",
            },
          ],
          type: "district-vote-transfer",
        },
        {
          type: "vote-allocation",
          newVotes: 1000,
          share: {
            party_a: 0.6,
            party_b: 0.4,
          },
        },
      ]);
    });
  });
});
