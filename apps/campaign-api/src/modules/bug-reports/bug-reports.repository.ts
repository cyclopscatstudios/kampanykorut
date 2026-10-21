export const NOTIFICATION_TYPES = ["confirm", "fixed"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_STATUSES = [
  "queued",
  "sent",
  "failed",
  "cancelled",
] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export const BUG_REPORT_STATUSES = [
  "open",
  "fixed",
  "closed_not_planned",
] as const;
export type BugReportStatus = (typeof BUG_REPORT_STATUSES)[number];

export type GithubStatus = "pending" | "created";

export interface BugReportEnvironment {
  campaign: string;
  url: string;
  browser: string;
  version: string;
}

export interface BugReportNotification {
  type: NotificationType;
  status: NotificationStatus;
  queuedAt: Date;
  nextAttemptAt: Date;
  sentAt: Date | null;
  messageId: string | null;
  attempts: number;
  lastError: string | null;
}

export interface BugReportRecord {
  id: string;
  title: string;
  description: string;
  steps: string;
  environment: BugReportEnvironment;
  issueNumber: number | null;
  issueUrl: string | null;
  githubStatus: GithubStatus;
  attempts: number;
  lastError: string | null;
  nextAttemptAt: Date | null;
  status: BugReportStatus;
  email: string | null;
  confirmTokenHash: string | null;
  confirmExpiresAt: Date | null;
  confirmedAt: Date | null;
  unsubscribeTokenHash: string | null;
  unsubscribedAt: Date | null;
  notifications: BugReportNotification[];
  contentHash: string;
  ipHash: string;
  createdAt: Date;
}

export interface DueNotification {
  report: BugReportRecord;
  notification: BugReportNotification;
}

export type IssueOutcome = "completed" | "not_planned" | "reopened";

export interface ClosureResult {
  found: boolean;
  fixedMailQueued: boolean;
}

export interface NotificationAttempt {
  id: string;
  type: NotificationType;
  error: string;
  nextAttemptAt: Date | null;
}

export interface BugReportRepository {
  insert(report: BugReportRecord): Promise<void>;
  findById(id: string): Promise<BugReportRecord | null>;
  findRecentByContentHash(
    contentHash: string,
    since: Date,
  ): Promise<BugReportRecord | null>;
  countWithEmailSince(email: string, since: Date): Promise<number>;

  markIssueCreated(
    id: string,
    issue: { number: number; url: string },
  ): Promise<void>;
  markIssueFailed(
    id: string,
    error: string,
    nextAttemptAt: Date,
  ): Promise<void>;
  listPendingIssues(now: Date, limit: number): Promise<BugReportRecord[]>;

  setConfirmToken(id: string, hash: string, expiresAt: Date): Promise<void>;
  setUnsubscribeToken(id: string, hash: string): Promise<void>;
  findByConfirmToken(hash: string): Promise<BugReportRecord | null>;
  findByUnsubscribeToken(hash: string): Promise<BugReportRecord | null>;
  confirm(hash: string, now: Date): Promise<BugReportRecord | null>;
  unsubscribe(hash: string, now: Date): Promise<BugReportRecord | null>;

  applyIssueOutcome(
    issueNumber: number,
    outcome: IssueOutcome,
    now: Date,
  ): Promise<ClosureResult>;

  listDueNotifications(now: Date, limit: number): Promise<DueNotification[]>;
  markNotificationSent(
    id: string,
    type: NotificationType,
    sent: { sentAt: Date; messageId: string | null },
  ): Promise<void>;
  markNotificationFailed(attempt: NotificationAttempt): Promise<void>;
  forgetEmail(id: string): Promise<void>;

  purgeContacts(query: {
    unconfirmedBefore: Date;
    confirmedBefore: Date;
  }): Promise<number>;
}

const clone = (report: BugReportRecord): BugReportRecord =>
  structuredClone(report);

const CONTACT_CLEARED = {
  email: null,
  confirmTokenHash: null,
  confirmExpiresAt: null,
  unsubscribeTokenHash: null,
} satisfies Partial<BugReportRecord>;

function cancelQueued(notifications: BugReportNotification[]) {
  return notifications.map((n) =>
    n.status === "queued" ? { ...n, status: "cancelled" as const } : n,
  );
}

export function fixedNotification(now: Date): BugReportNotification {
  return {
    type: "fixed",
    status: "queued",
    queuedAt: now,
    nextAttemptAt: now,
    sentAt: null,
    messageId: null,
    attempts: 0,
    lastError: null,
  };
}

export function outcomeStatus(outcome: IssueOutcome): BugReportStatus {
  if (outcome === "completed") return "fixed";
  if (outcome === "not_planned") return "closed_not_planned";
  return "open";
}

export function canReceiveFixedMail(report: BugReportRecord): boolean {
  return (
    report.email !== null &&
    report.confirmedAt !== null &&
    report.unsubscribedAt === null
  );
}

export class InMemoryBugReportRepository implements BugReportRepository {
  private readonly items = new Map<string, BugReportRecord>();

  async insert(report: BugReportRecord): Promise<void> {
    this.items.set(report.id, clone(report));
  }

  async findById(id: string) {
    const item = this.items.get(id);
    return item ? clone(item) : null;
  }

  async findRecentByContentHash(contentHash: string, since: Date) {
    const item = this.all().find(
      (r) => r.contentHash === contentHash && r.createdAt >= since,
    );
    return item ? clone(item) : null;
  }

  async countWithEmailSince(email: string, since: Date) {
    return this.all().filter((r) => r.email === email && r.createdAt >= since)
      .length;
  }

  async markIssueCreated(id: string, issue: { number: number; url: string }) {
    this.update(id, () => ({
      issueNumber: issue.number,
      issueUrl: issue.url,
      githubStatus: "created",
      nextAttemptAt: null,
      lastError: null,
    }));
  }

  async markIssueFailed(id: string, error: string, nextAttemptAt: Date) {
    this.update(id, (r) => ({
      attempts: r.attempts + 1,
      lastError: error,
      nextAttemptAt,
    }));
  }

  async listPendingIssues(now: Date, limit: number) {
    return this.all()
      .filter(
        (r) =>
          r.githubStatus === "pending" &&
          r.nextAttemptAt !== null &&
          r.nextAttemptAt <= now,
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, limit)
      .map(clone);
  }

  async setConfirmToken(id: string, hash: string, expiresAt: Date) {
    this.update(id, () => ({
      confirmTokenHash: hash,
      confirmExpiresAt: expiresAt,
    }));
  }

  async setUnsubscribeToken(id: string, hash: string) {
    this.update(id, () => ({ unsubscribeTokenHash: hash }));
  }

  async findByConfirmToken(hash: string) {
    const item = this.all().find((r) => r.confirmTokenHash === hash);
    return item ? clone(item) : null;
  }

  async findByUnsubscribeToken(hash: string) {
    const item = this.all().find((r) => r.unsubscribeTokenHash === hash);
    return item ? clone(item) : null;
  }

  async confirm(hash: string, now: Date) {
    const item = this.all().find(
      (r) =>
        r.confirmTokenHash === hash &&
        r.email !== null &&
        r.confirmExpiresAt !== null &&
        r.confirmExpiresAt > now,
    );
    if (!item) return null;
    if (item.confirmedAt === null) item.confirmedAt = now;
    return clone(item);
  }

  async unsubscribe(hash: string, now: Date) {
    const item = this.all().find((r) => r.unsubscribeTokenHash === hash);
    if (!item) return null;
    Object.assign(item, {
      ...CONTACT_CLEARED,
      unsubscribeTokenHash: item.unsubscribeTokenHash,
      unsubscribedAt: item.unsubscribedAt ?? now,
      notifications: cancelQueued(item.notifications),
    });
    return clone(item);
  }

  async applyIssueOutcome(
    issueNumber: number,
    outcome: IssueOutcome,
    now: Date,
  ): Promise<ClosureResult> {
    const item = this.all().find((r) => r.issueNumber === issueNumber);
    if (!item) return { found: false, fixedMailQueued: false };

    item.status = outcomeStatus(outcome);

    const queue =
      outcome === "completed" &&
      canReceiveFixedMail(item) &&
      !item.notifications.some((n) => n.type === "fixed");
    if (queue) item.notifications.push(fixedNotification(now));

    return { found: true, fixedMailQueued: queue };
  }

  async listDueNotifications(now: Date, limit: number) {
    return this.all()
      .filter((r) => r.email !== null)
      .flatMap((report) =>
        report.notifications
          .filter((n) => n.status === "queued" && n.nextAttemptAt <= now)
          .map((notification) => ({
            report: clone(report),
            notification: { ...notification },
          })),
      )
      .sort(
        (a, b) =>
          a.notification.nextAttemptAt.getTime() -
          b.notification.nextAttemptAt.getTime(),
      )
      .slice(0, limit);
  }

  async markNotificationSent(
    id: string,
    type: NotificationType,
    sent: { sentAt: Date; messageId: string | null },
  ) {
    this.updateNotification(id, type, (n) => ({
      ...n,
      status: "sent",
      attempts: n.attempts + 1,
      sentAt: sent.sentAt,
      messageId: sent.messageId,
      lastError: null,
    }));
  }

  async markNotificationFailed({
    id,
    type,
    error,
    nextAttemptAt,
  }: NotificationAttempt) {
    this.updateNotification(id, type, (n) => ({
      ...n,
      status: nextAttemptAt ? "queued" : "failed",
      attempts: n.attempts + 1,
      nextAttemptAt: nextAttemptAt ?? n.nextAttemptAt,
      lastError: error,
    }));
  }

  async forgetEmail(id: string) {
    this.update(id, (r) => ({
      ...CONTACT_CLEARED,
      unsubscribeTokenHash: r.unsubscribeTokenHash,
      notifications: cancelQueued(r.notifications),
    }));
  }

  async purgeContacts({
    unconfirmedBefore,
    confirmedBefore,
  }: {
    unconfirmedBefore: Date;
    confirmedBefore: Date;
  }) {
    const expired = this.all().filter(
      (r) =>
        r.email !== null &&
        ((r.confirmedAt === null && r.createdAt < unconfirmedBefore) ||
          r.createdAt < confirmedBefore),
    );
    for (const item of expired) {
      Object.assign(item, {
        ...CONTACT_CLEARED,
        notifications: cancelQueued(item.notifications),
      });
    }
    return expired.length;
  }

  private all() {
    return [...this.items.values()];
  }

  private update(
    id: string,
    patch: (report: BugReportRecord) => Partial<BugReportRecord>,
  ) {
    const item = this.items.get(id);
    if (item) Object.assign(item, patch(item));
  }

  private updateNotification(
    id: string,
    type: NotificationType,
    patch: (n: BugReportNotification) => BugReportNotification,
  ) {
    this.update(id, (r) => ({
      notifications: r.notifications.map((n) =>
        n.type === type ? patch(n) : n,
      ),
    }));
  }
}
