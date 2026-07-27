import { container } from "tsyringe";
import { describe, expect, it } from "vitest";
import { DistrictTarget } from "../../types";
import {
  mockCandidateListData,
  mockPartyListData,
} from "../mocks/mockListData";
import { DistrictVoteTransformer } from "./DistrictVoteTransformer";

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
      mockCandidateListData,
      mockPartyListData,
      [districtTarget],
    );

    expect(result).toMatchSnapshot();
  });
});
