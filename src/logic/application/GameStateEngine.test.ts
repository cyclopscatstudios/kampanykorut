import { describe, it, expect, beforeEach, vi } from "vitest";
import { StateEngine } from "./StateEngine";
import { container } from "tsyringe";

describe("GameStateEngine", () => {
  let engine: StateEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = container.resolve(StateEngine);
  });

  describe("getGameState", () => {
    it("returns initial state on construction", () => {
      expect(engine.getCampaignState()).toEqual(null);
    });
  });

  describe("updateGameState", () => {
    it("merges partial state into existing state", () => {
      engine.updateCampaignState({ activeCampaignId: "2022_ogyv_default" });

      expect(engine.getCampaignState()?.activeCampaignId).toBe(
        "2022_ogyv_default",
      );
    });
  });
});
