import { container } from "tsyringe";
import { EffectApplier } from "./EffectApplier";
import { candidateListData } from "./mocks/mockListData";
import type { DistrictTarget } from "./ResultTransformer/VoteShareTransformer.types";
import { ConfigEngine } from "../application/ConfigEngine";
import { EffectType } from "../types/campaignEngine.types";
import type {
  RawEffect,
  ConditionalRawEffect,
  CampaignConfig,
} from "../types/campaignEngine.types";
import { StateEngine } from "../application";

let effectApplier: EffectApplier;

const config = {
  electionConfig: {
    listSeats: 10,
    thresholdPercent: 5,
    parties: [],
    electionAssets: {},
    playableSides: [],
  },
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
        fidesz: -1,
      },
    };

    const result = effectApplier.getAppliedEffects(
      [effect],
      candidateListData,
      0,
    );
    expect(result).toEqual([
      {
        type: EffectType.UniformSwing,
        baseShare: { fidesz: 50 },
        targetShare: { fidesz: 49 },
      },
    ]);
  });

  it("should call modifyByMotivation with correct parameters", () => {
    const effect: RawEffect = {
      type: EffectType.TurnoutChange,
      params: {
        fidesz: 0.5,
        ellenzek: 1,
      },
    };
    const result = effectApplier.getAppliedEffects(
      [effect],
      candidateListData,
      0,
    );
    expect(result).toEqual([
      {
        type: EffectType.TurnoutChange,
        motivationDelta: {
          fidesz: 99.5,
          ellenzek: 100,
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
          fidesz: 0.6,
          ellenzek: 0.4,
        },
      },
    };
    const result = effectApplier.getAppliedEffects(
      [effect],
      candidateListData,
      0,
    );
    expect(result).toEqual([
      {
        type: EffectType.VoteAllocation,
        newVotes: 1000,
        share: {
          fidesz: 0.6,
          ellenzek: 0.4,
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
          targetParty: "fidesz",
          from: {
            party: "ellenzek",
            type: "party",
          },
        },
      ] as DistrictTarget[],
    };
    const result = effectApplier.getAppliedEffects(
      [effect],
      candidateListData,
      0,
    );
    expect(result).toEqual([
      {
        target: [
          {
            amount: 100,
            from: {
              party: "ellenzek",
              type: "party",
            },
            megyekod: 1,
            oevk: 1,
            targetParty: "fidesz",
          },
        ],
        type: "district-vote-transfer",
      },
    ]);
  });

  describe("EffectApplier – Conditional Effects", () => {
    it("should apply replace conditional effect", () => {
      stateEngine.saveState("questionHistory", {
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
            targetParty: "fidesz",
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
        candidateListData,
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
      stateEngine.saveState("questionHistory", {
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
            targetParty: "fidesz",
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
        mode: "merge",
      };
      const result = effectApplier.getAppliedEffects(
        [effect],
        candidateListData,
        0,
        [conditionalEffect],
      );
      expect(result).toEqual([
        {
          target: [
            {
              amount: 100,
              from: {
                party: "ellenzek",
                type: "party",
              },
              megyekod: 1,
              oevk: 1,
              targetParty: "fidesz",
            },
          ],
          type: "district-vote-transfer",
        },
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
  });
});
