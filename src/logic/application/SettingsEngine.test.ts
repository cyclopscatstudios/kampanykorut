import { vi } from "vitest";
import { SettingsEngine, GameSettings } from "./SettingsEngine";
import { StorageEngine } from "./StorageEngine";

const makeStorageMock = (storedValue: string | null = null) => ({
  getItem: vi.fn().mockReturnValue(storedValue),
  setItem: vi.fn(),
  clearItem: vi.fn(),
  clearAll: vi.fn(),
  getPrefixedKey: vi.fn((k: string) => `kampanykorut_${k}`),
  getKeyWithoutPrefix: vi.fn(),
});

describe("SettingsEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "trace").mockImplementation(() => {});
  });

  describe("initialization", () => {
    it("uses default settings when storage is empty", () => {
      const storage = makeStorageMock(null);
      const engine = new SettingsEngine(storage as unknown as StorageEngine);

      const settings = engine.getGameSettings();
      expect(settings.showAdvisorFeedback).toBe(true);
      expect(settings.language).toBe("en");
    });

    it("loads stored settings on init", () => {
      const stored = JSON.stringify({ showAdvisorFeedback: false, language: "hu" });
      const storage = makeStorageMock(stored);
      const engine = new SettingsEngine(storage as unknown as StorageEngine);

      const settings = engine.getGameSettings();
      expect(settings.showAdvisorFeedback).toBe(false);
      expect(settings.language).toBe("hu");
    });

    it("re-saves the stored language to storage during initialization", () => {
      const stored = JSON.stringify({ showAdvisorFeedback: true, language: "hu" });
      const storage = makeStorageMock(stored);
      new SettingsEngine(storage as unknown as StorageEngine);

      const savedJson = (storage.setItem.mock.calls[0] as [string, string, string])[1];
      const saved = JSON.parse(savedJson) as GameSettings;
      expect(saved.language).toBe("hu");
    });
  });

  describe("getGameSettings", () => {
    it("returns defaults when storage returns null", () => {
      const storage = makeStorageMock(null);
      const engine = new SettingsEngine(storage as unknown as StorageEngine);

      const settings = engine.getGameSettings();
      expect(settings.showAdvisorFeedback).toBe(true);
      expect(settings.language).toBe("en");
    });

    it("returns parsed settings when storage has a value", () => {
      const stored = JSON.stringify({ showAdvisorFeedback: false, language: "hu" });
      const storage = makeStorageMock(stored);
      const engine = new SettingsEngine(storage as unknown as StorageEngine);

      expect(engine.getGameSettings().showAdvisorFeedback).toBe(false);
      expect(engine.getGameSettings().language).toBe("hu");
    });
  });

  describe("updateGameSettings", () => {
    it("saves merged settings to storage", () => {
      const storage = makeStorageMock(null);
      const engine = new SettingsEngine(storage as unknown as StorageEngine);
      vi.clearAllMocks();

      engine.updateGameSettings({ showAdvisorFeedback: false });

      expect(storage.setItem).toHaveBeenCalledWith(
        "settings",
        expect.stringContaining('"showAdvisorFeedback":false'),
        "localStorage",
      );
    });

    it("merges partial updates with existing settings", () => {
      const initial = JSON.stringify({ showAdvisorFeedback: false, language: "hu" });
      const storage = makeStorageMock(initial);
      const engine = new SettingsEngine(storage as unknown as StorageEngine);
      vi.clearAllMocks();

      engine.updateGameSettings({ showAdvisorFeedback: true });

      const savedJson = (storage.setItem.mock.calls[0] as [string, string, string])[1];
      const saved = JSON.parse(savedJson) as GameSettings;
      expect(saved.showAdvisorFeedback).toBe(true);
      expect(saved.language).toBe("hu");
    });

    it("persists the new language to storage when language is updated", () => {
      const storage = makeStorageMock(null);
      const engine = new SettingsEngine(storage as unknown as StorageEngine);
      vi.clearAllMocks();

      engine.updateGameSettings({ language: "hu" });

      const savedJson = (storage.setItem.mock.calls[0] as [string, string, string])[1];
      const saved = JSON.parse(savedJson) as GameSettings;
      expect(saved.language).toBe("hu");
    });

    it("preserves the existing language when only other settings are updated", () => {
      const initial = JSON.stringify({ showAdvisorFeedback: true, language: "hu" });
      const storage = makeStorageMock(initial);
      const engine = new SettingsEngine(storage as unknown as StorageEngine);
      vi.clearAllMocks();

      engine.updateGameSettings({ showAdvisorFeedback: false });

      const savedJson = (storage.setItem.mock.calls[0] as [string, string, string])[1];
      const saved = JSON.parse(savedJson) as GameSettings;
      expect(saved.language).toBe("hu");
    });

    it("notifies subscribers with the full updated settings", () => {
      const storage = makeStorageMock(null);
      const engine = new SettingsEngine(storage as unknown as StorageEngine);
      const received: GameSettings[] = [];
      engine.subscribe((s) => received.push(s));

      engine.updateGameSettings({ showAdvisorFeedback: false });

      expect(received).toHaveLength(1);
      expect(received[0].showAdvisorFeedback).toBe(false);
    });

    it("subscribers receive the complete merged object, not just the partial", () => {
      const initial = JSON.stringify({ showAdvisorFeedback: false, language: "hu" });
      const storage = makeStorageMock(initial);
      const engine = new SettingsEngine(storage as unknown as StorageEngine);
      const received: GameSettings[] = [];
      engine.subscribe((s) => received.push(s));

      engine.updateGameSettings({ showAdvisorFeedback: true });

      expect(received[0].language).toBe("hu");
      expect(received[0].showAdvisorFeedback).toBe(true);
    });
  });
});
