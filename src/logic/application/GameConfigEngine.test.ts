import { describe, it, expect, beforeEach, vi } from "vitest";
import { GameConfigEngine } from "./GameConfigEngine";
import type { ElectionConfig } from "../types/campaignEngine.types";
import { container } from "tsyringe";

const baseElectionConfig: ElectionConfig = {
  listSeats: 93,
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

  let engine: GameConfigEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error global override
    global.localStorage = localStorageMock;
    engine = container.resolve(GameConfigEngine);
    engine.configure(baseElectionConfig);
  });

  describe("configure", () => {
    it("marks engine as configured", () => {
      expect(engine.isConfigured()).toBe(true);
    });

    it("does not write to localStorage", () => {
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("getElectionConfig", () => {
    it("returns the config passed to the constructor", () => {
      expect(engine.getElectionConfig()).toBe(baseElectionConfig);
    });
  });

  describe("getGameSettings", () => {
    it("returns parsed settings from localStorage", () => {
      const stored = { showAdvisorFeedback: false };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(stored));

      expect(engine.getGameSettings()).toEqual(stored);
    });

    it("falls back to defaults when localStorage returns null", () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(engine.getGameSettings()).toEqual({ showAdvisorFeedback: true });
    });
  });

  describe("updateGameConfig", () => {
    it("merges partial config into existing config", () => {
      engine.updateGameConfig({ listSeats: 50 });

      expect(engine.getElectionConfig()).toEqual({
        ...baseElectionConfig,
        listSeats: 50,
      });
    });

    it("notifies subscribers with the updated config", () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      engine.updateGameConfig({ thresholdPercent: 10 });

      expect(listener).toHaveBeenCalledWith({
        ...baseElectionConfig,
        thresholdPercent: 10,
      });
    });

    it("does not notify unsubscribed listeners", () => {
      const listener = vi.fn();
      const unsubscribe = engine.subscribe(listener);
      unsubscribe();

      engine.updateGameConfig({ listSeats: 50 });

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
