import { beforeEach, describe, expect, it, vi } from "vitest";
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
