import { CandidateListData } from "@/shared/types";
import { UnionSwingTransformer } from "./UnionSwingTransformer";

describe("NationalSwingTransform", () => {
  it("asd", () => {
    const districtCandidateData: CandidateListData[] = [
      {
        megye: "megye",
        megyekod: 1,
        oevk: 1,
        partok: {
          "party-A": 100,
          "party-B": 200,
          "party-C": 50,
        },
        telepules: "település",
        valasztopolgar: 450,
      },
    ];
    const baseShare = {
      "party-A": 30,
      "party-B": 65,
      "party-C": 5,
    };
    const targetShare = {
      "party-A": 45,
      "party-B": 50,
      "party-C": 5,
    };

    const nationalSwingTransform = new UnionSwingTransformer();
    const result = nationalSwingTransform.applyUniformSwingToDistricts(
      districtCandidateData,
      baseShare,
      targetShare,
    );
    expect(result).toEqual([
      {
        megye: "megye",
        megyekod: 1,
        oevk: 1,
        partok: {
          "party-A": 153,
          "party-B": 148,
          "party-C": 50,
        },
        telepules: "település",
        valasztopolgar: 450,
      },
    ]);
  });
});
