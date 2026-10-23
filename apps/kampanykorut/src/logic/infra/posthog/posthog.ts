import posthog from "posthog-js";
import { container } from "tsyringe";
import { createLogger } from "@/shared/logger";
import { StorageEngine } from "@/shared/logic/application/StorageEngine";
import { buildInfo } from "../../../buildInfo";
import { ANALYTICS_SCHEMA_VERSION, getStorageKeyKind } from "./events";
import { track } from "./track";

const log = createLogger("posthog");

export function initAnalytics(
  storage: StorageEngine = container.resolve(StorageEngine),
) {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;

  if (!key) {
    return;
  }

  log.debug("PostHog analytics initialized");

  posthog.init(key, {
    api_host: host,
    persistence: "memory",
    person_profiles: "never",
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
    capture_pageleave: false,
    ip: false,
  });

  posthog.register({
    schema_version: ANALYTICS_SCHEMA_VERSION,
    app_version: buildInfo.version,
    git_commit: buildInfo.gitCommit,
    is_internal:
      storage.getItem("debugMode", "localStorage") === "true" ||
      window.location.hostname === "localhost",
  });

  storage.onWriteError((reason, storageKey) => {
    track("storage_failed", {
      reason: reason === "quota" ? "quota" : "other",
      key_kind: getStorageKeyKind(storageKey),
    });
  });
}
