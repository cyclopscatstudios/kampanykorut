import { ElectionEffectApplier, type Effect, EffectType } from "./ElectionEffectApplier";
import { listResults } from "./mocks/mockCandidateData";
import type { DistrictCandidateData, DistrictPartyData } from "./ResultTransformer/PipelineTransform";
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

    vi.spyOn(
      applier["mandateCalculator"],
      "sumPartyTotals",
    ).mockReturnValue({
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

    vi.spyOn(
      applier["electionEngine"],
      "modifyByTarget",
    ).mockReturnValue({
      newDistrictData: [],
      newListData: [],
    } as any);
  });

  it("applies party swing as delta to base share", () => {
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
});
