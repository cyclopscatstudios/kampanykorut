import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfigEngine } from "./ConfigEngine";
import { StorageEngine } from "./StorageEngine";
import { CampaignConfig } from "@/shared/types";

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
      const engine = new ConfigEngine(new StorageEngine());
      engine.configure(baseConfig);

      expect(engine.getCurrentElectionConfig()).toBe(baseConfig.electionConfig);
    });

    it("uses the singleton from container too", () => {
      const engine = container.resolve(ConfigEngine);
      engine.configure(baseConfig);
      expect(engine.getCurrentElectionConfig()).toBe(baseConfig.electionConfig);
    });

    it("returns undefined when no config is set and storage is empty", () => {
      const engine = new ConfigEngine(new StorageEngine());
      localStorageMock.getItem.mockReturnValue(null);

      expect(engine.getCurrentElectionConfig()).toBeUndefined();
    });

    it("does not throw when localStorage state is null", () => {
      const engine = new ConfigEngine(new StorageEngine());
      localStorageMock.getItem.mockReturnValue(null);

      expect(() => engine.getCurrentElectionConfig()).not.toThrow();
    });
  });

  describe("configure", () => {
    it("skips reconfiguration when already configured and forced is false", () => {
      const engine = new ConfigEngine(new StorageEngine());
      engine.configure(baseConfig, "campaign-1");
      engine.configure(otherConfig, "campaign-2");

      expect(engine.getCurrentElectionConfig()).toBe(baseConfig.electionConfig);
    });

    it("reconfigures when forced is true", () => {
      const engine = new ConfigEngine(new StorageEngine());
      engine.configure(baseConfig, "campaign-1");
      engine.configure(otherConfig, "campaign-2", true);

      expect(engine.getCurrentElectionConfig()).toBe(
        otherConfig.electionConfig,
      );
    });

    it("reconfigures while no id has been provided yet", () => {
      const engine = new ConfigEngine(new StorageEngine());
      engine.configure(baseConfig);
      engine.configure(otherConfig);

      expect(engine.getCurrentElectionConfig()).toBe(
        otherConfig.electionConfig,
      );
    });
  });
});
