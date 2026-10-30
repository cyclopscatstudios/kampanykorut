import { getElectionType } from "./ElectionType";

describe("getElectionType", () => {
  it("defaults to parliamentary when the config has no election block", () => {
    expect(getElectionType({})).toBe("parliamentary");
    expect(getElectionType(undefined)).toBe("parliamentary");
  });

  it("returns the configured type", () => {
    expect(getElectionType({ election: { type: "mayoral" } })).toBe("mayoral");
  });
});
