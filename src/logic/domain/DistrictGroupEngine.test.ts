import { DistrictGroupEngine } from "./DistrictGroupEngine";

describe("DistrictGroupEngine", () => {
  it("should return the correct district group for given group ids", () => {
    const engine = new DistrictGroupEngine();

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
          { megyekod: 18, oevk: 1 },
          { megyekod: 12, oevk: 2 },
          { megyekod: 7, oevk: 1 },
        ],
      },
    ]);
  });
});
