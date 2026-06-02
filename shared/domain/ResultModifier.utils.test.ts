import { describe, it, expect } from "vitest";
import {
  calculateWinner,
  calcPercentages,
  getCapacity,
} from "./ResultModifier.utils";
import { CandidateListData, District } from "@/shared/types";

const makeDistrict = (
  partok: Record<string, number | undefined>,
  overrides?: Partial<CandidateListData>,
): CandidateListData => ({
  megyekod: 1,
  megye: "Pest",
  oevk: 1,
  telepules: "Budapest",
  valasztopolgar: 10000,
  partok,
  ...overrides,
});

const makeDistrictResult = (
  partok: Record<string, number | undefined>,
  overrides?: Partial<District>,
): District => ({
  ...makeDistrict(partok),
  winner: "",
  ...overrides,
});

describe("calculateWinner", () => {
  it("returns correct winner, maxVotes and totalVotes for a valid district", () => {
    const result = makeDistrictResult({
      fidesz: 5000,
      ellenzek: 3000,
      egyeb: 1000,
    });
    expect(calculateWinner(result)).toEqual({
      winner: "fidesz",
      maxVotes: 5000,
      totalVotes: 9000,
    });
  });

  it("picks the party with the highest vote count when multiple parties exist", () => {
    const result = makeDistrictResult({ a: 100, b: 200, c: 150 });
    const outcome = calculateWinner(result);
    expect(outcome?.winner).toBe("b");
    expect(outcome?.maxVotes).toBe(200);
    expect(outcome?.totalVotes).toBe(450);
  });

  it("treats undefined partok values as 0 via the ?? branch", () => {
    const result = makeDistrictResult({
      fidesz: 4000,
      ellenzek: undefined,
      egyeb: 2000,
    });
    const outcome = calculateWinner(result);
    expect(outcome?.winner).toBe("fidesz");
    expect(outcome?.maxVotes).toBe(4000);
    expect(outcome?.totalVotes).toBe(6000);
  });

  it("handles a district where all partok values are undefined", () => {
    const result = makeDistrictResult({ a: undefined, b: undefined });
    const outcome = calculateWinner(result);
    expect(outcome?.maxVotes).toBe(0);
    expect(outcome?.totalVotes).toBe(0);
  });

  it("handles a single-party district", () => {
    const result = makeDistrictResult({ egyparty: 7777 });
    expect(calculateWinner(result)).toEqual({
      winner: "egyparty",
      maxVotes: 7777,
      totalVotes: 7777,
    });
  });
});

describe("calcPercentages", () => {
  it("returns { _total: 0 } when totals is empty (zero-sum branch)", () => {
    expect(calcPercentages({})).toEqual({ _total: 0 });
  });

  it("returns { _total: 0 } when all values sum to zero", () => {
    expect(calcPercentages({ a: 0, b: 0 })).toEqual({ _total: 0 });
  });

  it("returns correct fractions and _total ≈ 1 for non-zero values", () => {
    const result = calcPercentages({ fidesz: 3, ellenzek: 1 });
    expect(result.fidesz).toBeCloseTo(0.75);
    expect(result.ellenzek).toBeCloseTo(0.25);
    expect(result._total).toBeCloseTo(1);
  });

  it("_total equals the sum of all fraction values (approximately 1)", () => {
    const result = calcPercentages({ a: 1, b: 2, c: 3, d: 4 });
    expect(result._total).toBeCloseTo(1);
  });

  it("handles a single party with all votes", () => {
    const result = calcPercentages({ egyparty: 100 });
    expect(result.egyparty).toBeCloseTo(1);
    expect(result._total).toBeCloseTo(1);
  });
});

describe("getCapacity", () => {
  const districts: CandidateListData[] = [
    makeDistrict({}, { megyekod: 1, oevk: 1 }),
    makeDistrict({}, { megyekod: 1, oevk: 2 }),
    makeDistrict({}, { megyekod: 2, oevk: 1 }),
  ];

  it("returns the matching district when both oevk and megyekod match", () => {
    const found = getCapacity(districts, 1, 1);
    expect(found).toEqual(districts[0]);
  });

  it("returns the correct district when oevk matches but only for the right megye", () => {
    const found = getCapacity(districts, 1, 2);
    expect(found).toEqual(districts[2]);
  });

  it("returns the second district for oevk=2, megyekod=1", () => {
    const found = getCapacity(districts, 2, 1);
    expect(found).toEqual(districts[1]);
  });

  it("returns undefined when no district matches", () => {
    expect(getCapacity(districts, 99, 99)).toBeUndefined();
  });

  it("returns undefined when oevk matches but megyekod does not", () => {
    expect(getCapacity(districts, 1, 99)).toBeUndefined();
  });

  it("returns undefined for an empty districts array", () => {
    expect(getCapacity([], 1, 1)).toBeUndefined();
  });
});
