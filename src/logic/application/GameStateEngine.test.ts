import { describe, it, expect, beforeEach, vi } from "vitest";
import { StateEngine, type SavedCampaignSessionInfo } from "./StateEngine";
import { StorageEngine } from "./StorageEngine";
import { ConfigEngine } from "./ConfigEngine";
import { Navigation } from "./navigation/Navigation";
import { container } from "tsyringe";
import { DistrictGroupEngine, VoterEnvironment } from "@/shared/domain";

const FIXED_SESSION_ID = "fixed-test-session-id";
const FIXED_GENERATED_ID = "generated-uuid";

function makeMemoryLocalStorage() {
  const map = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => map.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      map.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      map.delete(key);
    }),
    clear: vi.fn(() => map.clear()),
    _map: map,
  };
}

function makeEngine(
  navigation: Navigation = new Navigation(),
  generateId: () => string = () => FIXED_GENERATED_ID,
) {
  const storage = new StorageEngine();
  const configEngine = new ConfigEngine(storage);
  const voterEnv = { configure: vi.fn() } as unknown as VoterEnvironment;
  const districtGroupEngine = {
    configure: vi.fn(),
  } as unknown as DistrictGroupEngine;

  const engine = new StateEngine(
    configEngine,
    voterEnv,
    districtGroupEngine,
    storage,
    generateId,
    navigation,
  );
  (engine as unknown as { sessionId: string }).sessionId = FIXED_SESSION_ID;
  return { engine, configEngine, navigation };
}

describe("StateEngine", () => {
  let mem: ReturnType<typeof makeMemoryLocalStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    mem = makeMemoryLocalStorage();
    // @ts-expect-error global override
    global.localStorage = mem;
    window.history.pushState({}, "", "/game/x?sessionId=" + FIXED_SESSION_ID);
    mem._map.set("kampanykorut_currentSessionId", FIXED_SESSION_ID);
  });

  describe("getCampaignState", () => {
    it("returns null on construction with no stored state", () => {
      const engine = container.resolve(StateEngine);
      expect(engine.getCampaignState()).toEqual(null);
    });
  });

  describe("getHistory", () => {
    it("returns null when no history is stored", () => {
      const { engine } = makeEngine();
      expect(engine.getHistory()).toBeNull();
    });

    it("returns parsed history when present", () => {
      const { engine } = makeEngine();
      const items = [{ questionId: "q1", answerId: "a1" }];
      mem._map.set(
        `kampanykorut_turnHistory-${FIXED_SESSION_ID}`,
        JSON.stringify(items),
      );

      expect(engine.getHistory()).toEqual(items);
    });
  });

  describe("getSavedGameSessions", () => {
    it("returns empty array when nothing is stored", () => {
      const { engine } = makeEngine();
      expect(engine.getSavedGameSessions()).toEqual([]);
    });

    it("backfills missing id on legacy sessions", () => {
      const { engine } = makeEngine(new Navigation(), () => "new-id");
      const legacy = [
        {
          sessionId: "s1",
          campaignId: "c1",
          name: "old save",
        } as SavedCampaignSessionInfo,
      ];
      mem._map.set("kampanykorut_savedSessions", JSON.stringify(legacy));

      const result = engine.getSavedGameSessions();

      expect(result[0].id).toBeDefined();
      expect(result[0].id).not.toBe("");
      expect(result[0].sessionId).toBe("s1");
    });

    it("persists migrated sessions back to storage", () => {
      const { engine } = makeEngine();
      const legacy = [
        {
          sessionId: "s1",
          campaignId: "c1",
          name: "old save",
        } as SavedCampaignSessionInfo,
      ];
      mem._map.set("kampanykorut_savedSessions", JSON.stringify(legacy));

      engine.getSavedGameSessions();

      const written = JSON.parse(
        mem._map.get("kampanykorut_savedSessions") ?? "[]",
      );
      expect(written[0].id).toBeDefined();
    });

    it("does not rewrite storage when no migration is needed", () => {
      const { engine } = makeEngine();
      const sessions = [
        {
          id: "abc",
          sessionId: "s1",
          campaignId: "c1",
          name: "save",
        },
      ];
      mem._map.set("kampanykorut_savedSessions", JSON.stringify(sessions));
      mem.setItem.mockClear();

      engine.getSavedGameSessions();

      expect(mem.setItem).not.toHaveBeenCalled();
    });
  });

  describe("getSessionSlots", () => {
    it("computes available slots from used count", () => {
      const { engine } = makeEngine();
      const sessions = Array.from({ length: 2 }, (_, i) => ({
        id: `id-${i}`,
        sessionId: `s-${i}`,
        campaignId: "c1",
        name: `save ${i}`,
      }));
      mem._map.set("kampanykorut_savedSessions", JSON.stringify(sessions));

      const { availableSlots, usedSlots } = engine.getSessionSlots();
      expect(usedSlots).toHaveLength(2);
      expect(availableSlots).toBe(3);
    });
  });

  describe("saveToSlot", () => {
    function seedCampaignState(campaignId = "c-test") {
      mem._map.set(
        `kampanykorut_campaignState-${FIXED_SESSION_ID}`,
        JSON.stringify({
          activeCampaignId: campaignId,
          turn: 0,
          isEnded: false,
        }),
      );
    }

    it("creates a new session info entry with a fresh id", () => {
      const { engine } = makeEngine();
      seedCampaignState();

      engine.saveToSlot("my-save");

      const sessions = JSON.parse(
        mem._map.get("kampanykorut_savedSessions") ?? "[]",
      ) as SavedCampaignSessionInfo[];
      expect(sessions).toHaveLength(1);
      expect(sessions[0].name).toBe("my-save");
      expect(sessions[0].sessionId).toBe(FIXED_SESSION_ID);
      expect(sessions[0].campaignId).toBe("c-test");
      expect(sessions[0].id).toBeDefined();
    });

    it("falls back to in-memory campaignState when storage is empty", () => {
      const { engine } = makeEngine();
      (engine as unknown as { campaignState: object }).campaignState = {
        activeCampaignId: "c-mem",
        turn: 0,
        isEnded: false,
      };

      engine.saveToSlot("from-memory");

      const sessions = JSON.parse(
        mem._map.get("kampanykorut_savedSessions") ?? "[]",
      );
      expect(sessions[0].campaignId).toBe("c-mem");
    });

    it("does nothing when no campaignId can be resolved", () => {
      const { engine } = makeEngine();

      engine.saveToSlot("nope");

      expect(mem._map.get("kampanykorut_savedSessions")).toBeUndefined();
    });

    it("overwrites an existing slot when given its id", () => {
      const { engine } = makeEngine();
      seedCampaignState();
      const existing = [
        {
          id: "slot-1",
          sessionId: "old-session",
          campaignId: "c-old",
          name: "first save",
          lastSaved: "2024-01-01T00:00:00Z",
        },
      ];
      mem._map.set("kampanykorut_savedSessions", JSON.stringify(existing));

      engine.saveToSlot("renamed", "slot-1");

      const sessions = JSON.parse(
        mem._map.get("kampanykorut_savedSessions") ?? "[]",
      );
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe("slot-1");
      expect(sessions[0].name).toBe("renamed");
    });

    it("refuses to add a new slot beyond MAX_SAVED_SESSIONS", () => {
      const { engine } = makeEngine();
      seedCampaignState();
      const full = Array.from({ length: 5 }, (_, i) => ({
        id: `id-${i}`,
        sessionId: `s-${i}`,
        campaignId: "c1",
        name: `save ${i}`,
      }));
      mem._map.set("kampanykorut_savedSessions", JSON.stringify(full));

      engine.saveToSlot("one-too-many");

      const sessions = JSON.parse(
        mem._map.get("kampanykorut_savedSessions") ?? "[]",
      );
      expect(sessions).toHaveLength(5);
      expect(
        sessions.map((s: SavedCampaignSessionInfo) => s.name),
      ).not.toContain("one-too-many");
    });

    it("still allows overwriting when at the cap", () => {
      const { engine } = makeEngine();
      seedCampaignState();
      const full = Array.from({ length: 5 }, (_, i) => ({
        id: `id-${i}`,
        sessionId: `s-${i}`,
        campaignId: "c1",
        name: `save ${i}`,
      }));
      mem._map.set("kampanykorut_savedSessions", JSON.stringify(full));

      engine.saveToSlot("renamed", "id-2");

      const sessions = JSON.parse(
        mem._map.get("kampanykorut_savedSessions") ?? "[]",
      ) as SavedCampaignSessionInfo[];
      expect(sessions).toHaveLength(5);
      expect(sessions.find((s) => s.id === "id-2")?.name).toBe("renamed");
    });
  });

  describe("saveState", () => {
    it("routes campaignState to updateCampaignState", () => {
      const { engine } = makeEngine();

      engine.saveState("campaignState", {
        activeCampaignId: "c-1",
        turn: 0,
        isEnded: false,
      });

      const stored = mem._map.get(
        `kampanykorut_campaignState-${FIXED_SESSION_ID}`,
      );
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!).activeCampaignId).toBe("c-1");
    });

    it("routes questionHistory to updateQuestionHistory (appends)", () => {
      const { engine } = makeEngine();

      engine.saveState("turnHistory", { questionId: "q1", answerId: "a1" });
      engine.saveState("turnHistory", { questionId: "q2", answerId: "a2" });

      const stored = JSON.parse(
        mem._map.get(`kampanykorut_turnHistory-${FIXED_SESSION_ID}`) ?? "[]",
      );
      expect(stored).toHaveLength(2);
      expect(stored[0].questionId).toBe("q1");
      expect(stored[1].questionId).toBe("q2");
    });

    it("does not call saveToSlot anymore", () => {
      const { engine } = makeEngine();

      engine.saveState("campaignState", {
        activeCampaignId: "c-1",
        turn: 0,
        isEnded: false,
      });

      expect(mem._map.get("kampanykorut_savedSessions")).toBeUndefined();
    });
  });

  describe("loadState", () => {
    const validSession: SavedCampaignSessionInfo = {
      id: "slot-1",
      sessionId: "session-abc",
      campaignId: "2022_ogyv_default",
      name: "saved game",
    };

    function seedHistory(sessionId = "session-abc") {
      mem._map.set(
        `kampanykorut_turnHistory-${sessionId}`,
        JSON.stringify([{ questionId: "q1", answerId: "a1" }]),
      );
    }

    function seedCampaignStateForSession(
      sessionId = "session-abc",
      campaignId = "2022_ogyv_default",
    ) {
      mem._map.set(
        `kampanykorut_campaignState-${sessionId}`,
        JSON.stringify({
          activeCampaignId: campaignId,
          turn: 3,
          isEnded: false,
        }),
      );
    }

    it("returns early when session is null", () => {
      const navigation = new Navigation();
      const goSpy = vi.spyOn(navigation, "go");
      const { engine } = makeEngine(navigation);

      engine.loadState(null);

      expect(goSpy).not.toHaveBeenCalled();
    });

    it("returns early when campaignId or sessionId is missing", () => {
      const navigation = new Navigation();
      const goSpy = vi.spyOn(navigation, "go");
      const { engine } = makeEngine(navigation);

      engine.loadState({ ...validSession, campaignId: "" });

      expect(goSpy).not.toHaveBeenCalled();
    });

    it("returns early when no history exists for the session", () => {
      const navigation = new Navigation();
      const goSpy = vi.spyOn(navigation, "go");
      const { engine } = makeEngine(navigation);

      engine.loadState(validSession);

      expect(goSpy).not.toHaveBeenCalled();
    });

    it("navigates to the game route via Navigation when not currently in /game/", () => {
      window.history.pushState({}, "", "/load-game");
      const navigation = new Navigation();
      const goSpy = vi.spyOn(navigation, "go").mockImplementation(() => {});
      const { engine } = makeEngine(navigation);
      seedHistory();
      seedCampaignStateForSession();

      engine.loadState(validSession);

      expect(goSpy).toHaveBeenCalledWith(
        `/game/${validSession.campaignId}?sessionId=${validSession.sessionId}`,
      );
    });

    it("force-configures the ConfigEngine with the loaded campaign", () => {
      window.history.pushState({}, "", "/load-game");
      const navigation = new Navigation();
      vi.spyOn(navigation, "go").mockImplementation(() => {});
      const { engine, configEngine } = makeEngine(navigation);
      const configureSpy = vi.spyOn(configEngine, "configure");
      seedHistory();
      seedCampaignStateForSession();

      engine.loadState(validSession);

      expect(configureSpy).toHaveBeenCalledWith(
        expect.anything(),
        validSession.campaignId,
        true,
      );
    });

    it("persists the loaded sessionId as currentSessionId", () => {
      window.history.pushState({}, "", "/load-game");
      const navigation = new Navigation();
      vi.spyOn(navigation, "go").mockImplementation(() => {});
      const { engine } = makeEngine(navigation);
      seedHistory();
      seedCampaignStateForSession();

      engine.loadState(validSession);

      expect(mem._map.get("kampanykorut_currentSessionId")).toBe(
        validSession.sessionId,
      );
    });
  });
});
