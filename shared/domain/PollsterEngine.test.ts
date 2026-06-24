import { Mock } from "vitest";
import { CampaignState } from "../types";
import { Pollster } from "../types/pollsters";
import { defaultPollsters } from "./DefaultPollsters";
import { MandateCalculator } from "./MandateCalculator";
import { mockElectionConfig } from "./mocks/mockElectionConfig";
import { mockCandidateListData, mockPartyListData } from "./mocks/mockListData";
import { AGGREGATE_POLLSTER_ID, PollsterEngine } from "./PollsterEngine";

const MOCK_PERCENTAGES = {
  party_a: 0.5,
  party_b: 0.5,
  _total: 1,
};

const mockMandateCalculator = {
  calculate: vi.fn(),
} as unknown as MandateCalculator;

const mockState: CampaignState = {
  activeCampaignId: "test",
  turn: 0,
  isEnded: false,
  candidateListData: mockCandidateListData,
  partyListData: mockPartyListData,
  isBaseResultsAlreadyApplied: false,
};

describe("PollsterEngine.configure", () => {
  let engine: PollsterEngine;

  beforeEach(() => {
    engine = new PollsterEngine(mockMandateCalculator);
  });

  it("loads default pollsters when called without arguments", () => {
    engine.configure();
    expect(engine.getPollsters()).toEqual(defaultPollsters);
  });

  it("appends custom pollsters after defaults", () => {
    const custom: Pollster[] = [
      { id: "custom", label: "Custom", errorMargin: { min: 1, max: 3 } },
    ];
    engine.configure(custom);
    expect(engine.getPollsters()).toEqual([...defaultPollsters, ...custom]);
  });

  it("calling configure() again resets to defaults only", () => {
    const custom: Pollster[] = [
      { id: "custom", label: "Custom", errorMargin: { min: 1, max: 3 } },
    ];
    engine.configure(custom);
    engine.configure();
    expect(engine.getPollsters()).toHaveLength(defaultPollsters.length);
    expect(
      engine.getPollsters().find((p) => p.id === "custom"),
    ).toBeUndefined();
  });
});

describe("PollsterEngine.getPolls", () => {
  let engine: PollsterEngine;

  beforeEach(() => {
    vi.restoreAllMocks();
    (mockMandateCalculator.calculate as Mock).mockReturnValue({
      percentages: MOCK_PERCENTAGES,
      mandates: [],
    });
    engine = new PollsterEngine(mockMandateCalculator);
    engine.configure();
  });

  it("returns undefined when mandateCalculator has no result", () => {
    (mockMandateCalculator.calculate as Mock).mockReturnValueOnce(null);
    expect(engine.getPolls(mockState, mockElectionConfig)).toBeUndefined();
  });

  it("returns undefined when percentages are missing", () => {
    (mockMandateCalculator.calculate as Mock).mockReturnValueOnce({
      mandates: [],
    });
    expect(engine.getPolls(mockState, mockElectionConfig)).toBeUndefined();
  });

  it("returns a record with party keys but without _total", () => {
    const result = engine.getPolls(mockState, mockElectionConfig)!;
    expect(result).toHaveProperty("party_a");
    expect(result).toHaveProperty("party_b");
    expect(result).not.toHaveProperty("_total");
  });

  it("all values are finite numbers", () => {
    const result = engine.getPolls(mockState, mockElectionConfig)!;
    for (const value of Object.values(result)) {
      expect(typeof value).toBe("number");
      expect(isFinite(value)).toBe(true);
    }
  });
});

describe("PollsterEngine.getPollsByPollsterId", () => {
  let engine: PollsterEngine;

  beforeEach(() => {
    vi.restoreAllMocks();
    (mockMandateCalculator.calculate as Mock).mockReturnValue({
      percentages: MOCK_PERCENTAGES,
      mandates: [],
    });
    engine = new PollsterEngine(mockMandateCalculator);
    engine.configure();
  });

  it("returns undefined for an unknown pollster id", () => {
    expect(
      engine.getPollsByPollsterId("nonexistent", mockState, mockElectionConfig),
    ).toBeUndefined();
  });

  it("returns undefined when percentages are missing for a valid pollster", () => {
    (mockMandateCalculator.calculate as Mock).mockReturnValueOnce(null);
    expect(
      engine.getPollsByPollsterId("median", mockState, mockElectionConfig),
    ).toBeUndefined();
  });

  it("delegates to getPolls when pollsterId is AGGREGATE_POLLSTER_ID", () => {
    const getPolls = vi.spyOn(engine, "getPolls");
    engine.getPollsByPollsterId(
      AGGREGATE_POLLSTER_ID,
      mockState,
      mockElectionConfig,
    );
    expect(getPolls).toHaveBeenCalledWith(mockState, mockElectionConfig);
  });

  it("returns party keys without _total for a valid pollster", () => {
    const result = engine.getPollsByPollsterId(
      "median",
      mockState,
      mockElectionConfig,
    )!;
    expect(result.differences).toHaveProperty("party_a");
    expect(result.differences).toHaveProperty("party_b");
    expect(result.differences).not.toHaveProperty("_total");
  });

  it("positive bias shifts the difference in the positive direction", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const biasedPollster: Pollster = {
      id: "biased",
      label: "Biased",
      errorMargin: { min: 0, max: 0 },
      bias: [{ type: "result", partyBias: { party_a: 10 } }],
    };
    engine.configure([biasedPollster]);

    const result = engine.getPollsByPollsterId(
      "biased",
      mockState,
      mockElectionConfig,
    )!;

    // party_a gets +10pp bias → poll overestimates it → positive difference
    expect(result.differences.party_a).toBeGreaterThan(0);
    // party_b gets no bias but party_a absorbs more share → party_b underestimated
    expect(result.differences.party_b).toBeLessThan(0);
  });

  it("zero error margin and no bias produces near-zero differences", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const neutralPollster: Pollster = {
      id: "neutral",
      label: "Neutral",
      errorMargin: { min: 0, max: 0 },
    };
    engine.configure([neutralPollster]);

    const result = engine.getPollsByPollsterId(
      "neutral",
      mockState,
      mockElectionConfig,
    )!;

    expect(result.differences.party_a).toBeCloseTo(0, 5);
    expect(result.differences.party_b).toBeCloseTo(0, 5);
  });
});
