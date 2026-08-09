import posthog from "posthog-js";
import { createLogger } from "@/shared/logger";

const log = createLogger("posthog");

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;

  if (!key) {
    return;
  }

  log.debug("PostHog analytics initialized");

  posthog.init(key, {
    api_host: host,
  });
}
