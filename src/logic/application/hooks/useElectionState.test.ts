import { renderHook } from "@testing-library/react";
import { useElectionState } from "./useElectionState";
import { mockGameConfig } from "./MockGameConfig";

describe("useElectionState", () => {
  it("should initialize state", () => {
    const { result } = renderHook(() => useElectionState(mockGameConfig));

    expect(result.current.state).toStrictEqual({
      candidateListData: [
        {
          jeloltek: {
            ellenzek: ["Candidate B"],
            fidesz: ["Candidate A"],
          },
          megye: "BP",
          megyekod: 1,
          oevk: 1,
          partok: {
            ellenzek: 11000,
            fidesz: 12000,
            mkkp: undefined,
          },
          telepules: "",
          valasztopolgar: 600000,
        },
        {
          megye: "BP",
          megyekod: 1,
          oevk: 2,
          partok: {
            ellenzek: 9000,
            fidesz: 8000,
          },
          telepules: "",
          valasztopolgar: 600000,
        },
      ],
      partyListData: [
        {
          megye: "BP",
          megyekod: 1,
          oevk: 1,
          partok: {
            ellenzek: 40000,
            fidesz: 50000,
            mkkp: 3000,
          },
          telepules: "",
        },
        {
          megye: "BP",
          megyekod: 1,
          oevk: 2,
          partok: {
            ellenzek: 35000,
            fidesz: 30000,
          },
          telepules: "",
        },
      ],
    });
  });
});
