import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CampaignConfig } from "@/shared/types";
import { ConfigEngine } from "../../logic/application/ConfigEngine";
import { StateEngine } from "../../logic/application/StateEngine";
import { mainGameScreenLoader } from "./mainGameScreen.loader";

const { loadCampaignConfigMock } = vi.hoisted(() => ({
  loadCampaignConfigMock: vi.fn(),
}));

vi.mock("../../logic/application/loadCampaignConfig", () => ({
  loadCampaignConfig: loadCampaignConfigMock,
}));

const mockConfig = {} as CampaignConfig;

describe("mainGameScreenLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadCampaignConfigMock.mockResolvedValue(mockConfig);
  });

  it("returns null and skips config loading when there is no saved state", async () => {
    const stateEngine = container.resolve(StateEngine);
    vi.spyOn(stateEngine, "getCampaignState").mockReturnValue(null);
    const configEngine = container.resolve(ConfigEngine);
    const configureSpy = vi.spyOn(configEngine, "configure");

    const result = await mainGameScreenLoader({
      params: { id: "2022_ogyv_default" },
    } as never);

    expect(result).toBeNull();
    expect(loadCampaignConfigMock).not.toHaveBeenCalled();
    expect(configureSpy).not.toHaveBeenCalled();
  });

  it("loads and force-configures the campaign for the route param", async () => {
    const stateEngine = container.resolve(StateEngine);
    vi.spyOn(stateEngine, "getCampaignState").mockReturnValue({
      activeCampaignId: "2022_ogyv_default",
      turn: 1,
      isEnded: false,
    } as never);
    vi.spyOn(stateEngine, "getSessionId").mockReturnValue("session-abc");
    const configEngine = container.resolve(ConfigEngine);
    const configureSpy = vi.spyOn(configEngine, "configure");

    const result = await mainGameScreenLoader({
      params: { id: "2022_ogyv_default" },
    } as never);

    expect(loadCampaignConfigMock).toHaveBeenCalledWith("2022_ogyv_default");
    expect(configureSpy).toHaveBeenCalledWith(
      mockConfig,
      "2022_ogyv_default",
      true,
    );
    expect(result).toBeNull();
  });
});
