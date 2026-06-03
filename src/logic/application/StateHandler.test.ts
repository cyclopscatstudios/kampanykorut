import { StateHandler, StateHandlerType } from "./StateHandler";

describe("StateHandler", () => {
  let handler: StateHandler;

  beforeEach(() => {
    handler = new StateHandler();
  });

  describe("getState", () => {
    it("returns the default state on construction", () => {
      const state = handler.getState();
      expect(state.gameState.turn).toBe(0);
      expect(state.gameState.isEnded).toBe(false);
      expect(state.history).toEqual([]);
    });

    it("default gameState has the expected activeCampaignId", () => {
      expect(handler.getState().gameState.activeCampaignId).toBe("default-id");
    });
  });

  describe("get", () => {
    it("returns the value for a given key", () => {
      expect(handler.get("gameState").activeCampaignId).toBe("default-id");
    });

    it("returns undefined for an unset optional key", () => {
      expect(handler.get("turnDecision")).toBeUndefined();
      expect(handler.get("currentConfig")).toBeUndefined();
    });
  });

  describe("set", () => {
    it("updates the stored value for the given key", () => {
      handler.set("gameState", { ...handler.get("gameState"), turn: 3 });

      expect(handler.get("gameState").turn).toBe(3);
    });

    it("successive set() calls accumulate correctly", () => {
      handler.set("gameState", { ...handler.get("gameState"), turn: 1 });
      handler.set("gameState", { ...handler.get("gameState"), turn: 2 });

      expect(handler.get("gameState").turn).toBe(2);
    });

    it("notifies subscribers with the updated state", () => {
      const received: StateHandlerType[] = [];
      handler.subscribe((state) => received.push(state));

      handler.set("gameState", { ...handler.get("gameState"), turn: 5 });

      expect(received).toHaveLength(1);
      expect(received[0].gameState.turn).toBe(5);
    });

    it("notifies on every set() call", () => {
      const turns: number[] = [];
      handler.subscribe((state) => turns.push(state.gameState.turn));

      handler.set("gameState", { ...handler.get("gameState"), turn: 1 });
      handler.set("gameState", { ...handler.get("gameState"), turn: 2 });

      expect(turns).toEqual([1, 2]);
    });

    it("sets an optional key that was previously undefined", () => {
      handler.set("turnDecision", { questionId: "q1", answerId: "a1", effects: [] });

      expect(handler.get("turnDecision")?.questionId).toBe("q1");
    });

    it("two independent instances do not share state", () => {
      const other = new StateHandler();
      handler.set("gameState", { ...handler.get("gameState"), turn: 99 });

      expect(other.get("gameState").turn).toBe(0);
    });
  });
});
