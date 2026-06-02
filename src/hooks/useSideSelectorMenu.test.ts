import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { container } from "tsyringe";
import { useSideSelectorMenu } from "./useSideSelectorMenu";
import { ConfigEngine } from "../logic/application/ConfigEngine";
import { gameModeRegistry } from "../logic/application/gameModeRegistery";
import { ElectionConfig } from "@/shared/types";

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
const ELECTION_CONFIG: ElectionConfig =
  gameModeRegistry[GAME_ID].electionConfig;

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
    container.resolve(ConfigEngine).configure({} as any);
  });

  it("returns sides from election config", () => {
    const { result } = renderHook(() => useSideSelectorMenu(ELECTION_CONFIG));

    expect(result.current.sides).toHaveLength(2);
    expect(result.current.sides[0].id).toBe("ellenzeki_osszefogas");
    expect(result.current.sides[1].id).toBe("fidesz_kdnp");
  });

  it("has no selected party or candidate initially", () => {
    const { result } = renderHook(() => useSideSelectorMenu(ELECTION_CONFIG));

    expect(result.current.selectedParty).toBeUndefined();
    expect(result.current.selectedCandidate).toBeUndefined();
    expect(result.current.candidateOptions).toEqual([]);
  });

  it("handlePartyChange sets the selected party", () => {
    const { result } = renderHook(() => useSideSelectorMenu(ELECTION_CONFIG));

    act(() => {
      result.current.handlePartyChange("ellenzeki_osszefogas");
    });

    expect(result.current.selectedParty?.id).toBe("ellenzeki_osszefogas");
  });

  it("handlePartyChange populates candidateOptions from the selected party", () => {
    const { result } = renderHook(() => useSideSelectorMenu(ELECTION_CONFIG));

    act(() => {
      result.current.handlePartyChange("ellenzeki_osszefogas");
    });

    expect(result.current.candidateOptions).toEqual([
      { label: "Marki-Zay Péter", value: "marki_zay_peter" },
      { label: "Dobrev Klára", value: "dobrev_klara" },
      { label: "Karacsony Gergely", value: "karacsony_gergely" },
    ]);
  });

  it("handlePartyChange clears selectedCandidate when party changes", () => {
    const { result } = renderHook(() => useSideSelectorMenu(ELECTION_CONFIG));

    act(() => {
      result.current.handlePartyChange("ellenzeki_osszefogas");
      result.current.setSelectedCandidate("marki_zay_peter");
    });

    act(() => {
      result.current.handlePartyChange("fidesz_kdnp");
    });

    expect(result.current.selectedCandidate).toBeUndefined();
  });

  it("goBack calls transition with Back", () => {
    const { result } = renderHook(() => useSideSelectorMenu(ELECTION_CONFIG));

    act(() => {
      result.current.goBack();
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("startGame navigates to the game route", () => {
    const { result } = renderHook(() => useSideSelectorMenu(ELECTION_CONFIG));

    act(() => {
      result.current.startGame(GAME_ID);
    });

    const navigatedTo = mockNavigate.mock.calls[0][0] as string;
    expect(navigatedTo).toContain(`/game/${GAME_ID}`);
    expect(navigatedTo).toMatch(/sessionId=[\w-]+/);
  });
});
