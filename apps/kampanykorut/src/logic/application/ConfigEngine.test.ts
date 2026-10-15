import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StorageEngine } from "@/shared/logic/application/StorageEngine";
import { CampaignConfig } from "@/shared/types";
import { ConfigEngine } from "./ConfigEngine";
import { StateHandler } from "./StateHandler";

const baseConfig: CampaignConfig = {
  electionConfig: {
    listSeats: 50,
    thresholdPercent: 5,
    parties: [],
    playableSides: [],
    electionAssets: {},
  },
} as unknown as CampaignConfig;

const otherConfig: CampaignConfig = {
  electionConfig: {
    listSeats: 100,
    thresholdPercent: 10,
    parties: [],
    playableSides: [],
    electionAssets: {},
  },
} as unknown as CampaignConfig;

describe("GameConfigEngine", () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error global override
    global.localStorage = localStorageMock;
  });

  describe("getCurrentElectionConfig", () => {
    it("returns the in-memory config after configure()", () => {
      const engine = new ConfigEngine(
        new StorageEngine("kampanykorut"),
        new StateHandler(),
      );
      engine.configure(baseConfig);

      expect(engine.getCurrentElectionConfig()).toBe(baseConfig.electionConfig);
    });

    it("uses the singleton from container too", () => {
      const engine = container.resolve(ConfigEngine);
      engine.configure(baseConfig);
      expect(engine.getCurrentElectionConfig()).toBe(baseConfig.electionConfig);
    });

    it("returns undefined when no config is set and storage is empty", () => {
      const engine = new ConfigEngine(
        new StorageEngine("kampanykorut"),
        new StateHandler(),
      );
      localStorageMock.getItem.mockReturnValue(null);

      expect(engine.getCurrentElectionConfig()).toBeUndefined();
    });

    it("does not throw when localStorage state is null", () => {
      const engine = new ConfigEngine(
        new StorageEngine("kampanykorut"),
        new StateHandler(),
      );
      localStorageMock.getItem.mockReturnValue(null);

      expect(() => engine.getCurrentElectionConfig()).not.toThrow();
    });
  });

  describe("configure", () => {
    it("skips reconfiguration when already configured and forced is false", () => {
      const engine = new ConfigEngine(
        new StorageEngine("kampanykorut"),
        new StateHandler(),
      );
      engine.configure(baseConfig, "campaign-1");
      engine.configure(otherConfig, "campaign-2");

      expect(engine.getCurrentElectionConfig()).toBe(baseConfig.electionConfig);
    });

    it("reconfigures when forced is true", () => {
      const engine = new ConfigEngine(
        new StorageEngine("kampanykorut"),
        new StateHandler(),
      );
      engine.configure(baseConfig, "campaign-1");
      engine.configure(otherConfig, "campaign-2", true);

      expect(engine.getCurrentElectionConfig()).toBe(
        otherConfig.electionConfig,
      );
    });

    it("reconfigures while no id has been provided yet", () => {
      const engine = new ConfigEngine(
        new StorageEngine("kampanykorut"),
        new StateHandler(),
      );
      engine.configure(baseConfig);
      engine.configure(otherConfig);

      expect(engine.getCurrentElectionConfig()).toBe(
        otherConfig.electionConfig,
      );
    });
  });

  describe("localStorage usage", () => {
    function makeMemoryLocalStorage(entries: [string, string][]) {
      const map = new Map(entries);
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

    it("does not persist the campaign config", () => {
      const mem = makeMemoryLocalStorage([]);
      global.localStorage = mem;
      const engine = new ConfigEngine(
        new StorageEngine("kampanykorut"),
        new StateHandler(),
      );

      engine.configure(baseConfig, "2026_tavaszi_szel", true);

      expect(mem.setItem).not.toHaveBeenCalled();
      expect(engine.getCampaignConfig("2026_tavaszi_szel")).toBe(baseConfig);
    });

    it("removes legacy cached configs but keeps saved games and settings", () => {
      const preserved: [string, string][] = [
        ["kampanykorut_currentSessionId", "s1"],
        ["kampanykorut_campaignState-s1", '{"turn":3}'],
        ["kampanykorut_turnHistory-s1", "[]"],
        ["kampanykorut_savedSessions", "[]"],
        ["kampanykorut_autoSaveRegistry", "[]"],
        ["kampanykorut_settings", "{}"],
      ];
      const mem = makeMemoryLocalStorage([
        ["kampanykorut_campaignConfig-2026_tavaszi_szel", "x".repeat(1000)],
        ["kampanykorut_campaignConfig-2022_beke_vs_remeny", "x".repeat(1000)],
        ...preserved,
      ]);
      global.localStorage = mem;

      new ConfigEngine(new StorageEngine("kampanykorut"), new StateHandler());

      expect(Array.from(mem._map.entries())).toEqual(preserved);
      expect(mem.clear).not.toHaveBeenCalled();
    });

    it("does not throw when localStorage is not accessible", () => {
      global.localStorage = {
        get length(): number {
          throw new DOMException("denied", "SecurityError");
        },
      } as unknown as Storage;

      expect(
        () =>
          new ConfigEngine(
            new StorageEngine("kampanykorut"),
            new StateHandler(),
          ),
      ).not.toThrow();
    });
  });
});
