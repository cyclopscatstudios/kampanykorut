import { describe, it, expect, beforeEach, vi } from "vitest";
import { CampaignStateEngine } from "./CampaignStateEngine";
import { container } from "tsyringe";

describe("GameStateEngine", () => {
  let engine: CampaignStateEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = container.resolve(CampaignStateEngine);
  });

  describe("getGameState", () => {
    it("returns initial state on construction", () => {
      expect(engine.getCampaignState()).toEqual({
        activeCampaignId: null,
        isEnded: false,
        turn: 0,
      });
    });
  });

  describe("updateGameState", () => {
    it("merges partial state into existing state", () => {
      engine.updateCampaignState({ activeCampaignId: "2022_ogyv_default" });

      expect(engine.getCampaignState().activeCampaignId).toBe(
        "2022_ogyv_default",
      );
    });
  });
});
