import { EffectApplier, type RawEffect, EffectType } from "./EffectApplier";
import { listResults } from "../mocks/mockCandidateData";
import type {
  CandidateListData,
  PartyListData,
} from "./ResultTransformer/PipelineTransform";
import type { VoterEnvironmentConfig } from "../VoterEnvironment";

const electionConfig = {
  listSeats: 10,
  thresholdPercent: 5,
};

const voterEnvironmentConfig: VoterEnvironmentConfig = {
  maxTurnout: 85,
  eligibleVoters: 8215304,
  listData: listResults,
};

describe("ElectionEffectApplier – PartySwing", () => {
  let applier: EffectApplier;
  let candidateData: CandidateListData[];
  let partyData: PartyListData[];

  beforeEach(() => {
    candidateData = [
      {
        partok: {
          fidesz: 45,
          ellenzek: 38,
        },
      },
    ] as unknown as CandidateListData[];

    partyData = [] as PartyListData[];

    applier = new EffectApplier(
      electionConfig,
      voterEnvironmentConfig,
      candidateData,
      partyData,
    );

    vi.spyOn(applier["mandateCalculator"], "sumPartyTotals").mockReturnValue({
      fidesz: 45,
      ellenzek: 38,
    });

    vi.spyOn(
      applier["mandateCalculator"],
      "calculatePercentages",
    ).mockReturnValue({
      fidesz: 45,
      ellenzek: 38,
    });

    vi.spyOn(applier["electionEngine"], "modifyByTarget").mockReturnValue({
      newDistrictData: [],
      newListData: [],
    } as any);

    vi.spyOn(applier["electionEngine"], "modifyByMotivation").mockReturnValue({
      newDistrictData: [],
      newListData: [],
    } as any);

    vi.spyOn(applier["electionEngine"], "modifyByShare").mockReturnValue({
      newDistrictData: [],
      newListData: [],
    } as any);
  });

  it("should call modifyByTarget with correct parameters", () => {
    const effect: RawEffect = {
      type: EffectType.PartySwing,
      params: {
        fidesz: -1,
      },
    };

    applier.applyEffect(effect);

    expect(applier["electionEngine"].modifyByTarget).toHaveBeenCalledWith(
      { fidesz: 45, ellenzek: 38 },
      { fidesz: 44, ellenzek: 38 },
      candidateData,
      partyData,
    );
  });

  it("should call modifyByMotivation with correct parameters", () => {
    const effect: RawEffect = {
      type: EffectType.Motivation,
      params: {
        fidesz: 0.5,
        ellenzek: 1,
      },
    };

    applier.applyEffect(effect);

    expect(applier["electionEngine"].modifyByMotivation).toHaveBeenCalledWith(
      candidateData,
      partyData,
      { fidesz: 99.5, ellenzek: 99 },
    );
  });

  it("asd", () => {
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

    applier.applyEffect(effect);

    expect(applier["electionEngine"].modifyByShare).toHaveBeenCalledWith(
      candidateData,
      1000,
      {
        fidesz: 0.6,
        ellenzek: 0.4,
      },
    );
  });
});
