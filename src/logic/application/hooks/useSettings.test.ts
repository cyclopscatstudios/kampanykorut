import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useSettings } from "./useSettings";
import { container } from "tsyringe";
import { SettingsEngine, type GameSettings } from "../SettingsEngine";

const DEFAULT_SETTINGS: GameSettings = { showAdvisorFeedback: true, language: "en" };

describe("useSettings", () => {
  let settingsEngine: SettingsEngine;
  let capturedSubscriber: ((s: GameSettings) => void) | null;
  let unsubscribeSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    settingsEngine = container.resolve(SettingsEngine);
    capturedSubscriber = null;
    unsubscribeSpy = vi.fn();

    vi.spyOn(settingsEngine, "getGameSettings").mockReturnValue(DEFAULT_SETTINGS);
    vi.spyOn(settingsEngine, "updateGameSettings").mockImplementation(() => {});
    vi.spyOn(settingsEngine, "subscribe").mockImplementation((fn) => {
      capturedSubscriber = fn;
      return unsubscribeSpy;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes settings from settingsEngine.getGameSettings()", () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("subscribes to settingsEngine on mount", () => {
    renderHook(() => useSettings());
    expect(settingsEngine.subscribe).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes when the component unmounts", () => {
    const { unmount } = renderHook(() => useSettings());
    unmount();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });

  it("updateSettings delegates to settingsEngine.updateGameSettings", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateSettings({ showAdvisorFeedback: false });
    });

    expect(settingsEngine.updateGameSettings).toHaveBeenCalledWith({
      showAdvisorFeedback: false,
    });
  });

  it("settings update reactively when the subscriber fires", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      capturedSubscriber?.({ showAdvisorFeedback: false, language: "hu" });
    });

    expect(result.current.settings.showAdvisorFeedback).toBe(false);
    expect(result.current.settings.language).toBe("hu");
  });

  it("re-renders with the latest settings on subsequent subscriber calls", () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      capturedSubscriber?.({ showAdvisorFeedback: false, language: "en" });
    });
    act(() => {
      capturedSubscriber?.({ showAdvisorFeedback: true, language: "hu" });
    });

    expect(result.current.settings.showAdvisorFeedback).toBe(true);
    expect(result.current.settings.language).toBe("hu");
  });
});
