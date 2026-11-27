import { SettingsEngine } from "@logic/application/SettingsEngine";
import { createLogger } from "@shared/logger";
import { StorageEngine } from "@shared/logic/application/StorageEngine";
import posthog, { type CaptureResult } from "posthog-js";
import { container } from "tsyringe";
import { buildInfo } from "../../../buildInfo";
import { redactSessionIdParam } from "../sentryScrub";
import {
  ANALYTICS_SCHEMA_VERSION,
  type EntryProperties,
  getEntryProperties,
  getStorageKeyKind,
} from "./events";
import { track } from "./track";

const log = createLogger("posthog");

export function redactEventUrls(event: CaptureResult | null) {
  if (!event) {
    return event;
  }
  return {
    ...event,
    properties: Object.fromEntries(
      Object.entries(event.properties).map(([key, value]) => [
        key,
        typeof value === "string" ? redactSessionIdParam(value) : value,
      ]),
    ),
  };
}

export function syncAnalyticsConsent(enabled: boolean) {
  if (!posthog.__loaded) {
    return;
  }
  const optedOut = posthog.has_opted_out_capturing();
  if (enabled && optedOut) {
    posthog.opt_in_capturing({ captureEventName: false });
  } else if (!enabled && !optedOut) {
    posthog.opt_out_capturing();
  }
}

const INTERNAL_FLAG_KEY = "kk_internal";

export function isInternalVisit(
  location: Pick<Location, "hostname" | "search">,
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage,
) {
  if (location.hostname === "localhost") {
    return true;
  }
  try {
    const flag = new URLSearchParams(location.search).get("internal");
    if (flag === "1") {
      storage.setItem(INTERNAL_FLAG_KEY, "1");
    } else if (flag === "0") {
      storage.removeItem(INTERNAL_FLAG_KEY);
    }
    return storage.getItem(INTERNAL_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

function startPosthog(
  key: string,
  host: string | undefined,
  entry: EntryProperties,
) {
  log.debug("PostHog analytics initialized");

  posthog.init(key, {
    api_host: host,
    persistence: "sessionStorage",
    person_profiles: "never",
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
    capture_pageleave: false,
    ip: false,
    advanced_disable_flags: true,
    before_send: redactEventUrls,
  });

  posthog.register({
    schema_version: ANALYTICS_SCHEMA_VERSION,
    app_version: buildInfo.version,
    git_commit: buildInfo.gitCommit,
    is_internal: isInternalVisit(window.location),
  });
  posthog.register_once(entry);
}

export function initAnalytics(
  storage: StorageEngine = container.resolve(StorageEngine),
  settingsEngine: SettingsEngine = container.resolve(SettingsEngine),
) {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;

  if (!key) {
    return;
  }

  const entry = getEntryProperties(window.location, document.referrer);
  const applySetting = (enabled: boolean) => {
    if (enabled && !posthog.__loaded) {
      startPosthog(key, host, entry);
    }
    syncAnalyticsConsent(enabled);
  };

  applySetting(settingsEngine.getGameSettings().analyticsEnabled !== false);
  settingsEngine.subscribe((settings) =>
    applySetting(settings.analyticsEnabled !== false),
  );

  storage.onWriteError((reason, storageKey) => {
    track("storage_failed", {
      reason: reason === "quota" ? "quota" : "other",
      key_kind: getStorageKeyKind(storageKey),
    });
  });
}
