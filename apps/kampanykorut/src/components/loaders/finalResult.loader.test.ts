import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CampaignConfig } from "@/shared/types";
import { ConfigEngine } from "../../logic/application/ConfigEngine";
import { StateEngine } from "../../logic/application/StateEngine";
import { finalResultLoader } from "./finalResult.loader";

const { loadCampaignConfigMock } = vi.hoisted(() => ({
  loadCampaignConfigMock: vi.fn(),
}));

vi.mock("../../logic/application/loadCampaignConfig", () => ({
  loadCampaignConfig: loadCampaignConfigMock,
}));

const mockConfig = { electionConfig: {} } as CampaignConfig;

describe("finalResultLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadCampaignConfigMock.mockResolvedValue(mockConfig);
  });

  it("returns null when there is no saved state", async () => {
    const stateEngine = container.resolve(StateEngine);
    vi.spyOn(stateEngine, "getCampaignState").mockReturnValue(null);

    const result = await finalResultLoader({
      params: { id: "2022_ogyv_default" },
    } as never);

    expect(result).toBeNull();
    expect(loadCampaignConfigMock).not.toHaveBeenCalled();
  });

  it("loads the campaign config instead of reading it from localStorage", async () => {
    const stateEngine = container.resolve(StateEngine);
    vi.spyOn(stateEngine, "getCampaignState").mockReturnValue({
      activeCampaignId: "2022_ogyv_default",
      isEnded: true,
      results: { foo: "bar" },
    } as never);
    const configureSpy = vi.spyOn(container.resolve(ConfigEngine), "configure");

    const result = await finalResultLoader({
      params: { id: "2022_ogyv_default" },
    } as never);

    expect(loadCampaignConfigMock).toHaveBeenCalledWith("2022_ogyv_default");
    expect(configureSpy).toHaveBeenCalledWith(
      mockConfig,
      "2022_ogyv_default",
      true,
    );
    expect(result).toEqual({ results: { foo: "bar" }, config: mockConfig });
  });

  it("passes the mayoral result along with the results", async () => {
    const stateEngine = container.resolve(StateEngine);
    vi.spyOn(stateEngine, "getCampaignState").mockReturnValue({
      activeCampaignId: "0002_test_mayoral",
      isEnded: true,
      results: { mandates: [] },
      mayoralResult: { validVotes: 10 },
    } as never);

    const result = await finalResultLoader({
      params: { id: "0002_test_mayoral" },
    } as never);

    expect(result?.results).toEqual({
      mandates: [],
      mayoralResult: { validVotes: 10 },
    });
  });
});
