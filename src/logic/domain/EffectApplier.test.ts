import { EffectApplier } from "./EffectApplier";
import { type RawEffect, EffectType } from "./EffectApplier.types";
import { candidateListData } from "./mocks/mockListData";

let effectApplier: EffectApplier;

const electionConfig = {
  listSeats: 10,
  thresholdPercent: 5,
};

describe("ElectionEffectApplier – PartySwing", () => {
  beforeEach(() => {
    effectApplier = new EffectApplier(electionConfig);
  });

  it("should call modifyByTarget with correct parameters", () => {
    const effect: RawEffect = {
      type: EffectType.PartySwing,
      params: {
        fidesz: -1,
      },
    };

    const result = effectApplier.getAppliedEffect(effect, candidateListData);
    expect(result).toEqual({
      type: EffectType.PartySwing,
      baseShare: { ellenzek: 0.5, fidesz: 0.5, mkkp: 0 },
      targetShare: { ellenzek: 0.5, fidesz: 0.49, mkkp: 0 },
    });
  });

  it("should call modifyByMotivation with correct parameters", () => {
    const effect: RawEffect = {
      type: EffectType.Motivation,
      params: {
        fidesz: 0.5,
        ellenzek: 1,
      },
    };
    const result = effectApplier.getAppliedEffect(effect, candidateListData);
    expect(result).toEqual({
      type: EffectType.Motivation,
      motivationDelta: {
        fidesz: 99.5,
        ellenzek: 100,
      },
    });
  });

  it("should return correct result for PartyShare effect", () => {
    const effect: RawEffect = {
      type: EffectType.PartyShare,
      params: {
        newVotoes: 1000,
        share: {
          fidesz: 0.6,
          ellenzek: 0.4,
        },
      },
    };
    const result = effectApplier.getAppliedEffect(effect, candidateListData);
    expect(result).toEqual({
      type: EffectType.PartyShare,
      newVotes: 1000,
      share: {
        fidesz: 0.6,
        ellenzek: 0.4,
      },
    });
  });
});
