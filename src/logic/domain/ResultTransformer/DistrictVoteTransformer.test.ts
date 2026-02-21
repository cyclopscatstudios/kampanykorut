import { mockGameConfig } from "../../application/hooks/MockGameConfig";
import { VoterEnvironment } from "../../VoterEnvironment";
import { candidateListData } from "../mocks/mockListData";
import { DistrictVoteTransformer } from "./DistrictVoteTransformer";
import type { DistrictTarget } from "./VoteShareTransformer.types";

describe("DistrictTargetTransform", () => {
  const voterEnvironment = new VoterEnvironment(
    mockGameConfig.voterEnvironmentConfig,
  );
  const districtTargetTransform = new DistrictVoteTransformer(voterEnvironment);

  it("should apply district target correctly", () => {
    const districtTarget: DistrictTarget = {
      amount: 50,
      targetParty: "ellenzek",
      from: { type: "bizonytalan" },
      megyekod: 1,
      oevk: 1,
    };
    const result = districtTargetTransform.modifyDistricts(candidateListData, [
      districtTarget,
    ]);

    expect(result).toMatchSnapshot();
  });
});
