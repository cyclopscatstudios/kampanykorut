import { type Connection, type Model, Schema } from "mongoose";
import {
  BUG_REPORT_STATUSES,
  type BugReportNotification,
  type BugReportRecord,
  type BugReportRepository,
  type ClosureResult,
  fixedNotification,
  type IssueOutcome,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPES,
  type NotificationAttempt,
  type NotificationType,
  outcomeStatus,
} from "./bug-reports.repository";

const NotificationSchema = new Schema<BugReportNotification>(
  {
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    status: { type: String, enum: NOTIFICATION_STATUSES, required: true },
    queuedAt: { type: Date, required: true },
    nextAttemptAt: { type: Date, required: true },
    sentAt: { type: Date, default: null },
    messageId: { type: String, default: null },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
  },
  { _id: false },
);

const BugReportSchema = new Schema<BugReportRecord>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    steps: { type: String, default: "" },
    environment: {
      type: new Schema(
        { campaign: String, url: String, browser: String, version: String },
        { _id: false },
      ),
      required: true,
    },
    issueNumber: { type: Number, default: null },
    issueUrl: { type: String, default: null },
    githubStatus: {
      type: String,
      enum: ["pending", "created"],
      required: true,
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
    nextAttemptAt: { type: Date, default: null },
    status: { type: String, enum: BUG_REPORT_STATUSES, required: true },
    email: { type: String, default: null },
    confirmTokenHash: { type: String, default: null },
    confirmExpiresAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    unsubscribeTokenHash: { type: String, default: null },
    unsubscribedAt: { type: Date, default: null },
    notifications: { type: [NotificationSchema], default: [] },
    contentHash: { type: String, required: true },
    ipHash: { type: String, required: true },
    createdAt: { type: Date, required: true },
  },
  { collection: "bugReports", versionKey: false, timestamps: false },
);

BugReportSchema.index(
  { issueNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { issueNumber: { $type: "number" } },
  },
);
BugReportSchema.index(
  { confirmTokenHash: 1 },
  { partialFilterExpression: { confirmTokenHash: { $type: "string" } } },
);
BugReportSchema.index(
  { unsubscribeTokenHash: 1 },
  { partialFilterExpression: { unsubscribeTokenHash: { $type: "string" } } },
);
BugReportSchema.index(
  { githubStatus: 1, nextAttemptAt: 1 },
  { partialFilterExpression: { githubStatus: "pending" } },
);
BugReportSchema.index({
  "notifications.status": 1,
  "notifications.nextAttemptAt": 1,
});
BugReportSchema.index({ contentHash: 1, createdAt: -1 });
BugReportSchema.index(
  { email: 1, createdAt: -1 },
  { partialFilterExpression: { email: { $type: "string" } } },
);

const CONTACT_CLEARED = {
  email: null,
  confirmTokenHash: null,
  confirmExpiresAt: null,
};

const CANCEL_QUEUED = {
  set: { "notifications.$[queued].status": "cancelled" },
  arrayFilters: [{ "queued.status": "queued" }],
};

function toRecord(doc: BugReportRecord & { _id?: unknown }): BugReportRecord {
  const record = { ...doc };
  delete record._id;
  return record;
}

export class MongoBugReportRepository implements BugReportRepository {
  private readonly model: Model<BugReportRecord>;

  constructor(connection: Connection) {
    this.model =
      (connection.models.BugReport as Model<BugReportRecord> | undefined) ??
      connection.model<BugReportRecord>("BugReport", BugReportSchema);
  }

  init(): Promise<void> {
    return this.model.init().then(() => undefined);
  }

  async insert(report: BugReportRecord): Promise<void> {
    await this.model.create(report);
  }

  async findById(id: string) {
    return this.findOne({ id });
  }

  async findRecentByContentHash(contentHash: string, since: Date) {
    return this.findOne({ contentHash, createdAt: { $gte: since } });
  }

  async countWithEmailSince(email: string, since: Date) {
    return this.model.countDocuments({ email, createdAt: { $gte: since } });
  }

  async markIssueCreated(id: string, issue: { number: number; url: string }) {
    await this.model.updateOne(
      { id },
      {
        $set: {
          issueNumber: issue.number,
          issueUrl: issue.url,
          githubStatus: "created",
          nextAttemptAt: null,
          lastError: null,
        },
      },
    );
  }

  async markIssueFailed(id: string, error: string, nextAttemptAt: Date) {
    await this.model.updateOne(
      { id },
      { $set: { lastError: error, nextAttemptAt }, $inc: { attempts: 1 } },
    );
  }

  async listPendingIssues(now: Date, limit: number) {
    const docs = await this.model
      .find({ githubStatus: "pending", nextAttemptAt: { $lte: now } })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean<BugReportRecord[]>();
    return docs.map(toRecord);
  }

  async setConfirmToken(id: string, hash: string, expiresAt: Date) {
    await this.model.updateOne(
      { id },
      { $set: { confirmTokenHash: hash, confirmExpiresAt: expiresAt } },
    );
  }

  async setUnsubscribeToken(id: string, hash: string) {
    await this.model.updateOne(
      { id },
      { $set: { unsubscribeTokenHash: hash } },
    );
  }

  async findByConfirmToken(hash: string) {
    return this.findOne({ confirmTokenHash: hash });
  }

  async findByUnsubscribeToken(hash: string) {
    return this.findOne({ unsubscribeTokenHash: hash });
  }

  async confirm(hash: string, now: Date) {
    const valid = {
      confirmTokenHash: hash,
      email: { $ne: null },
      confirmExpiresAt: { $gt: now },
    };
    await this.model.updateOne(
      { ...valid, confirmedAt: null },
      { $set: { confirmedAt: now } },
    );
    return this.findOne(valid);
  }

  async unsubscribe(hash: string, now: Date) {
    await this.model.updateOne(
      { unsubscribeTokenHash: hash, unsubscribedAt: null },
      { $set: { unsubscribedAt: now } },
    );
    await this.model.updateOne(
      { unsubscribeTokenHash: hash },
      { $set: { ...CONTACT_CLEARED, ...CANCEL_QUEUED.set } },
      { arrayFilters: CANCEL_QUEUED.arrayFilters },
    );
    return this.findOne({ unsubscribeTokenHash: hash });
  }

  async applyIssueOutcome(
    issueNumber: number,
    outcome: IssueOutcome,
    now: Date,
  ): Promise<ClosureResult> {
    const status = outcomeStatus(outcome);

    if (outcome === "completed") {
      const queued = await this.model.updateOne(
        {
          issueNumber,
          email: { $ne: null },
          confirmedAt: { $ne: null },
          unsubscribedAt: null,
          "notifications.type": { $ne: "fixed" },
        },
        {
          $set: { status },
          $push: { notifications: fixedNotification(now) },
        },
      );
      if (queued.modifiedCount > 0) {
        return { found: true, fixedMailQueued: true };
      }
    }

    const updated = await this.model.updateOne(
      { issueNumber },
      { $set: { status } },
    );
    return { found: updated.matchedCount > 0, fixedMailQueued: false };
  }

  async listDueNotifications(now: Date, limit: number) {
    const docs = await this.model
      .find({
        email: { $ne: null },
        notifications: {
          $elemMatch: { status: "queued", nextAttemptAt: { $lte: now } },
        },
      })
      .limit(limit)
      .lean<BugReportRecord[]>();

    return docs
      .map(toRecord)
      .flatMap((report) =>
        report.notifications
          .filter((n) => n.status === "queued" && n.nextAttemptAt <= now)
          .map((notification) => ({ report, notification })),
      )
      .slice(0, limit);
  }

  async markNotificationSent(
    id: string,
    type: NotificationType,
    sent: { sentAt: Date; messageId: string | null },
  ) {
    await this.model.updateOne(
      { id },
      {
        $set: {
          "notifications.$[n].status": "sent",
          "notifications.$[n].sentAt": sent.sentAt,
          "notifications.$[n].messageId": sent.messageId,
          "notifications.$[n].lastError": null,
        },
        $inc: { "notifications.$[n].attempts": 1 },
      },
      { arrayFilters: [{ "n.type": type }] },
    );
  }

  async markNotificationFailed({
    id,
    type,
    error,
    nextAttemptAt,
  }: NotificationAttempt) {
    await this.model.updateOne(
      { id },
      {
        $set: {
          "notifications.$[n].status": nextAttemptAt ? "queued" : "failed",
          "notifications.$[n].lastError": error,
          ...(nextAttemptAt
            ? { "notifications.$[n].nextAttemptAt": nextAttemptAt }
            : {}),
        },
        $inc: { "notifications.$[n].attempts": 1 },
      },
      { arrayFilters: [{ "n.type": type }] },
    );
  }

  async forgetEmail(id: string) {
    await this.model.updateOne(
      { id },
      { $set: { ...CONTACT_CLEARED, ...CANCEL_QUEUED.set } },
      { arrayFilters: CANCEL_QUEUED.arrayFilters },
    );
  }

  async purgeContacts({
    unconfirmedBefore,
    confirmedBefore,
  }: {
    unconfirmedBefore: Date;
    confirmedBefore: Date;
  }) {
    const result = await this.model.updateMany(
      {
        email: { $ne: null },
        $or: [
          { confirmedAt: null, createdAt: { $lt: unconfirmedBefore } },
          { createdAt: { $lt: confirmedBefore } },
        ],
      },
      { $set: { ...CONTACT_CLEARED, ...CANCEL_QUEUED.set } },
      { arrayFilters: CANCEL_QUEUED.arrayFilters },
    );
    return result.modifiedCount;
  }

  private async findOne(filter: Record<string, unknown>) {
    const doc = await this.model.findOne(filter).lean<BugReportRecord>();
    return doc ? toRecord(doc) : null;
  }
}
