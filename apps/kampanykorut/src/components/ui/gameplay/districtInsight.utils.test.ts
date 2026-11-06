import { getDistrictName } from "./districtInsight.utils";

describe("getDistrictName", () => {
  const district = { oevk: 5, telepules: "V. kerület" };

  it("names a constituency by its number on the country map", () => {
    expect(getDistrictName(district, false)).toBe("5. OEVK");
  });

  it("names a district by its name on the city map", () => {
    expect(getDistrictName(district, true)).toBe("V. kerület");
  });
});
