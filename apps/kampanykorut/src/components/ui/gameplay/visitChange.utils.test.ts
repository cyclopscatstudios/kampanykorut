import { CandidateListData } from "@shared/types";
import { describe, expect, it } from "vitest";
import {
  buildSnapshot,
  diffSnapshots,
  getMapChanges,
  getStandoutDeltas,
  resolvePlayerKey,
  summarizeChange,
} from "./visitChange.utils";

const district = (
  oevk: number,
  partok: Record<string, number>,
): CandidateListData => ({
  megyekod: 13,
  megye: "Pest",
  oevk,
  telepules: "Érd",
  valasztopolgar: 80000,
  partok,
});

describe("visit change", () => {
  const before = buildSnapshot(
    [district(1, { a: 40, b: 60 }), district(2, { a: 50, b: 50 })],
    { a: 0.4, b: 0.6, _total: 1 },
  );
  const after = buildSnapshot(
    [district(1, { a: 52, b: 48 }), district(2, { a: 50.4, b: 49.6 })],
    { a: 0.43, b: 0.57, _total: 1 },
  );
  const change = diffSnapshots(before, after, "13-1");

  it("converts district votes and national shares to percentage deltas", () => {
    expect(change.districts["13-1"].deltas.a).toBeCloseTo(12);
    expect(change.national.a).toBeCloseTo(3);
    expect(change.national).not.toHaveProperty("_total");
  });

  it("marks on the map only districts that flip or move apart from the national swing", () => {
    const uniform = diffSnapshots(
      buildSnapshot(
        [district(1, { a: 40, b: 60 }), district(2, { a: 20, b: 80 })],
        {
          a: 0.3,
          b: 0.7,
        },
      ),
      buildSnapshot(
        [district(1, { a: 42, b: 58 }), district(2, { a: 25, b: 75 })],
        {
          a: 0.32,
          b: 0.68,
        },
      ),
    );
    expect(Object.keys(getStandoutDeltas(uniform, "a"))).toEqual(["13-2"]);
    expect(Object.keys(getStandoutDeltas(change, "a"))).toEqual(["13-1"]);
  });

  it("summarises flips and the visited district", () => {
    const summary = summarizeChange(change, "a");
    expect(summary).toMatchObject({
      gained: 1,
      lost: 0,
      visited: { key: "13-1", before: 40, after: 52 },
    });
    expect(summary.national).toBeCloseTo(3);
  });

  it("sizes map markers: every visible change, standouts flagged", () => {
    expect(getMapChanges(change, "a")).toEqual({
      "13-1": { delta: expect.closeTo(12), standout: true },
    });
  });

  it("uses the candidate id when district data is keyed by candidates", () => {
    const mayoral = diffSnapshots(
      buildSnapshot([district(1, { karacsony: 40, vitezy: 60 })]),
      buildSnapshot([district(1, { karacsony: 45, vitezy: 55 })]),
    );
    expect(resolvePlayerKey(mayoral, "dk", "karacsony")).toBe("karacsony");
    expect(resolvePlayerKey(change, "a", "someone")).toBe("a");
  });
});
