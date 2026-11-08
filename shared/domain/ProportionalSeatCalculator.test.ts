import {
  CandidateListData,
  ParliamentaryElectionConfig,
  ProportionalElectionDefinition,
} from "../types";
import {
  allocateDHondt,
  calculateProportionalResults,
  isProportionalElection,
} from "./ProportionalSeatCalculator";

const row = (
  megyekod: number,
  partok: Record<string, number>,
): CandidateListData => ({
  megyekod,
  megye: `m${megyekod}`,
  oevk: 1,
  telepules: "",
  valasztopolgar: 0,
  partok,
});

const config = (
  regions: { id: string; seats: number; megyekods: number[] }[],
  listSeats: number,
  thresholdPercent = 5,
) =>
  ({
    title: "t",
    year: "1957",
    parties: [],
    playableSides: [],
    electionAssets: [],
    districtMap: "2011",
    allSeats: regions.reduce((s, r) => s + r.seats, 0) + listSeats,
    listSeats,
    thresholdPercent,
    partyListVotes: {},
    election: {
      type: "proportional" as const,
      regions: regions.map((r) => ({ ...r, name: r.id.toUpperCase() })),
    },
  }) as ParliamentaryElectionConfig & {
    election: ProportionalElectionDefinition;
  };

describe("allocateDHondt", () => {
  it("allocates seats by the highest quotients", () => {
    // Textbook example: 100k, 80k, 30k, 20k for 8 seats -> 4, 3, 1, 0.
    expect(
      allocateDHondt({ a: 100000, b: 80000, c: 30000, d: 20000 }, 8),
    ).toEqual({ allocation: { a: 4, b: 3, c: 1 }, lastQuotient: 25000 });
  });

  it("breaks equal quotients by the larger vote count, then by id", () => {
    expect(allocateDHondt({ a: 300, b: 200, c: 100 }, 1).allocation).toEqual({
      a: 1,
    });
    expect(allocateDHondt({ b: 100, a: 100 }, 1).allocation).toEqual({ a: 1 });
  });

  it("ignores parties without votes", () => {
    expect(allocateDHondt({ a: 10, b: 0 }, 2).allocation).toEqual({ a: 2 });
  });
});

describe("calculateProportionalResults", () => {
  it("recognises a proportional election config", () => {
    expect(isProportionalElection(config([], 0))).toBe(true);
    expect(isProportionalElection({})).toBe(false);
    expect(isProportionalElection(undefined)).toBe(false);
  });

  it("allocates regional seats per region and national seats from unused votes", () => {
    const data = [
      row(1, { a: 600, b: 300, c: 100 }),
      row(2, { a: 200, b: 500, c: 300 }),
      row(3, { a: 100, b: 100, c: 50 }),
    ];
    const result = calculateProportionalResults(
      data,
      config(
        [
          { id: "north", seats: 4, megyekods: [1] },
          { id: "south", seats: 3, megyekods: [2, 3] },
        ],
        2,
      ),
    );

    // north: a 600, b 300, c 100 -> a 3 (600, 300, 200), b 1 (300); last 200.
    // south: a 300, b 600, c 350 -> b 2 (600, 300), c 1 (350); last 300.
    expect(result.regions?.map((r) => [r.id, r.allocation])).toEqual([
      ["north", { a: 3, b: 1 }],
      ["south", { b: 2, c: 1 }],
    ]);
    // Unused: a 600-600 + 300-0 = 300; b 300-200 + 600-600 = 100;
    // c 100-0 + 350-300 = 150. Two national seats: a 300, then a 150 beats
    // c 150 on the larger vote count.
    expect(result.compensation.losingVotes).toEqual({ a: 300, b: 100, c: 150 });
    expect(result.listSeats).toEqual({ a: 2 });
    expect(result.mandates).toEqual([
      { party: "a", constituencySeats: 3, listSeats: 2, totalSeats: 5 },
      { party: "b", constituencySeats: 3, listSeats: 0, totalSeats: 3 },
      { party: "c", constituencySeats: 1, listSeats: 0, totalSeats: 1 },
    ]);
    expect(result.mandates.reduce((s, m) => s + m.totalSeats, 0)).toBe(9);
  });

  it("keeps parties under the national threshold out of every seat", () => {
    const result = calculateProportionalResults(
      [row(1, { a: 500, b: 460, tiny: 40, _other: 0 })],
      config([{ id: "all", seats: 5, megyekods: [1] }], 2),
    );

    expect(result.mandates.find((m) => m.party === "tiny")).toMatchObject({
      totalSeats: 0,
    });
    expect(result.mandates.reduce((s, m) => s + m.totalSeats, 0)).toBe(7);
    expect(result.percentages.candidateListResults.tiny).toBeGreaterThan(0);
  });

  it("counts other votes in the threshold base but never seats them", () => {
    // c has 15.5% of all votes but 16.2% without the other votes.
    const result = calculateProportionalResults(
      [row(1, { a: 600, b: 200, c: 155, _other: 45 })],
      config([{ id: "all", seats: 2, megyekods: [1] }], 1, 16),
    );

    expect(result.mandates.map((m) => [m.party, m.totalSeats])).toEqual([
      ["a", 2],
      ["b", 1],
      ["c", 0],
    ]);
    expect(result.listSeats).toEqual({ b: 1 });
  });
});
