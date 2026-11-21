import { RegionSeatResult } from "../types";
import {
  buildSeatCountView,
  getMajorityStatus,
  tallyRevealedSeats,
} from "./SeatCountView";

const mandates = [
  { party: "b", constituencySeats: 3, listSeats: 0, totalSeats: 3 },
  { party: "_other", constituencySeats: 0, listSeats: 0, totalSeats: 0 },
  { party: "a", constituencySeats: 3, listSeats: 2, totalSeats: 5 },
  { party: "c", constituencySeats: 1, listSeats: 0, totalSeats: 1 },
];
const regions: RegionSeatResult[] = [
  { id: "n", name: "N", seats: 4, votes: {}, allocation: { b: 1, a: 3 } },
  { id: "s", name: "S", seats: 3, votes: {}, allocation: { c: 1, b: 2 } },
];

describe("SeatCountView", () => {
  const view = buildSeatCountView({ mandates, regions }, 9, 2);

  it("orders parties by seats and groups each region's dots in that order", () => {
    expect(view.parties.map((p) => p.party)).toEqual(["a", "b", "c"]);
    expect(view.regions.map((r) => r.dots)).toEqual([
      ["a", "a", "a", "b"],
      ["b", "b", "c"],
    ]);
    expect(view.majority).toBe(5);
  });

  it("tallies the revealed regions and adds the national seats at the end", () => {
    expect(tallyRevealedSeats(view, 0)).toEqual({ a: 0, b: 0, c: 0 });
    expect(tallyRevealedSeats(view, 1)).toEqual({ a: 3, b: 1, c: 0 });
    expect(tallyRevealedSeats(view, 2)).toEqual({ a: 5, b: 3, c: 1 });
  });

  it("reports the leader and how many seats it lacks for a majority", () => {
    expect(getMajorityStatus(mandates, 400)).toMatchObject({
      leader: { party: "a" },
      majority: 201,
      missing: 196,
    });
    expect(getMajorityStatus(mandates, 9).missing).toBe(0);
    expect(getMajorityStatus([], 400)).toEqual({
      leader: undefined,
      majority: 201,
      missing: 201,
    });
  });
});
