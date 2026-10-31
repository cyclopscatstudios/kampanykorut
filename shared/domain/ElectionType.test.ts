import { ElectionConfig } from "../types";
import {
  getElectionType,
  getParliamentaryConfig,
  getPlayerVoteKey,
  isCityDistrictMap,
  isMayoralElection,
} from "./ElectionType";
import { mockElectionConfig } from "./mocks/mockElectionConfig";

const mayoralConfig = {
  ...mockElectionConfig,
  election: { type: "mayoral" },
} as ElectionConfig;

const playerSide = { partyId: "lmp", candidateId: "vitezy" };

describe("getElectionType", () => {
  it("defaults to parliamentary when the config has no election block", () => {
    expect(getElectionType({})).toBe("parliamentary");
    expect(getElectionType(undefined)).toBe("parliamentary");
  });

  it("returns the configured type", () => {
    expect(getElectionType({ election: { type: "mayoral" } })).toBe("mayoral");
  });
});

describe("isMayoralElection / getParliamentaryConfig", () => {
  it("narrows by election type", () => {
    expect(isMayoralElection(mayoralConfig)).toBe(true);
    expect(isMayoralElection(mockElectionConfig)).toBe(false);
    expect(getParliamentaryConfig(mayoralConfig)).toBeUndefined();
    expect(getParliamentaryConfig(mockElectionConfig)).toBe(mockElectionConfig);
    expect(getParliamentaryConfig(undefined)).toBeUndefined();
  });
});

describe("getPlayerVoteKey", () => {
  it("uses the party id in a parliamentary election", () => {
    expect(getPlayerVoteKey(mockElectionConfig, playerSide)).toBe("lmp");
    expect(getPlayerVoteKey(undefined, playerSide)).toBe("lmp");
  });

  it("uses the candidate id in a mayoral election", () => {
    expect(getPlayerVoteKey(mayoralConfig, playerSide)).toBe("vitezy");
    expect(getPlayerVoteKey(mayoralConfig, undefined)).toBeUndefined();
  });
});

describe("isCityDistrictMap", () => {
  it("is true only for the Budapest districts map", () => {
    expect(isCityDistrictMap({ districtMap: "budapest-districts" })).toBe(true);
    expect(isCityDistrictMap({ districtMap: "2024" })).toBe(false);
    expect(isCityDistrictMap(undefined)).toBe(false);
  });
});
