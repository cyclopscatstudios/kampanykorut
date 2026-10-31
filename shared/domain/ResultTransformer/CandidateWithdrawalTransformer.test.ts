import { container } from "tsyringe";
import { CandidateListData } from "../../types";
import { CandidateWithdrawalTransformer } from "./CandidateWithdrawalTransformer";

const district = (
  oevk: number,
  partok: CandidateListData["partok"],
  valasztopolgar = 100000,
): CandidateListData => ({
  megyekod: 1,
  megye: "Budapest",
  oevk,
  telepules: `${oevk}. kerület`,
  valasztopolgar,
  partok,
});

const sum = (partok: CandidateListData["partok"]) =>
  Object.values(partok).reduce<number>((total, v) => total + (v ?? 0), 0);

describe("CandidateWithdrawalTransformer", () => {
  const transformer = container.resolve(CandidateWithdrawalTransformer);

  const split = { vitezy: 0.8, karacsony: 0.1, _abstain: 0.1 };

  it("moves the votes of every district by the given shares", () => {
    const [first, second] = transformer.redistribute(
      [
        district(1, { szentkiralyi: 1000, vitezy: 3000, karacsony: 4000 }),
        district(2, { szentkiralyi: 500, vitezy: 100, karacsony: 200 }),
      ],
      "szentkiralyi",
      split,
    );

    expect(first.partok).toEqual({
      szentkiralyi: 0,
      vitezy: 3800,
      karacsony: 4100,
    });
    expect(second.partok).toEqual({
      szentkiralyi: 0,
      vitezy: 500,
      karacsony: 250,
    });
  });

  it("neither creates nor loses voters: abstaining votes return to the undecided pool", () => {
    const before = district(1, {
      szentkiralyi: 1234,
      vitezy: 3000,
      karacsony: 4000,
    });

    const [after] = transformer.redistribute([before], "szentkiralyi", split);

    const moved = sum(after.partok) - (sum(before.partok) - 1234);
    const abstained = 1234 - moved;
    expect(moved + abstained).toBe(1234);
    expect(after.partok).toEqual({
      szentkiralyi: 0,
      vitezy: 3987,
      karacsony: 4123,
    });
    expect(abstained).toBe(124);
    expect(after.valasztopolgar).toBe(before.valasztopolgar);
    expect(Object.values(after.partok).every(Number.isInteger)).toBe(true);
  });

  it("rounds deterministically with the largest remainder", () => {
    const thirds = { a: 1 / 3, b: 1 / 3, c: 1 / 3 };

    const [result] = transformer.redistribute(
      [district(1, { x: 7 })],
      "x",
      thirds,
    );

    expect(result.partok).toEqual({ x: 0, a: 3, b: 2, c: 2 });
    expect(
      transformer.redistribute([district(1, { x: 7 })], "x", {
        c: 1 / 3,
        b: 1 / 3,
        a: 1 / 3,
      })[0].partok,
    ).toEqual(result.partok);
  });

  it("handles districts where the candidate has no votes", () => {
    const [result] = transformer.redistribute(
      [district(1, { vitezy: 10 })],
      "szentkiralyi",
      split,
    );

    expect(result.partok).toEqual({ vitezy: 10, szentkiralyi: 0 });
  });

  it("gives every vote to a single endorsed candidate", () => {
    const [result] = transformer.redistribute(
      [district(1, { szentkiralyi: 999, vitezy: 1 })],
      "szentkiralyi",
      { vitezy: 1 },
    );

    expect(result.partok).toEqual({ szentkiralyi: 0, vitezy: 1000 });
  });

  it("does not mutate the input", () => {
    const input = [district(1, { szentkiralyi: 100, vitezy: 1 })];
    const snapshot = structuredClone(input);

    transformer.redistribute(input, "szentkiralyi", split);

    expect(input).toEqual(snapshot);
  });
});
