import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfigEngine } from "./ConfigEngine";
import { fetchCampaignFile } from "./fetchJSON";
import { getCampaignHeaderById } from "./getCampaignHeaderById";
import { loadCampaignConfig } from "./loadCampaignConfig";
import { clearCampaignConfigCache } from "./loadCampaignConfig.utils";

vi.mock("./getCampaignHeaderById", () => ({
  getCampaignHeaderById: vi.fn(),
}));

vi.mock("./fetchJSON", () => ({
  fetchCampaignFile: vi.fn(),
}));

describe("loadCampaignConfig", () => {
  const getDistrictMapByType = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    clearCampaignConfigCache();

    vi.spyOn(container, "resolve").mockReturnValue({
      getDistrictMapByType,
    } as unknown as ConfigEngine);

    vi.mocked(getCampaignHeaderById).mockResolvedValue({
      id: "campaign-1",
      route: "/campaigns/campaign-1",
      label: "Campaign 1",
      description: "Mock description for Campaign 1.",
      campaignBanner: "/images/mock/campaign-1-banner.png",
    });
  });

  it("loads common campaign files and builds the campaign config", async () => {
    const manifest = {
      files: {
        electionConfig: "election.json",
        voterEnvironmentConfig: "voters.json",
        candidateListData: "candidate-list.json",
        partyListData: "party-list.json",
        customGroups: "groups.json",
      },
    };

    const electionConfig = {
      districtMap: "2024",
    };

    const voterEnvironmentConfig = {
      foo: "bar",
    };

    const candidateListData = {
      candidates: [],
    };

    const partyListData = {
      parties: [],
    };

    const customGroups = {
      groups: [],
    };

    const districts = {
      "01": {},
    };

    vi.mocked(fetchCampaignFile).mockImplementation(async (_route, file) => {
      switch (file) {
        case "manifest.json":
          return manifest;
        case "election.json":
          return electionConfig;
        case "voters.json":
          return voterEnvironmentConfig;
        case "candidate-list.json":
          return candidateListData;
        case "party-list.json":
          return partyListData;
        case "groups.json":
          return customGroups;
        default:
          throw new Error(`Unexpected file: ${file}`);
      }
    });

    getDistrictMapByType.mockResolvedValue(districts);

    const result = await loadCampaignConfig("campaign-1");

    expect(result).toEqual({
      electionConfig,
      voterEnvironmentConfig: {
        ...voterEnvironmentConfig,
        listData: candidateListData,
      },
      candidateListData,
      partyListData,
      customGroups,
      districts,
      playableSides: undefined,
    });

    expect(getDistrictMapByType).toHaveBeenCalledWith("2024");
  });
  it("loads playable sides and their candidates", async () => {
    const manifest = {
      files: {
        electionConfig: "election.json",
        voterEnvironmentConfig: "voters.json",
        candidateListData: "candidate-list.json",

        playableSides: {
          fidesz: {
            orban_viktor: {
              questions: "orban/questions.json",
              answerEffect: "orban/effects.json",
              campaignStrategies: "orban/strategies.json",
              advisorFeedback: "orban/advisor-feedback.json",
              advisorFeedbackAssets: "orban/advisor-assets.json",
              endResults: "orban/end-results.json",
            },
          },
        },
      },
    };

    const questions = [{ id: "q1" }];
    const answerEffect = [{ id: "a1" }];
    const campaignStrategies = [{ id: "strategy-1" }];
    const advisorFeedback = [{ id: "feedback-1" }];
    const advisorFeedbackAssets = { foo: "bar" };
    const endResults = [{ id: "victory" }];

    vi.mocked(fetchCampaignFile).mockImplementation(async (_route, file) => {
      switch (file) {
        case "manifest.json":
          return manifest;

        case "election.json":
          return {
            districtMap: "2024",
          };

        case "voters.json":
          return {};

        case "candidate-list.json":
          return {};

        case "orban/questions.json":
          return questions;

        case "orban/effects.json":
          return answerEffect;

        case "orban/strategies.json":
          return campaignStrategies;

        case "orban/advisor-feedback.json":
          return advisorFeedback;

        case "orban/advisor-assets.json":
          return advisorFeedbackAssets;

        case "orban/end-results.json":
          return endResults;

        default:
          throw new Error(`Unexpected file: ${file}`);
      }
    });

    getDistrictMapByType.mockResolvedValue({});

    const result = await loadCampaignConfig("campaign-1");

    expect(result.playableSides).toEqual({
      fidesz: {
        orban_viktor: {
          questions,
          answerEffect,
          campaignStrategies,
          advisorFeedback,
          advisorFeedbackAssets,
          endResults,
        },
      },
    });
  });
  it("uses defaults for missing optional candidate files", async () => {
    const manifest = {
      files: {
        electionConfig: "election.json",
        voterEnvironmentConfig: "voters.json",
        candidateListData: "candidate-list.json",

        playableSides: {
          fidesz: {
            orban_viktor: {},
          },
        },
      },
    };

    vi.mocked(fetchCampaignFile).mockImplementation(async (_route, file) => {
      switch (file) {
        case "manifest.json":
          return manifest;
        case "election.json":
          return { districtMap: "2024" };
        case "voters.json":
          return {};
        case "candidate-list.json":
          return {};
        default:
          throw new Error(`Unexpected file: ${file}`);
      }
    });

    getDistrictMapByType.mockResolvedValue({});

    const result = await loadCampaignConfig("campaign-1");

    expect(result.playableSides).toEqual({
      fidesz: {
        orban_viktor: {
          questions: [],
          answerEffect: [],
          campaignStrategies: undefined,
          advisorFeedback: undefined,
          advisorFeedbackAssets: undefined,
          endResults: undefined,
        },
      },
    });
  });
  it("returns the cached promise for the same campaign", async () => {
    const manifest = {
      files: {
        electionConfig: "election.json",
        voterEnvironmentConfig: "voters.json",
        candidateListData: "candidate-list.json",
      },
    };

    vi.mocked(fetchCampaignFile).mockImplementation(async (_route, file) => {
      switch (file) {
        case "manifest.json":
          return manifest;
        case "election.json":
          return { districtMap: "2024" };
        case "voters.json":
        case "candidate-list.json":
          return {};
        default:
          throw new Error(`Unexpected file: ${file}`);
      }
    });

    getDistrictMapByType.mockResolvedValue({});

    const promise1 = loadCampaignConfig("campaign-1");
    const promise2 = loadCampaignConfig("campaign-1");

    expect(promise1).toBe(promise2);

    await Promise.all([promise1, promise2]);

    expect(getCampaignHeaderById).toHaveBeenCalledTimes(1);
  });
});
