import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DistrictGroupEngine, VoterEnvironment } from "@/shared/domain";
import { ConfigEngine } from "./ConfigEngine";
import { Navigation } from "./navigation/Navigation";
import { type SavedCampaignSessionInfo, StateEngine } from "./StateEngine";
import { StateHandler } from "./StateHandler";
import { StorageEngine } from "./StorageEngine";

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
    key: vi.fn((index: number) => Array.from(map.keys())[index] ?? null),
    get length() {
      return map.size;
    },
    _map: map,
  };
}

function makeEngine(
  navigation: Navigation = new Navigation(),
  generateId: () => string = () => FIXED_GENERATED_ID,
) {
  const storage = new StorageEngine();
  const stateHandler = new StateHandler();
  const configEngine = new ConfigEngine(storage, stateHandler);
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
    stateHandler,
  );
  (engine as unknown as { sessionId: string }).sessionId = FIXED_SESSION_ID;
  return { engine, configEngine, navigation, stateHandler };
}

describe("StateEngine", () => {
  let mem: ReturnType<typeof makeMemoryLocalStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    mem = makeMemoryLocalStorage();
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
          type: "manual",
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

  describe("getAutoSaveSessions", () => {
    it("returns an empty list when there is no active campaign", () => {
      const { engine } = makeEngine();
      expect(engine.getAutoSaveSessions()).toEqual([]);
    });

    it("reflects the live session without needing a manual save", () => {
      const { engine } = makeEngine();
      engine.updateCampaignState({
        activeCampaignId: "c-test",
        turn: 4,
        isEnded: false,
      });

      const [autoSave] = engine.getAutoSaveSessions();

      expect(autoSave?.sessionId).toBe(FIXED_SESSION_ID);
      expect(autoSave?.campaignId).toBe("c-test");
      expect(autoSave?.type).toBe("auto");
    });

    it("stays in sync as the live session keeps changing", () => {
      const { engine } = makeEngine();
      engine.updateCampaignState({
        activeCampaignId: "c-test",
        turn: 0,
        isEnded: false,
      });

      engine.updateCampaignState({ turn: 7 });

      const [autoSave] = engine.getAutoSaveSessions();
      const state = JSON.parse(
        mem._map.get(`kampanykorut_campaignState-${autoSave!.sessionId}`)!,
      );
      expect(state.turn).toBe(7);
    });

    it("keeps exactly one auto-save slot per campaign, overwriting on repeated saves", () => {
      const { engine } = makeEngine();
      engine.updateCampaignState({
        activeCampaignId: "c-test",
        turn: 0,
        isEnded: false,
      });
      engine.updateCampaignState({ turn: 1 });
      engine.updateCampaignState({ turn: 2 });

      const autoSaves = engine
        .getAutoSaveSessions()
        .filter((s) => s.campaignId === "c-test");

      expect(autoSaves).toHaveLength(1);
    });

    it("keeps a separate auto-save available for another campaign, regardless of which session is currently active", () => {
      const otherSessionId = "other-session-id";
      mem._map.set(
        `kampanykorut_campaignState-${otherSessionId}`,
        JSON.stringify({
          activeCampaignId: "c-other",
          turn: 9,
          isEnded: false,
        }),
      );
      mem._map.set(
        "kampanykorut_autoSaveRegistry",
        JSON.stringify([{ campaignId: "c-other", sessionId: otherSessionId }]),
      );

      const { engine } = makeEngine();
      engine.updateCampaignState({
        activeCampaignId: "c-test",
        turn: 0,
        isEnded: false,
      });

      const autoSaves = engine.getAutoSaveSessions();

      expect(autoSaves).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            campaignId: "c-other",
            sessionId: otherSessionId,
          }),
          expect.objectContaining({
            campaignId: "c-test",
            sessionId: FIXED_SESSION_ID,
          }),
        ]),
      );
    });
  });

  describe("cleanupUnsavedStates", () => {
    it("does not delete the live session's storage even without a manual save", () => {
      const { engine } = makeEngine();
      engine.updateCampaignState({
        activeCampaignId: "c-test",
        turn: 0,
        isEnded: false,
      });

      engine.cleanupUnsavedStates();

      expect(
        mem._map.get(`kampanykorut_campaignState-${FIXED_SESSION_ID}`),
      ).toBeDefined();
    });

    it("removes campaignState/turnHistory not referenced by any manual save or the live session", () => {
      const { engine } = makeEngine();
      mem._map.set(
        "kampanykorut_campaignState-orphan-id",
        JSON.stringify({ activeCampaignId: "c1", turn: 0, isEnded: false }),
      );

      engine.cleanupUnsavedStates();

      expect(
        mem._map.get("kampanykorut_campaignState-orphan-id"),
      ).toBeUndefined();
    });

    it("keeps another campaign's auto-save alive even while a different session is active", () => {
      const otherSessionId = "other-session-id";
      mem._map.set(
        `kampanykorut_campaignState-${otherSessionId}`,
        JSON.stringify({
          activeCampaignId: "c-other",
          turn: 9,
          isEnded: false,
        }),
      );
      mem._map.set(
        "kampanykorut_autoSaveRegistry",
        JSON.stringify([{ campaignId: "c-other", sessionId: otherSessionId }]),
      );

      const { engine } = makeEngine();
      engine.updateCampaignState({
        activeCampaignId: "c-test",
        turn: 0,
        isEnded: false,
      });

      engine.cleanupUnsavedStates();

      expect(
        mem._map.get(`kampanykorut_campaignState-${otherSessionId}`),
      ).toBeDefined();
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

    it("creates a new session info entry with a fresh id, snapshotting state under its own session id", () => {
      const { engine } = makeEngine();
      seedCampaignState();

      engine.saveToSlot("my-save");

      const sessions = JSON.parse(
        mem._map.get("kampanykorut_savedSessions") ?? "[]",
      ) as SavedCampaignSessionInfo[];
      expect(sessions).toHaveLength(1);
      expect(sessions[0].name).toBe("my-save");
      expect(sessions[0].campaignId).toBe("c-test");
      expect(sessions[0].id).toBeDefined();
      expect(sessions[0].type).toBe("manual");
      // the snapshot must live under its own session id, not the live one,
      // so that continued play never mutates the manual save
      expect(sessions[0].sessionId).not.toBe(FIXED_SESSION_ID);
      const snapshot = JSON.parse(
        mem._map.get(`kampanykorut_campaignState-${sessions[0].sessionId}`) ??
          "null",
      );
      expect(snapshot.activeCampaignId).toBe("c-test");
    });

    it("does not mutate the manual snapshot when the live session keeps changing", () => {
      const { engine } = makeEngine();
      seedCampaignState();

      engine.saveToSlot("my-save");
      const sessions = JSON.parse(
        mem._map.get("kampanykorut_savedSessions") ?? "[]",
      ) as SavedCampaignSessionInfo[];
      const snapshotSessionId = sessions[0].sessionId;

      // simulate continuing to play after the manual save
      engine.updateCampaignState({
        activeCampaignId: "c-test",
        turn: 99,
        isEnded: false,
      });

      const snapshot = JSON.parse(
        mem._map.get(`kampanykorut_campaignState-${snapshotSessionId}`)!,
      );
      expect(snapshot.turn).not.toBe(99);
    });

    it("falls back to in-memory campaignState when storage is empty", () => {
      const { engine, stateHandler } = makeEngine();
      stateHandler.set("campaignState", {
        activeCampaignId: "c-mem",
        turn: 0,
        isEnded: false,
        isBaseResultsAlreadyApplied: false,
      });

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

    it("navigates to a freshly forked session id for a manual save, leaving the snapshot untouched", () => {
      window.history.pushState({}, "", "/load-game");
      const navigation = new Navigation();
      const goSpy = vi.spyOn(navigation, "go").mockImplementation(() => {});
      const { engine } = makeEngine(navigation);
      seedHistory();
      seedCampaignStateForSession();

      engine.loadState(validSession);

      expect(goSpy).toHaveBeenCalledWith(
        `/game/${validSession.campaignId}?sessionId=${FIXED_GENERATED_ID}`,
      );
      // the original manual snapshot must still exist, unmodified
      expect(
        mem._map.get(`kampanykorut_campaignState-${validSession.sessionId}`),
      ).toBeDefined();
    });

    it("persists the forked sessionId as currentSessionId for a manual save", () => {
      window.history.pushState({}, "", "/load-game");
      const navigation = new Navigation();
      vi.spyOn(navigation, "go").mockImplementation(() => {});
      const { engine } = makeEngine(navigation);
      seedHistory();
      seedCampaignStateForSession();

      engine.loadState(validSession);

      expect(mem._map.get("kampanykorut_currentSessionId")).toBe(
        FIXED_GENERATED_ID,
      );
      const forkedState = JSON.parse(
        mem._map.get(`kampanykorut_campaignState-${FIXED_GENERATED_ID}`)!,
      );
      expect(forkedState.turn).toBe(3);
    });

    it("loads an auto-save session directly without forking a new session id", () => {
      window.history.pushState({}, "", "/load-game");
      const navigation = new Navigation();
      const goSpy = vi.spyOn(navigation, "go").mockImplementation(() => {});
      const { engine } = makeEngine(navigation);
      seedHistory();
      seedCampaignStateForSession();
      const autoSession: SavedCampaignSessionInfo = {
        ...validSession,
        type: "auto",
      };

      engine.loadState(autoSession);

      expect(goSpy).toHaveBeenCalledWith(
        `/game/${autoSession.campaignId}?sessionId=${autoSession.sessionId}`,
      );
      expect(mem._map.get("kampanykorut_currentSessionId")).toBe(
        autoSession.sessionId,
      );
    });

    it("loading the same manual save twice always restores the original saved turn", () => {
      window.history.pushState({}, "", "/load-game");
      const navigation = new Navigation();
      vi.spyOn(navigation, "go").mockImplementation(() => {});
      const { engine } = makeEngine(navigation);
      seedHistory();
      seedCampaignStateForSession();

      engine.loadState(validSession);
      // simulate playing on after the first load, mutating only the fork
      engine.updateCampaignState({ turn: 50 });

      engine.loadState(validSession);

      const forkedState = JSON.parse(
        mem._map.get(`kampanykorut_campaignState-${FIXED_GENERATED_ID}`)!,
      );
      expect(forkedState.turn).toBe(3);
    });
  });

  describe("updateCampaignState", () => {
    it("persists the state to localStorage under the session key", () => {
      const { engine } = makeEngine();

      engine.updateCampaignState({
        activeCampaignId: "c-1",
        turn: 2,
        isEnded: false,
      });

      const stored = mem._map.get(
        `kampanykorut_campaignState-${FIXED_SESSION_ID}`,
      );
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.activeCampaignId).toBe("c-1");
      expect(parsed.turn).toBe(2);
    });

    it("merges partial state on top of existing state", () => {
      const { engine } = makeEngine();
      engine.updateCampaignState({
        activeCampaignId: "c-1",
        turn: 0,
        isEnded: false,
      });

      engine.updateCampaignState({ turn: 5 });

      const stored = JSON.parse(
        mem._map.get(`kampanykorut_campaignState-${FIXED_SESSION_ID}`)!,
      );
      expect(stored.activeCampaignId).toBe("c-1");
      expect(stored.turn).toBe(5);
    });

    it("clears localStorage and in-memory state when called with null", () => {
      const { engine } = makeEngine();
      engine.updateCampaignState({
        activeCampaignId: "c-1",
        turn: 0,
        isEnded: false,
      });

      engine.updateCampaignState(null);

      expect(
        mem._map.get(`kampanykorut_campaignState-${FIXED_SESSION_ID}`),
      ).toBeUndefined();
      expect(engine.getCampaignState()).toBeNull();
    });
  });
});
