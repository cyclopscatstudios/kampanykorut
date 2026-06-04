import { DATA_PATHS, getDataPath } from "./PathResolver";

describe("DATA_PATHS", () => {
  it("campaigns is a static string", () => {
    expect(DATA_PATHS.campaigns).toBe("/assets/jsons/game_modes.json");
  });

  it("quotes is a static string", () => {
    expect(DATA_PATHS.quotes).toBe("/assets/jsons/quotes.json");
  });

  it("background is a static string", () => {
    expect(DATA_PATHS.background).toBe("/parlament_night.jpg");
  });

  it("electionConfig is a function", () => {
    expect(typeof DATA_PATHS.electionConfig).toBe("function");
  });

  it("electionConfig function interpolates the route", () => {
    expect(DATA_PATHS.electionConfig("2022")).toBe(
      "/campaigns/2022/election_config.json",
    );
  });
});

describe("getDataPath", () => {
  it("returns the campaigns path", () => {
    expect(getDataPath("campaigns")).toBe("/assets/jsons/game_modes.json");
  });

  it("returns the quotes path", () => {
    expect(getDataPath("quotes")).toBe("/assets/jsons/quotes.json");
  });

  it("returns the background path", () => {
    expect(getDataPath("background")).toBe("/parlament_night.jpg");
  });

  it("returns the parameterized electionConfig path when route is provided", () => {
    expect(getDataPath("electionConfig", "2022")).toBe(
      "/campaigns/2022/election_config.json",
    );
  });

  it("interpolates any route string correctly", () => {
    expect(getDataPath("electionConfig", "custom-route")).toBe(
      "/campaigns/custom-route/election_config.json",
    );
  });

  it("throws when electionConfig is called without a route", () => {
    expect(() => getDataPath("electionConfig")).toThrow(
      "Route is required for key: electionConfig",
    );
  });
});
