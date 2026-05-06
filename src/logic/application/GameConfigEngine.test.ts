import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConfigEngine } from "./ConfigEngine";
import type { CampaignConfig } from "../types/campaignEngine.types";
import { container } from "tsyringe";

const baseConfig: CampaignConfig = {
  electionConfig: {
    listSeats: 50,
    thresholdPercent: 5,
    parties: [],
    playableSides: [],
    electionAssets: {},
  },
} as unknown as CampaignConfig;

describe("GameConfigEngine", () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
  };

  let engine: ConfigEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error global override
    global.localStorage = localStorageMock;
    engine = container.resolve(ConfigEngine);
    engine.configure(baseConfig);
  });

  describe("getElectionConfig", () => {
    it("returns the config passed to the constructor", () => {
      expect(engine.getCurrentElectionConfig()).toBe(baseConfig.electionConfig);
    });
  });
});
