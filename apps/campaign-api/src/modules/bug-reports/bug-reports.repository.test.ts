import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { type Connection } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  bugReportRecord,
  queuedNotification,
  REPORTED_AT,
} from "./__fixtures__/bug-reports";
import {
  type BugReportRepository,
  InMemoryBugReportRepository,
} from "./bug-reports.repository";
import { MongoBugReportRepository } from "./bug-reports.repository.mongo";

let server: MongoMemoryServer;
let connection: Connection;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  connection = await mongoose.createConnection(server.getUri()).asPromise();
}, 120_000);

afterAll(async () => {
  await connection?.close();
  await server?.stop();
});

const later = (minutes: number) =>
  new Date(REPORTED_AT.getTime() + minutes * 60_000);

const confirmedContact = {
  email: "jatekos@example.com",
  confirmTokenHash: "confirm-hash",
  confirmExpiresAt: later(7 * 24 * 60),
  confirmedAt: later(5),
  unsubscribeTokenHash: "unsubscribe-hash",
};

describe.each([
  ["in-memory", async () => new InMemoryBugReportRepository()],
  [
    "mongo",
    async () => {
      await connection.dropDatabase();
      const repository = new MongoBugReportRepository(connection);
      await repository.init();
      return repository;
    },
  ],
] as const)("%s BugReportRepository", (_name, create) => {
  let repository: BugReportRepository;

  beforeEach(async () => {
    repository = await create();
  });

  it("stores reports and finds recent duplicates and address usage", async () => {
    await repository.insert(bugReportRecord({ email: "jatekos@example.com" }));

    await expect(repository.findById("report-1")).resolves.toEqual(
      bugReportRecord({ email: "jatekos@example.com" }),
    );
    await expect(
      repository.findRecentByContentHash("hash-1", later(-60)),
    ).resolves.toMatchObject({ id: "report-1" });
    await expect(
      repository.findRecentByContentHash("hash-1", later(1)),
    ).resolves.toBeNull();
    await expect(
      repository.countWithEmailSince("jatekos@example.com", later(-60)),
    ).resolves.toBe(1);
  });

  it("tracks GitHub issue creation and retries", async () => {
    await repository.insert(bugReportRecord());
    await repository.insert(
      bugReportRecord({ id: "report-2", contentHash: "hash-2" }),
    );

    await repository.markIssueFailed("report-1", "boom", later(10));
    await repository.markIssueCreated("report-2", {
      number: 7,
      url: "https://github.com/acme/game/issues/7",
    });

    await expect(repository.listPendingIssues(later(5), 10)).resolves.toEqual(
      [],
    );
    await expect(
      repository.listPendingIssues(later(10), 10),
    ).resolves.toMatchObject([
      { id: "report-1", attempts: 1, lastError: "boom" },
    ]);
    await expect(repository.findById("report-2")).resolves.toMatchObject({
      githubStatus: "created",
      issueNumber: 7,
      nextAttemptAt: null,
    });
  });

  it("confirms an address only with a valid, unexpired token", async () => {
    await repository.insert(bugReportRecord({ email: "jatekos@example.com" }));
    await repository.setConfirmToken("report-1", "confirm-hash", later(60));

    await expect(repository.confirm("other", later(1))).resolves.toBeNull();
    await expect(
      repository.confirm("confirm-hash", later(61)),
    ).resolves.toBeNull();
    await expect(
      repository.confirm("confirm-hash", later(1)),
    ).resolves.toMatchObject({ confirmedAt: later(1) });
    await expect(
      repository.confirm("confirm-hash", later(2)),
    ).resolves.toMatchObject({ confirmedAt: later(1) });
  });

  it("forgets the address and cancels queued mail on unsubscribe", async () => {
    await repository.insert(
      bugReportRecord({
        ...confirmedContact,
        notifications: [queuedNotification({ type: "fixed" })],
      }),
    );

    const report = await repository.unsubscribe("unsubscribe-hash", later(9));

    expect(report).toMatchObject({
      email: null,
      confirmTokenHash: null,
      unsubscribedAt: later(9),
      notifications: [{ type: "fixed", status: "cancelled" }],
    });
    await expect(
      repository.unsubscribe("unsubscribe-hash", later(10)),
    ).resolves.toMatchObject({ unsubscribedAt: later(9) });
    await expect(
      repository.unsubscribe("unknown", later(10)),
    ).resolves.toBeNull();
  });

  it("queues exactly one fixed mail per confirmed report", async () => {
    await repository.insert(
      bugReportRecord({ ...confirmedContact, issueNumber: 7 }),
    );

    await expect(
      repository.applyIssueOutcome(7, "completed", later(10)),
    ).resolves.toEqual({ found: true, fixedMailQueued: true });
    await expect(
      repository.applyIssueOutcome(7, "reopened", later(11)),
    ).resolves.toEqual({ found: true, fixedMailQueued: false });
    await expect(repository.findById("report-1")).resolves.toMatchObject({
      status: "open",
    });
    await expect(
      repository.applyIssueOutcome(7, "completed", later(12)),
    ).resolves.toEqual({ found: true, fixedMailQueued: false });

    const report = await repository.findById("report-1");
    expect(report?.status).toBe("fixed");
    expect(report?.notifications).toMatchObject([
      { type: "fixed", status: "queued" },
    ]);
  });

  it("does not queue a fixed mail without a confirmed address", async () => {
    await repository.insert(
      bugReportRecord({ email: "jatekos@example.com", issueNumber: 7 }),
    );
    await repository.insert(
      bugReportRecord({
        id: "report-2",
        contentHash: "hash-2",
        ...confirmedContact,
        issueNumber: 8,
      }),
    );

    await expect(
      repository.applyIssueOutcome(7, "completed", later(10)),
    ).resolves.toEqual({ found: true, fixedMailQueued: false });
    await expect(
      repository.applyIssueOutcome(8, "not_planned", later(10)),
    ).resolves.toEqual({ found: true, fixedMailQueued: false });
    await expect(
      repository.applyIssueOutcome(99, "completed", later(10)),
    ).resolves.toEqual({ found: false, fixedMailQueued: false });
    await expect(repository.findById("report-2")).resolves.toMatchObject({
      status: "closed_not_planned",
      notifications: [],
    });
  });

  it("works through the outbox", async () => {
    await repository.insert(
      bugReportRecord({
        email: "jatekos@example.com",
        notifications: [queuedNotification()],
      }),
    );
    await repository.insert(
      bugReportRecord({
        id: "report-2",
        contentHash: "hash-2",
        ...confirmedContact,
        notifications: [
          queuedNotification({ status: "sent" }),
          queuedNotification({ type: "fixed", nextAttemptAt: later(30) }),
        ],
      }),
    );

    const due = await repository.listDueNotifications(later(1), 10);
    expect(due).toMatchObject([
      { report: { id: "report-1" }, notification: { type: "confirm" } },
    ]);

    await repository.markNotificationFailed({
      id: "report-1",
      type: "confirm",
      error: "timeout",
      nextAttemptAt: later(5),
    });
    await expect(
      repository.listDueNotifications(later(1), 10),
    ).resolves.toEqual([]);

    await repository.markNotificationSent("report-1", "confirm", {
      sentAt: later(5),
      messageId: "<m1@example.com>",
    });
    await repository.markNotificationFailed({
      id: "report-2",
      type: "fixed",
      error: "rejected",
      nextAttemptAt: null,
    });

    await expect(repository.findById("report-1")).resolves.toMatchObject({
      notifications: [
        {
          status: "sent",
          attempts: 2,
          messageId: "<m1@example.com>",
          lastError: null,
        },
      ],
    });
    await expect(repository.findById("report-2")).resolves.toMatchObject({
      notifications: [
        { type: "confirm", status: "sent" },
        { type: "fixed", status: "failed", lastError: "rejected" },
      ],
    });
  });

  it("purges unconfirmed addresses after a week and all after a year", async () => {
    await repository.insert(
      bugReportRecord({
        email: "uj@example.com",
        createdAt: later(-60),
        notifications: [queuedNotification()],
      }),
    );
    await repository.insert(
      bugReportRecord({
        id: "report-2",
        contentHash: "hash-2",
        email: "regi@example.com",
        createdAt: later(-10 * 24 * 60),
      }),
    );
    await repository.insert(
      bugReportRecord({
        id: "report-3",
        contentHash: "hash-3",
        ...confirmedContact,
        createdAt: later(-10 * 24 * 60),
      }),
    );

    await expect(
      repository.purgeContacts({
        unconfirmedBefore: later(-7 * 24 * 60),
        confirmedBefore: later(-365 * 24 * 60),
      }),
    ).resolves.toBe(1);
    await expect(repository.findById("report-2")).resolves.toMatchObject({
      email: null,
    });
    await expect(repository.findById("report-3")).resolves.toMatchObject({
      email: "jatekos@example.com",
    });

    await expect(
      repository.purgeContacts({
        unconfirmedBefore: later(0),
        confirmedBefore: later(0),
      }),
    ).resolves.toBe(2);
    await expect(repository.findById("report-1")).resolves.toMatchObject({
      email: null,
      notifications: [{ status: "cancelled" }],
    });
  });
});
