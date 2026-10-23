import { describe, expect, it } from "vitest";
import { getMajorityThresholds, getMajorityType } from "./Majority";

describe("getMajorityThresholds", () => {
  it.each([
    [199, 100, 133],
    [200, 101, 134],
    [386, 194, 258],
    [3, 2, 2],
    [1, 1, 1],
  ])(
    "allSeats %i -> simple %i, supermajority %i",
    (all, simple, supermajority) => {
      expect(getMajorityThresholds(all)).toEqual({ simple, supermajority });
    },
  );
});

describe("getMajorityType", () => {
  it.each([
    [99, null],
    [100, "simple"],
    [132, "simple"],
    [133, "supermajority"],
    [199, "supermajority"],
  ])("%i of 199 seats -> %s", (seats, expected) => {
    expect(getMajorityType(seats, 199)).toBe(expected);
  });

  it("uses the configured seat total", () => {
    expect(getMajorityType(100, 200)).toBeNull();
    expect(getMajorityType(101, 200)).toBe("simple");
  });
});
