import { describe, it, expect, beforeEach, vi } from "vitest";
import { GameStateEngine } from "./GameStateEngine";
import type { GameConfigEngine } from "./GameConfigEngine";

const mockConfigure = vi.fn();
const mockGameConfigEngine = {
  configure: mockConfigure,
} as unknown as GameConfigEngine;

describe("GameStateEngine", () => {
  let engine: GameStateEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new GameStateEngine(mockGameConfigEngine);
  });

  describe("getGameState", () => {
    it("returns initial state on construction", () => {
      expect(engine.getGameState()).toEqual({
        currentScreen: "MenuSelector",
        menuType: "mainMenu",
        activeGameId: undefined,
      });
    });
  });

  describe("updateGameState", () => {
    it("merges partial state into existing state", () => {
      engine.updateGameState({ currentScreen: "MapCreator" });

      expect(engine.getGameState().currentScreen).toBe("MapCreator");
      expect(engine.getGameState().menuType).toBe("mainMenu");
    });

    it("notifies subscribers with updated state", () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      engine.updateGameState({ currentScreen: "MapCreator" });

      expect(listener).toHaveBeenCalledWith({
        currentScreen: "MapCreator",
        menuType: "mainMenu",
        activeGameId: undefined,
      });
    });

    it("does not notify unsubscribed listeners", () => {
      const listener = vi.fn();
      const unsubscribe = engine.subscribe(listener);
      unsubscribe();

      engine.updateGameState({ currentScreen: "MapCreator" });

      expect(listener).not.toHaveBeenCalled();
    });

    it("calls gameConfigEngine.configure when activeGameId is set", () => {
      engine.updateGameState({ activeGameId: "2022_ogyv_default" });

      expect(mockConfigure).toHaveBeenCalledOnce();
    });

    it("does not call gameConfigEngine.configure when activeGameId is absent", () => {
      engine.updateGameState({ currentScreen: "MapCreator" });

      expect(mockConfigure).not.toHaveBeenCalled();
    });

    it("persists multiple sequential updates correctly", () => {
      engine.updateGameState({ menuType: "gameMenu" });
      engine.updateGameState({ currentScreen: "MapCreator" });

      expect(engine.getGameState()).toEqual({
        currentScreen: "MapCreator",
        menuType: "gameMenu",
        activeGameId: undefined,
      });
    });
  });
});
