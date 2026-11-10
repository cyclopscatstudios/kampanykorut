import { getDistrictName, getDistrictTitle } from "./districtInsight.utils";

describe("getDistrictName", () => {
  const district = { oevk: 5, telepules: "V. kerület" };

  it("names a constituency by its number on the country map", () => {
    expect(getDistrictName(district, false)).toBe("5. OEVK");
  });

  it("names a district by its name on the city map", () => {
    expect(getDistrictName(district, true)).toBe("V. kerület");
  });
});

describe("getDistrictTitle", () => {
  it("adds the constituency to the county", () => {
    expect(
      getDistrictTitle({ megye: "Pest", oevk: 5, telepules: "Vác" }, false),
    ).toBe("Pest 5. OEVK");
  });

  it("names only the county when the district covers all of it", () => {
    expect(
      getDistrictTitle(
        { megye: "Baranya és Tolna", oevk: 1, telepules: "Baranya és Tolna" },
        false,
      ),
    ).toBe("Baranya és Tolna");
  });
});
