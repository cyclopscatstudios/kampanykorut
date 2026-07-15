import { StateHandler, StateHandlerType } from "./StateHandler";

describe("StateHandler", () => {
  let handler: StateHandler;

  beforeEach(() => {
    handler = new StateHandler();
  });

  describe("getState", () => {
    it("returns the default state on construction", () => {
      const state = handler.getState();
      expect(state.campaignState?.turn).toBe(0);
      expect(state.campaignState?.isEnded).toBe(false);
      expect(state.history).toEqual([]);
    });

    it("default gameState has the expected activeCampaignId", () => {
      expect(handler.getState().campaignState?.activeCampaignId).toBe(
        "default-id",
      );
    });
  });

  describe("get", () => {
    it("returns the value for a given key", () => {
      expect(handler.get("campaignState")?.activeCampaignId).toBe("default-id");
    });

    it("returns undefined for an unset optional key", () => {
      expect(handler.get("turnDecision")).toBeNull();
      expect(handler.get("campaignConfig")).toBeNull();
    });
  });

  describe("set", () => {
    it("updates the stored value for the given key", () => {
      const state = handler.get("campaignState");
      handler.set("campaignState", { ...(state ?? null), turn: 3 });

      expect(handler.get("campaignState")?.turn).toBe(3);
    });

    it("successive set() calls accumulate correctly", () => {
      handler.set("campaignState", {
        ...handler.get("campaignState"),
        turn: 1,
      });
      handler.set("campaignState", {
        ...handler.get("campaignState"),
        turn: 2,
      });

      expect(handler.get("campaignState")?.turn).toBe(2);
    });

    it("notifies subscribers with the updated state", () => {
      const received: StateHandlerType[] = [];
      handler.subscribe((state) => received.push(state));

      handler.set("campaignState", {
        ...handler.get("campaignState"),
        turn: 5,
      });

      expect(received).toHaveLength(1);
      expect(received[0].campaignState?.turn).toBe(5);
    });

    it("notifies on every set() call", () => {
      const turns: number[] = [];
      handler.subscribe((state) => turns.push(state.campaignState?.turn));

      handler.set("campaignState", {
        ...handler.get("campaignState"),
        turn: 1,
      });
      handler.set("campaignState", {
        ...handler.get("campaignState"),
        turn: 2,
      });

      expect(turns).toEqual([1, 2]);
    });

    it("sets an optional key that was previously undefined", () => {
      handler.set("turnDecision", {
        questionId: "q1",
        answerId: "a1",
        effects: [],
      });

      expect(handler.get("turnDecision")?.questionId).toBe("q1");
    });

    it("two independent instances do not share state", () => {
      const other = new StateHandler();
      handler.set("campaignState", {
        ...handler.get("campaignState"),
        turn: 99,
      });

      expect(other.get("campaignState").turn)?.toBe(0);
    });
  });
});
