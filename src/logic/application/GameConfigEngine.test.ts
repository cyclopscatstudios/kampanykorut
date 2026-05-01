import { describe, it, expect, beforeEach, vi } from "vitest";
import { ElectionConfigEngine } from "./ElectionConfigEngine";
import type { ElectionConfig } from "../types/campaignEngine.types";
import { container } from "tsyringe";

const baseElectionConfig: ElectionConfig = {
  listSeats: 50,
  thresholdPercent: 5,
  parties: [],
  playableSides: [],
  electionAssets: {},
};

describe("GameConfigEngine", () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  };

  let engine: ElectionConfigEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error global override
    global.localStorage = localStorageMock;
    engine = container.resolve(ElectionConfigEngine);
    engine.configure(baseElectionConfig);
  });

  describe("getElectionConfig", () => {
    it("returns the config passed to the constructor", () => {
      expect(engine.getCurrentElectionConfig()).toBe(baseElectionConfig);
    });
  });
});
