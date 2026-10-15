import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StorageEngine } from "./StorageEngine";

describe("StorageEngine", () => {
  let engine: StorageEngine;

  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    engine = new StorageEngine("kampanykorut");

    vi.clearAllMocks();

    // @ts-expect-error global override
    global.localStorage = localStorageMock;
    // @ts-expect-error global override
    global.sessionStorage = sessionStorageMock;
  });

  describe("getItem", () => {
    it("should get item from localStorage with prefix", () => {
      localStorageMock.getItem.mockReturnValue("value");

      const result = engine.getItem("electionConfig", "localStorage");

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "kampanykorut_electionConfig",
      );
      expect(result).toBe("value");
    });

    it("should get item from sessionStorage with prefix", () => {
      sessionStorageMock.getItem.mockReturnValue("sessionValue");

      const result = engine.getItem("menuSession", "sessionStorage");

      expect(sessionStorageMock.getItem).toHaveBeenCalledWith(
        "kampanykorut_menuSession",
      );
      expect(result).toBe("sessionValue");
    });

    it("should default to localStorage when no storage type is given", () => {
      localStorageMock.getItem.mockReturnValue("value");

      const result = engine.getItem("electionConfig");

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "kampanykorut_electionConfig",
      );
      expect(result).toBe("value");
    });

    it("should append the suffix when provided", () => {
      engine.getItem("draft", "localStorage", "draft-1");

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "kampanykorut_draft-draft-1",
      );
    });
  });

  describe("setItem", () => {
    it("should set item in localStorage with prefix", () => {
      engine.setItem("electionSession", "data", "localStorage");

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "kampanykorut_electionSession",
        "data",
      );
    });

    it("should set item in sessionStorage with prefix", () => {
      engine.setItem("menuSession", "settings", "sessionStorage");

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "kampanykorut_menuSession",
        "settings",
      );
    });
  });

  describe("setItem when the storage is full", () => {
    const quotaError = () =>
      new DOMException("exceeded the quota", "QuotaExceededError");

    afterEach(() => {
      localStorageMock.setItem.mockReset();
      localStorageMock.getItem.mockReset();
    });

    it("does not throw and returns false on QuotaExceededError", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw quotaError();
      });

      let result: boolean | undefined;
      expect(() => {
        result = engine.setItem("campaignState", "{}", "localStorage", "s1");
      }).not.toThrow();
      expect(result).toBe(false);
    });

    it("returns true when the write succeeds", () => {
      expect(engine.setItem("campaignState", "{}", "localStorage", "s1")).toBe(
        true,
      );
    });

    it("notifies write error listeners with the reason and key", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw quotaError();
      });
      const listener = vi.fn();
      engine.onWriteError(listener);

      engine.setItem("campaignState", "{}", "localStorage", "s1");

      expect(listener).toHaveBeenCalledWith(
        "quota",
        "kampanykorut_campaignState-s1",
        expect.any(DOMException),
      );
    });

    it("reports non-quota errors as unknown", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new DOMException("denied", "SecurityError");
      });
      const listener = vi.fn();
      engine.onWriteError(listener);

      engine.setItem("settings", "{}", "localStorage");

      expect(listener).toHaveBeenCalledWith(
        "unknown",
        "kampanykorut_settings",
        expect.any(DOMException),
      );
    });

    it("stops notifying after unsubscribe", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw quotaError();
      });
      const listener = vi.fn();
      const unsubscribe = engine.onWriteError(listener);
      unsubscribe();

      engine.setItem("campaignState", "{}", "localStorage", "s1");

      expect(listener).not.toHaveBeenCalled();
    });

    it("keeps the unsaved value readable in memory until it is persisted", () => {
      localStorageMock.getItem.mockReturnValue("persisted");
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw quotaError();
      });

      engine.setItem("campaignState", "unsaved", "localStorage", "s1");
      expect(engine.getItem("campaignState", "localStorage", "s1")).toBe(
        "unsaved",
      );

      engine.setItem("campaignState", "saved", "localStorage", "s1");
      expect(engine.getItem("campaignState", "localStorage", "s1")).toBe(
        "persisted",
      );
    });

    it("drops the unsaved value on clearItem", () => {
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw quotaError();
      });

      engine.setItem("campaignState", "unsaved", "localStorage", "s1");
      engine.clearItem("campaignState", "localStorage", "s1");

      expect(engine.getItem("campaignState", "localStorage", "s1")).toBeNull();
    });
  });

  describe("clearItemsWithPrefix", () => {
    it("removes only the keys starting with the prefixed key", () => {
      const map = new Map<string, string>([
        ["kampanykorut_campaignConfig-2026_tavaszi_szel", "big"],
        ["kampanykorut_campaignConfig-2022_beke_vs_remeny", "big"],
        ["kampanykorut_campaignState-s1", "state"],
        ["kampanykorut_savedSessions", "[]"],
        ["other_campaignConfig-x", "foreign"],
      ]);
      // @ts-expect-error global override
      global.localStorage = {
        key: (i: number) => Array.from(map.keys())[i] ?? null,
        get length() {
          return map.size;
        },
        removeItem: (key: string) => map.delete(key),
      };

      const removed = engine.clearItemsWithPrefix("campaignConfig");

      expect(removed).toEqual([
        "kampanykorut_campaignConfig-2026_tavaszi_szel",
        "kampanykorut_campaignConfig-2022_beke_vs_remeny",
      ]);
      expect(Array.from(map.keys())).toEqual([
        "kampanykorut_campaignState-s1",
        "kampanykorut_savedSessions",
        "other_campaignConfig-x",
      ]);
    });
  });

  describe("clearItem", () => {
    it("should remove item from localStorage with prefix", () => {
      engine.clearItem("electionConfig", "localStorage");

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "kampanykorut_electionConfig",
      );
    });

    it("should remove item from sessionStorage with prefix", () => {
      engine.clearItem("menuSession", "sessionStorage");

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
        "kampanykorut_menuSession",
      );
    });
  });

  describe("clearAll", () => {
    it("should clear localStorage", () => {
      engine.clearAll();

      expect(localStorageMock.clear).toHaveBeenCalled();
    });
  });

  describe("prefix helpers", () => {
    it("should prefix and strip keys using the configured prefix", () => {
      const prefixed = engine.getPrefixedKey("electionConfig");

      expect(prefixed).toBe("kampanykorut_electionConfig");
      expect(engine.getKeyWithoutPrefix(prefixed)).toBe("electionConfig");
    });

    it("should use a different prefix for a different instance", () => {
      const other = new StorageEngine("campaign_maker");

      expect(other.getPrefixedKey("draft")).toBe("campaign_maker_draft");
    });
  });
});
