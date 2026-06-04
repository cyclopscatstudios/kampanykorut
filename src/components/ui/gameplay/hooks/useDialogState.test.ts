import { act, renderHook } from "@testing-library/react";
import { useDialogState } from "./useDialogState";

describe("useDialogState", () => {
  it("starts with no active dialog", () => {
    const { result } = renderHook(() => useDialogState());

    expect(result.current.activeDialog).toBeNull();
  });

  it("open sets the active dialog", () => {
    const { result } = renderHook(() => useDialogState());

    act(() => {
      result.current.open("settings");
    });

    expect(result.current.activeDialog).toBe("settings");
  });

  it("close resets active dialog to null", () => {
    const { result } = renderHook(() => useDialogState());

    act(() => {
      result.current.open("gameMenu");
    });
    act(() => {
      result.current.close();
    });

    expect(result.current.activeDialog).toBeNull();
  });

  it("opening a second dialog replaces the first", () => {
    const { result } = renderHook(() => useDialogState());

    act(() => {
      result.current.open("settings");
    });
    act(() => {
      result.current.open("savedGames");
    });

    expect(result.current.activeDialog).toBe("savedGames");
  });

  it("supports all dialog ids", () => {
    const ids = [
      "settings",
      "gameMenu",
      "exit",
      "savedGames",
      "saveGame",
    ] as const;
    const { result } = renderHook(() => useDialogState());

    for (const id of ids) {
      act(() => {
        result.current.open(id);
      });
      expect(result.current.activeDialog).toBe(id);
    }
  });
});
