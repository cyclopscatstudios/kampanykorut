import { describe, it, expect, beforeEach, vi } from "vitest";
import { StorageEngine } from "./StorageEngine";

describe("StorageEngine", () => {
  let engine: StorageEngine;

  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  };

  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
  };

  beforeEach(() => {
    engine = new StorageEngine();

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

  describe("clear", () => {
    it("should clear localStorage", () => {
      engine.clearAll();

      expect(localStorageMock.clear).toHaveBeenCalled();
    });
  });
});
