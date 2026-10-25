import posthog, { type CaptureResult } from "posthog-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StorageEngine } from "@/shared/logic/application/StorageEngine";
import type { GameSettings } from "@/shared/types";
import type { SettingsEngine } from "../../application/SettingsEngine";
import {
  initAnalytics,
  redactEventUrls,
  syncAnalyticsConsent,
} from "./posthog";

vi.mock("posthog-js", () => ({
  default: {
    __loaded: false,
    init: vi.fn(),
    register: vi.fn(),
    has_opted_out_capturing: vi.fn(() => false),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
  },
}));

const mockedPosthog = posthog as unknown as {
  __loaded: boolean;
  init: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  has_opted_out_capturing: ReturnType<typeof vi.fn>;
  opt_in_capturing: ReturnType<typeof vi.fn>;
  opt_out_capturing: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedPosthog.__loaded = true;
  mockedPosthog.has_opted_out_capturing.mockReturnValue(false);
  mockedPosthog.init.mockImplementation(() => {
    mockedPosthog.__loaded = true;
  });
});

describe("syncAnalyticsConsent", () => {
  it("opts out when the setting is disabled", () => {
    syncAnalyticsConsent(false);
    expect(mockedPosthog.opt_out_capturing).toHaveBeenCalledOnce();
  });

  it("opts back in without sending an opt-in event", () => {
    mockedPosthog.has_opted_out_capturing.mockReturnValue(true);
    syncAnalyticsConsent(true);
    expect(mockedPosthog.opt_in_capturing).toHaveBeenCalledWith({
      captureEventName: false,
    });
  });

  it("does nothing when the state already matches", () => {
    syncAnalyticsConsent(true);
    mockedPosthog.has_opted_out_capturing.mockReturnValue(true);
    syncAnalyticsConsent(false);
    expect(mockedPosthog.opt_in_capturing).not.toHaveBeenCalled();
    expect(mockedPosthog.opt_out_capturing).not.toHaveBeenCalled();
  });

  it("does nothing when PostHog is not initialized", () => {
    mockedPosthog.__loaded = false;
    syncAnalyticsConsent(false);
    expect(mockedPosthog.opt_out_capturing).not.toHaveBeenCalled();
  });
});

describe("initAnalytics", () => {
  let listener: ((settings: GameSettings) => void) | undefined;

  const settingsEngine = (analyticsEnabled: boolean) =>
    ({
      getGameSettings: () => ({
        showAdvisorFeedback: true,
        language: "hu",
        analyticsEnabled,
      }),
      subscribe: (l: (settings: GameSettings) => void) => {
        listener = l;
        return () => undefined;
      },
    }) as unknown as SettingsEngine;

  const storage = { onWriteError: vi.fn() } as unknown as StorageEngine;

  beforeEach(() => {
    mockedPosthog.__loaded = false;
    listener = undefined;
    vi.stubEnv("VITE_POSTHOG_KEY", "phc_test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not contact PostHog while analytics is disabled", () => {
    initAnalytics(storage, settingsEngine(false));
    expect(mockedPosthog.init).not.toHaveBeenCalled();
  });

  it("starts PostHog once the player enables analytics", () => {
    initAnalytics(storage, settingsEngine(false));
    listener?.({
      showAdvisorFeedback: true,
      language: "hu",
      analyticsEnabled: true,
    });
    expect(mockedPosthog.init).toHaveBeenCalledOnce();
  });

  it("starts without remote flags and with url redaction", () => {
    initAnalytics(storage, settingsEngine(true));
    expect(mockedPosthog.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        persistence: "memory",
        advanced_disable_flags: true,
        before_send: redactEventUrls,
      }),
    );
  });
});

describe("redactEventUrls", () => {
  it("removes the game session id from url properties", () => {
    const event = {
      uuid: "1",
      event: "$pageview",
      properties: {
        $current_url: "https://kampanykorut.hu/game/2026?sessionId=abc-123",
        $session_entry_url: "https://kampanykorut.hu/game/2026?sessionId=abc",
        turn: 3,
      },
    } as CaptureResult;

    expect(redactEventUrls(event)?.properties).toEqual({
      $current_url: "https://kampanykorut.hu/game/2026?sessionId=[redacted]",
      $session_entry_url:
        "https://kampanykorut.hu/game/2026?sessionId=[redacted]",
      turn: 3,
    });
  });

  it("passes dropped events through", () => {
    expect(redactEventUrls(null)).toBeNull();
  });
});
