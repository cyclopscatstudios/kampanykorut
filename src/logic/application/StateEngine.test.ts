import { describe, it, expect, beforeEach, vi } from "vitest";
import { StateEngine } from "./StateEngine";
import type { StorageEngine } from "./StorageEngine";

vi.mock("uuid", () => ({
  v4: vi.fn(() => "test-session-id"),
}));

describe("StateEngine", () => {
  let storageMock: StorageEngine;
  let engine: StateEngine;

  beforeEach(() => {
    storageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    } as unknown as StorageEngine;

    engine = new StateEngine(storageMock, () => "test-session-id");

    vi.clearAllMocks();
  });

  it("should save game state to localStorage", () => {
    const state = { turn: 1 };

    engine.saveSession(state, "gameSession");

    expect(storageMock.setItem).toHaveBeenCalledWith(
      "gameSession-test-session-id",
      JSON.stringify(state),
      "localStorage",
    );
  });

  it("should log error if stringify fails", () => {
    const circular: any = {};
    circular.self = circular;

    const result = engine.saveSession(circular, "gameSession");

    expect(result).toBeNull();
  });

  it("should save gameSession correctly", () => {
    engine.saveSession({ foo: "bar" }, "gameSession");

    expect(storageMock.setItem).toHaveBeenCalledWith(
      "gameSession-test-session-id",
      JSON.stringify({ foo: "bar" }),
      "localStorage",
    );
  });

  it("should save menuSession correctly", () => {
    engine.saveSession({ open: true }, "menuSession");

    expect(storageMock.setItem).toHaveBeenCalledWith(
      "menuSession",
      JSON.stringify({ open: true }),
      "localStorage",
    );
  });

  it("should load and parse game session", () => {
    const stored = JSON.stringify({ turn: 2 });
    storageMock.getItem = vi.fn().mockReturnValue(stored);

    const result = engine.loadSession("gameSession");

    expect(result).toEqual({ turn: 2 });
  });

  it("should return null if no game session found", () => {
    storageMock.getItem = vi.fn().mockReturnValue(null);

    const result = engine.loadSession("gameSession");

    expect(result).toBeNull();
  });
});
