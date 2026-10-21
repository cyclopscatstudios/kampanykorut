import type {
  BugReportNotification,
  BugReportRecord,
} from "../bug-reports.repository";

export const REPORTED_AT = new Date("2026-10-20T10:00:00Z");

export function queuedNotification(
  overrides: Partial<BugReportNotification> = {},
): BugReportNotification {
  return {
    type: "confirm",
    status: "queued",
    queuedAt: REPORTED_AT,
    nextAttemptAt: REPORTED_AT,
    sentAt: null,
    messageId: null,
    attempts: 0,
    lastError: null,
    ...overrides,
  };
}

export function bugReportRecord(
  overrides: Partial<BugReportRecord> = {},
): BugReportRecord {
  return {
    id: "report-1",
    title: "Nem indul a kampány",
    description: "A start gomb nem csinál semmit.",
    steps: "1. Új játék\n2. Start",
    environment: {
      campaign: "2026",
      url: "https://kampanykorut.hu/game",
      browser: "Firefox",
      version: "1.2.3",
    },
    issueNumber: null,
    issueUrl: null,
    githubStatus: "pending",
    attempts: 0,
    lastError: null,
    nextAttemptAt: REPORTED_AT,
    status: "open",
    email: null,
    confirmTokenHash: null,
    confirmExpiresAt: null,
    confirmedAt: null,
    unsubscribeTokenHash: null,
    unsubscribedAt: null,
    notifications: [],
    contentHash: "hash-1",
    ipHash: "ip-1",
    createdAt: REPORTED_AT,
    ...overrides,
  };
}
