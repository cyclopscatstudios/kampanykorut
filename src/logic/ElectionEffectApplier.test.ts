import {
  ElectionEffectApplier,
  type Effect,
  EffectType,
} from "./ElectionEffectApplier";
import { listResults } from "./mocks/mockCandidateData";
import type {
  DistrictCandidateData,
  DistrictPartyData,
} from "./ResultTransformer/PipelineTransform";
import type { VoterEnvironmentConfig } from "./VoterEnvironment";

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
  let applier: ElectionEffectApplier;
  let candidateData: DistrictCandidateData[];
  let partyData: DistrictPartyData[];

  beforeEach(() => {
    candidateData = [
      {
        partok: {
          fidesz: 45,
          ellenzek: 38,
        },
      },
    ] as unknown as DistrictCandidateData[];

    partyData = [] as DistrictPartyData[];

    applier = new ElectionEffectApplier(
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
    const effect: Effect = {
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
    const effect: Effect = {
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

  it('asd', () => {
    const effect: Effect = {
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
  })
});
