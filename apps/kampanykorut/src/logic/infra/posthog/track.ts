import posthog from "posthog-js";

export enum AnalyticsEvent {
  CAMPAIGN_STARTED = "campaign_started",
  CAMPAIGN_FINISHED = "campaign_finished",
  QUESTION_ANSWERED = "question_answered",
  LEAVE_LANDING_PAGE = "leave_ending_page",
}

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
) {
  posthog.capture(event, properties);
}
