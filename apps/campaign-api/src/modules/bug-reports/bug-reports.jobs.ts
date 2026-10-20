import type { FastifyBaseLogger } from "fastify";
import type { BugReportTracker } from "./bug-reports.github";
import type { Mailer, OutgoingMail } from "./bug-reports.mailer";
import type {
  BugReportRepository,
  DueNotification,
} from "./bug-reports.repository";
import {
  type BugReportService,
  CONFIRM_TOKEN_TTL_MS,
  createToken,
  hashToken,
} from "./bug-reports.service";
import {
  confirmMail,
  confirmPath,
  fixedMail,
  unsubscribePath,
} from "./bug-reports.templates";

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const MAIL_BATCH = 20;
export const MAX_MAIL_ATTEMPTS = 5;
const BACKFILL_WINDOW_MS = 3 * DAY_MS;
const UNCONFIRMED_RETENTION_MS = 7 * DAY_MS;
const CONFIRMED_RETENTION_MS = 365 * DAY_MS;

export interface BugReportJobsOptions {
  service: BugReportService;
  repository: BugReportRepository;
  tracker: BugReportTracker | null;
  mailer: Mailer | null;
  siteUrl: string;
  log: FastifyBaseLogger;
  now?: () => Date;
}

export class BugReportJobs {
  private readonly now: () => Date;

  constructor(private readonly options: BugReportJobsOptions) {
    this.now = options.now ?? (() => new Date());
  }

  async runFrequent(): Promise<void> {
    await this.options.service.retryPendingIssues();
    await this.sendDueMails();
  }

  async runDaily(): Promise<void> {
    await this.backfillClosedIssues();
    await this.purgeContacts();
  }

  async sendDueMails(): Promise<number> {
    const { mailer, repository } = this.options;
    if (!mailer) return 0;

    const due = await repository.listDueNotifications(this.now(), MAIL_BATCH);
    let sent = 0;
    for (const item of due) {
      if (await this.deliver(mailer, item)) sent++;
    }
    return sent;
  }

  async backfillClosedIssues(): Promise<number> {
    const { tracker, service } = this.options;
    if (!tracker) return 0;

    const since = new Date(this.now().getTime() - BACKFILL_WINDOW_MS);
    let applied = 0;
    for (const issue of await tracker.listClosedWithContact(since)) {
      if (!issue.outcome) continue;
      const result = await service.applyIssueOutcome(
        issue.number,
        issue.outcome,
      );
      if (result.fixedMailQueued) applied++;
    }
    return applied;
  }

  async purgeContacts(): Promise<number> {
    const now = this.now().getTime();
    const purged = await this.options.repository.purgeContacts({
      unconfirmedBefore: new Date(now - UNCONFIRMED_RETENTION_MS),
      confirmedBefore: new Date(now - CONFIRMED_RETENTION_MS),
    });
    if (purged > 0) {
      this.options.log.info({ purged }, "Purged expired bug report contacts");
    }
    return purged;
  }

  private async deliver(
    mailer: Mailer,
    { report, notification }: DueNotification,
  ): Promise<boolean> {
    const { repository, log } = this.options;
    const context = { bugReportId: report.id, mail: notification.type };

    try {
      const mail = await this.compose({ report, notification });
      const { messageId } = await mailer.send(mail);
      await repository.markNotificationSent(report.id, notification.type, {
        sentAt: this.now(),
        messageId,
      });
      if (notification.type === "fixed") {
        await repository.forgetEmail(report.id);
      }
      log.info(context, "Bug report mail sent");
      return true;
    } catch (err) {
      const attempts = notification.attempts + 1;
      const giveUp = attempts >= MAX_MAIL_ATTEMPTS;
      await repository.markNotificationFailed({
        id: report.id,
        type: notification.type,
        error: err instanceof Error ? err.message : String(err),
        nextAttemptAt: giveUp
          ? null
          : new Date(this.now().getTime() + 2 ** attempts * MINUTE_MS),
      });
      log.error(
        { ...context, err, attempts },
        giveUp
          ? "Bug report mail failed permanently"
          : "Bug report mail failed",
      );
      return false;
    }
  }

  private async compose({
    report,
    notification,
  }: DueNotification): Promise<OutgoingMail> {
    const { repository, siteUrl } = this.options;
    const to = report.email!;
    const token = createToken();

    if (notification.type === "confirm") {
      await repository.setConfirmToken(
        report.id,
        hashToken(token),
        new Date(this.now().getTime() + CONFIRM_TOKEN_TTL_MS),
      );
      return {
        to,
        ...confirmMail({
          title: report.title,
          confirmUrl: `${siteUrl}${confirmPath(token)}`,
        }),
      };
    }

    await repository.setUnsubscribeToken(report.id, hashToken(token));
    const unsubscribeUrl = `${siteUrl}${unsubscribePath(token)}`;
    return {
      to,
      ...fixedMail({ title: report.title, siteUrl, unsubscribeUrl }),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  }
}
