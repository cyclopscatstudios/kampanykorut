import { describe, it, expect, beforeEach, vi } from "vitest";
import { GameStateEngine } from "./GameStateEngine";
import { container } from "tsyringe";

describe("GameStateEngine", () => {
  let engine: GameStateEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = container.resolve(GameStateEngine);
  });

  describe("getGameState", () => {
    it("returns initial state on construction", () => {
      expect(engine.getGameState()).toEqual({
        activeGameId: null,
      });
    });
  });

  describe("updateGameState", () => {
    it("merges partial state into existing state", () => {
      engine.updateGameState({ activeGameId: "2022_ogyv_default" });

      expect(engine.getGameState().activeGameId).toBe("2022_ogyv_default");
    });
  });
});
