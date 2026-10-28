import posthog from "posthog-js";
import type { AnalyticsEventName, AnalyticsEvents } from "./events";

const sentOnce = new Set<string>();

export function track<E extends AnalyticsEventName>(
  event: E,
  properties: AnalyticsEvents[E],
) {
  if (!posthog.__loaded || posthog.has_opted_out_capturing()) {
    return;
  }
  posthog.capture(event, properties);
}

export function trackOnce<E extends AnalyticsEventName>(
  key: string,
  event: E,
  properties: AnalyticsEvents[E],
) {
  const onceKey = `${event}:${key}`;
  if (sentOnce.has(onceKey)) {
    return;
  }
  sentOnce.add(onceKey);
  track(event, properties);
}

export function resetTrackOnce() {
  sentOnce.clear();
}
