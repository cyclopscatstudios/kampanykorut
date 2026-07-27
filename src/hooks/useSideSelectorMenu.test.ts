import { act, renderHook } from "@testing-library/react";
import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CampaignConfig } from "@/shared/types";
import { ConfigEngine } from "../logic/application/ConfigEngine";
import { useSideSelectorMenu } from "./useSideSelectorMenu";

const mockConfig: CampaignConfig = {
  electionConfig: {
    title: "Mock Election",
    year: "2022",
    listSeats: 10,
    allSeats: 20,
    thresholdPercent: 5,
    parties: [],
    playableSides: [
      {
        id: "ellenzeki_osszefogas",
        label: "Ellenzéki Összefogás",
        mainCandidates: [
          { id: "marki_zay_peter", label: "Márki-Zay Péter" },
          { id: "dobrev_klara", label: "Dobrev Klára" },
          { id: "karacsony_gergely", label: "Karacsony Gergely" },
        ],
      },
      {
        id: "fidesz_kdnp",
        label: "Fidesz-KDNP",
        mainCandidates: [],
      },
    ],
    electionAssets: [],
    partyListVotes: {},
  },
  voterEnvironmentConfig: {
    eligibleVoters: 1000,
    maxTurnout: 0.7,
    listData: [],
  },
  candidateListData: [],
  districts: [],
  questions: [],
  answerEffect: [],
  endResults: {
    playerSideVictory: {
      imageUri: "",
      title: "",
      subtitle: "",
      description: "",
    },
    playerSideDefeat: {
      imageUri: "",
      title: "",
      subtitle: "",
      description: "",
    },
  },
};

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("./navigationHook", () => ({
  useNavigation: () => ({
    goBack: () => mockNavigate(-1),
    goToCampaign: (id: string, sessionId: string) =>
      mockNavigate(`/game/${id}?sessionId=${sessionId}`),
    goToSideSelector: vi.fn(),
    goToMainMenu: vi.fn(),
    goToCampaignSelector: vi.fn(),
    goToFinalResults: vi.fn(),
    reloadPage: vi.fn(),
  }),
}));

const GAME_ID = "2022_ogyv_default";

describe("useSideSelectorMenu", () => {
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
    container.resolve(ConfigEngine).configure(mockConfig, GAME_ID, true);
  });

  it("returns sides from election config", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID));

    expect(result.current.playableSides).toHaveLength(2);
    expect(result.current.playableSides[0].value).toBe("ellenzeki_osszefogas");
    expect(result.current.playableSides[1].value).toBe("fidesz_kdnp");
  });

  it("has no selected party or candidate initially", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID));

    expect(result.current.selectedParty).toBeUndefined();
    expect(result.current.selectedCandidate).toBeUndefined();
    expect(result.current.candidateOptions).toEqual([]);
  });

  it("handlePartyChange sets the selected party", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID));

    act(() => {
      result.current.handlePartyChange("ellenzeki_osszefogas");
    });

    expect(result.current.selectedParty?.id).toBe("ellenzeki_osszefogas");
  });

  it("handlePartyChange populates candidateOptions from the selected party", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID));

    act(() => {
      result.current.handlePartyChange("ellenzeki_osszefogas");
    });

    expect(result.current.candidateOptions).toEqual([
      { label: "Márki-Zay Péter", value: "marki_zay_peter" },
      { label: "Dobrev Klára", value: "dobrev_klara" },
      { label: "Karacsony Gergely", value: "karacsony_gergely" },
    ]);
  });

  it("handlePartyChange clears selectedCandidate when party changes", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID));

    act(() => {
      result.current.handlePartyChange("ellenzeki_osszefogas");
      result.current.setSelectedCandidate({
        id: "marki_zay_peter",
        label: "Márki-Zay Péter",
      });
    });

    act(() => {
      result.current.handlePartyChange("fidesz_kdnp");
    });

    expect(result.current.selectedCandidate).toBeUndefined();
  });

  it("goBack calls transition with Back", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID));

    act(() => {
      result.current.goBack();
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("startGame navigates to the game route", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID));

    act(() => {
      result.current.startGame(GAME_ID);
    });

    const navigatedTo = mockNavigate.mock.calls[0][0] as string;
    expect(navigatedTo).toContain(`/game/${GAME_ID}`);
    expect(navigatedTo).toMatch(/sessionId=[\w-]+/);
  });
});
