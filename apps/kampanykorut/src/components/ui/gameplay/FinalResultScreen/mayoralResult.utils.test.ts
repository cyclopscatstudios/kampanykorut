import { MayoralDistrictResult } from "@/shared/types";
import {
  formatShare,
  getMayoralDistrictRows,
  getMayoralHeadline,
  getWithdrawnCandidates,
} from "./mayoralResult.utils";

const parties = [
  { id: "vitezy", name: "Vitézy Dávid", color: "#0f0" },
  { id: "szentkiralyi", name: "Szentkirályi Alexandra", color: "#f60" },
  { id: "grundtner", name: "Grundtner András", color: "#000" },
];

describe("getMayoralHeadline", () => {
  it("is a victory only when the player's candidate wins", () => {
    const won = { kind: "winner", candidateId: "vitezy" } as const;
    expect(getMayoralHeadline(won, "vitezy")).toBe("victory");
    expect(getMayoralHeadline(won, "karacsony")).toBe("defeat");
    expect(
      getMayoralHeadline({ kind: "tie", candidateIds: ["a", "b"] }, "a"),
    ).toBe("deadlock");
    expect(getMayoralHeadline({ kind: "no_winner" }, "a")).toBe("deadlock");
  });
});

describe("getWithdrawnCandidates", () => {
  it("lists inactive candidates with the endorsed candidate's name", () => {
    expect(
      getWithdrawnCandidates(
        {
          candidates: {
            szentkiralyi: {
              status: "inactive",
              endorsedCandidateId: "vitezy",
            },
            grundtner: { status: "inactive" },
            vitezy: { status: "active" },
          },
        },
        parties,
      ),
    ).toEqual([
      { id: "grundtner", name: "Grundtner András", endorsedName: undefined },
      {
        id: "szentkiralyi",
        name: "Szentkirályi Alexandra",
        endorsedName: "Vitézy Dávid",
      },
    ]);
    expect(getWithdrawnCandidates(null, parties)).toEqual([]);
  });
});

describe("getMayoralDistrictRows", () => {
  const district = (
    oevk: number,
    outcome: MayoralDistrictResult["outcome"],
  ): MayoralDistrictResult =>
    ({
      megyekod: 1,
      oevk,
      label: `${oevk}. kerület`,
      validVotes: 1000,
      outcome,
      standings: [
        { candidateId: "vitezy", votes: 600, share: 0.6 },
        { candidateId: "karacsony", votes: 400, share: 0.4 },
      ],
      margin: { votes: 200, percentagePoints: 20 },
    }) as MayoralDistrictResult;

  it("sorts districts and marks only real leaders", () => {
    const rows = getMayoralDistrictRows([
      district(2, { kind: "tie", candidateIds: ["vitezy", "karacsony"] }),
      district(1, { kind: "winner", candidateId: "vitezy" }),
    ]);

    expect(rows.map((r) => [r.oevk, r.leaderId])).toEqual([
      [1, "vitezy"],
      [2, undefined],
    ]);
    expect(rows[0]).toMatchObject({
      label: "1. kerület",
      leaderShare: 0.6,
      marginPoints: 20,
      validVotes: 1000,
    });
  });
});

it("formats shares as percentages", () => {
  expect(formatShare(0.52341)).toBe("52.34%");
});
