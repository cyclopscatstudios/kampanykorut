import { describe, expect, it } from "vitest";
import { defaultGroups } from "./DefaultGroups";
import { DistrictGroupEngine } from "./DistrictGroupEngine";

// TODO: should use mocked groups instead of defaultGroups, but it would require a lot of boilerplate, so for now we just test with the real data
describe("DistrictGroupEngine", () => {
  it("should return the correct district group for given group ids", () => {
    const engine = new DistrictGroupEngine();
    engine.configure([], defaultGroups);

    const result = engine.getDistrictTargetByGroupIds(["billego_korzetek"]);
    expect(result).toEqual([
      {
        id: "billego_korzetek",
        label: "Billegő körzetek",
        districts: [
          { megyekod: 14, oevk: 2 },
          { megyekod: 14, oevk: 4 },
          { megyekod: 14, oevk: 6 },
          { megyekod: 14, oevk: 10 },
          { megyekod: 14, oevk: 11 },
          { megyekod: 14, oevk: 12 },
          { megyekod: 2, oevk: 1 },
          { megyekod: 2, oevk: 2 },
          { megyekod: 6, oevk: 1 },
          { megyekod: 5, oevk: 1 },
          { megyekod: 5, oevk: 2 },
          { megyekod: 10, oevk: 1 },
          { megyekod: 10, oevk: 2 },
          { megyekod: 18, oevk: 1 },
          { megyekod: 18, oevk: 2 },
          { megyekod: 12, oevk: 2 },
          { megyekod: 7, oevk: 1 },
        ],
      },
    ]);
  });

  it("returns custom groups passed to configure", () => {
    const engine = new DistrictGroupEngine();
    const custom = {
      id: "custom_group",
      label: "Custom",
      districts: [{ megyekod: 1, oevk: 1 }],
    };
    engine.configure([], [custom]);

    expect(engine.getDistrictTargetByGroupIds(["custom_group"])).toEqual([
      custom,
    ]);
  });

  it("returns no districts for an unknown group instead of falling back", () => {
    const engine = new DistrictGroupEngine();
    engine.configure([]);

    expect(
      engine.getDistrictTargetByGroupIds(["missing_group"])[0].districts,
    ).toEqual([]);
  });
});
