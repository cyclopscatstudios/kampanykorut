import posthog from "posthog-js";

export enum AnalyticsEvent {
  CAMPAIGN_STARTED = "campaign_started",
  CAMPAIGN_FINISHED = "campaign_finished",
  QUESTION_ANSWERED = "question_answered",
}

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
) {
  posthog.capture(event, properties);
}
