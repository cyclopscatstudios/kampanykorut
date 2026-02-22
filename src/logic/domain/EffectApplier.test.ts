import { StateHandler } from "../application/StateHandler";
import { EffectApplier } from "./EffectApplier";
import { type RawEffect, EffectType } from "./EffectApplier.types";
import { candidateListData } from "./mocks/mockListData";
import type { DistrictTarget } from "./ResultTransformer/VoteShareTransformer.types";

let effectApplier: EffectApplier;

const electionConfig = {
  listSeats: 10,
  thresholdPercent: 5,
};

describe("ElectionEffectApplier – PartySwing", () => {
  beforeEach(() => {
    effectApplier = new EffectApplier(electionConfig, new StateHandler());
  });

  it("should call modifyByTarget with correct parameters", () => {
    const effect: RawEffect = {
      type: EffectType.UniformSwing,
      params: {
        fidesz: -1,
      },
    };

    const result = effectApplier.getAppliedEffects([effect], candidateListData);
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
    const result = effectApplier.getAppliedEffects([effect], candidateListData);
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
    const result = effectApplier.getAppliedEffects([effect], candidateListData);
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
    const result = effectApplier.getAppliedEffects([effect], candidateListData);
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
});
