import { container } from "tsyringe";
import { candidateListData, partyListData } from "../mocks/mockListData";
import { DistrictVoteTransformer } from "./DistrictVoteTransformer";
import { DistrictTarget } from "@/shared/types";

describe("DistrictTargetTransform", () => {
  const districtTargetTransform = container.resolve(DistrictVoteTransformer);

  it("should apply district target correctly", () => {
    const districtTarget: DistrictTarget = {
      amount: 50,
      targetParty: "ellenzek",
      from: { type: "bizonytalan" },
      megyekod: 1,
      oevk: 1,
    };
    const result = districtTargetTransform.modifyDistricts(
      candidateListData,
      partyListData,
      [districtTarget],
    );

    expect(result).toMatchSnapshot();
  });
});
