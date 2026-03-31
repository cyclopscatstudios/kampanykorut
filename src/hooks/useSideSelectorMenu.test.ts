import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useSideSelectorMenu } from "./useSideSelectorMenu";
import { MenuItemId } from "../components/ui/menu/menu.types";

const { mockTransition } = vi.hoisted(() => ({
  mockTransition: vi.fn(),
}));

vi.mock("../logic/application/hooks/useAppStateMachine", () => ({
  useAppStateMachine: () => ({
    state: { screenType: "menuScreen", menuType: "sideSelectorMenu" },
    transition: mockTransition,
  }),
}));

const GAME_ID = "2022_ogyv_default";

describe("useSideSelectorMenu", () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error global override
    global.localStorage = localStorageMock;
  });

  it("returns sides from election config", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID, vi.fn()));

    expect(result.current.sides).toHaveLength(2);
    expect(result.current.sides[0].id).toBe("ellenzeki_osszefogas");
    expect(result.current.sides[1].id).toBe("fidesz_kdnp");
  });

  it("has no selected party or candidate initially", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID, vi.fn()));

    expect(result.current.selectedParty).toBeUndefined();
    expect(result.current.selectedCandidate).toBeUndefined();
    expect(result.current.candidateOptions).toEqual([]);
  });

  it("handlePartyChange sets the selected party", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID, vi.fn()));

    act(() => {
      result.current.handlePartyChange("ellenzeki_osszefogas");
    });

    expect(result.current.selectedParty?.id).toBe("ellenzeki_osszefogas");
  });

  it("handlePartyChange populates candidateOptions from the selected party", () => {
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID, vi.fn()));

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
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID, vi.fn()));

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
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID, vi.fn()));

    act(() => {
      result.current.goBack();
    });

    expect(mockTransition).toHaveBeenCalledWith({
      id: MenuItemId.Back,
      text: "Back",
    });
  });

  it("does not register an engine when gameId becomes undefined after being set", () => {
    const { rerender } = renderHook(
      ({ gameId }: { gameId: string | undefined }) =>
        useSideSelectorMenu(gameId, vi.fn()),
      { initialProps: { gameId: GAME_ID } },
    );

    const setItemCallCount = localStorageMock.setItem.mock.calls.length;

    rerender({ gameId: undefined });

    // No new GameConfigEngine should have been constructed
    expect(localStorageMock.setItem.mock.calls.length).toBe(setItemCallCount);
  });

  it("startGame calls onClick with the gameLoader item", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useSideSelectorMenu(GAME_ID, onClick));

    act(() => {
      result.current.startGame();
    });

    expect(onClick).toHaveBeenCalledWith({
      gameId: GAME_ID,
      onTransition: "gameLoader",
      id: MenuItemId.GameLoader,
      text: "2022 OGYV",
    });
  });
});
