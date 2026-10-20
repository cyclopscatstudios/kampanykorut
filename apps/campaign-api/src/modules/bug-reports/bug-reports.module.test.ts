import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type App, type AppDeps, buildApp } from "../../app";
import { loadConfig } from "../../config/env";
import {
  GITHUB_WEBHOOK_PATH,
  signGithubPayload,
} from "../../integrations/github/webhooks";
import { TurnstileVerifier } from "../../integrations/turnstile/turnstile";
import { testPrivateKeyOneLine } from "../../testing/test-key";
import { InMemoryNewsRepository } from "../news/news.repository";
import type { BugReportTracker, NewIssue } from "./bug-reports.github";
import { MAX_MAIL_ATTEMPTS } from "./bug-reports.jobs";
import type { Mailer, OutgoingMail } from "./bug-reports.mailer";
import { InMemoryBugReportRepository } from "./bug-reports.repository";
import { hashToken } from "./bug-reports.service";

const SECRET = "test-webhook-secret-123";
const REPO = "cyclopscatstudios/kampanykorut";
const START = new Date("2026-10-20T10:00:00Z");

const config = loadConfig({
  NODE_ENV: "test",
  LOG_LEVEL: "silent",
  GITHUB_APP_ID: "1",
  GITHUB_APP_PRIVATE_KEY: testPrivateKeyOneLine,
  GITHUB_APP_INSTALLATION_ID: "2",
  GITHUB_REPO: REPO,
  GITHUB_WEBHOOK_SECRET: SECRET,
  SITE_URL: "https://kampanykorut.hu",
});

const report = (overrides: Record<string, unknown> = {}) => ({
  title: "Nem indul a kampány",
  description: "A start gomb nem csinál semmit.",
  steps: "1. Új játék\n2. Start",
  environment: {
    campaign: "2026",
    url: "https://kampanykorut.hu/game",
    browser: "Firefox",
    version: "1.2.3",
  },
  ...overrides,
});

class FakeMailer implements Mailer {
  sent: OutgoingMail[] = [];
  failing = false;

  async send(mail: OutgoingMail) {
    if (this.failing) throw new Error("SMTP unavailable");
    this.sent.push(mail);
    return { messageId: `<${this.sent.length}@test>` };
  }

  async verify() {}
}

function fakeTracker() {
  let next = 100;
  const issues: NewIssue[] = [];
  const tracker = {
    issues,
    failing: false,
    createIssue: vi.fn(async (issue: NewIssue) => {
      if (tracker.failing) throw new Error("GitHub down");
      issues.push(issue);
      const number = next++;
      return { number, url: `https://github.com/${REPO}/issues/${number}` };
    }),
    listClosedWithContact: vi.fn<BugReportTracker["listClosedWithContact"]>(
      async () => [],
    ),
  };
  return tracker;
}

const tokenFrom = (mail: OutgoingMail, kind: "confirm" | "unsubscribe") => {
  const match = mail.text.match(
    new RegExp(`/api/v1/bug-reports/${kind}/([A-Za-z0-9_-]{43})`),
  );
  if (!match) throw new Error(`No ${kind} link in mail`);
  return match[1]!;
};

describe("bug reports module", () => {
  let app: App;
  let now: Date;
  let tracker: ReturnType<typeof fakeTracker>;
  let mailer: FakeMailer;
  let repository: InMemoryBugReportRepository;

  const build = async (deps: AppDeps = {}) => {
    app = await buildApp(config, {
      newsRepository: new InMemoryNewsRepository(),
      bugReportRepository: repository,
      bugReportTracker: tracker,
      mailer,
      turnstile: null,
      now: () => now,
      ...deps,
    });
    return app;
  };

  const submit = (body: unknown, headers: Record<string, string> = {}) =>
    app.inject({
      method: "POST",
      url: "/api/v1/bug-reports",
      payload: body as object,
      headers,
    });

  const issueEvent = (
    action: string,
    number: number,
    stateReason: string | null,
    repo = REPO,
  ) => {
    const raw = JSON.stringify({
      action,
      issue: { number, state_reason: stateReason },
      repository: { full_name: repo },
    });
    return app.inject({
      method: "POST",
      url: GITHUB_WEBHOOK_PATH,
      headers: {
        "content-type": "application/json",
        "x-github-event": "issues",
        "x-github-delivery": "delivery-1",
        "x-hub-signature-256": signGithubPayload(SECRET, raw),
      },
      payload: raw,
    });
  };

  const advance = (minutes: number) => {
    now = new Date(now.getTime() + minutes * 60_000);
  };

  beforeEach(() => {
    now = START;
    tracker = fakeTracker();
    mailer = new FakeMailer();
    repository = new InMemoryBugReportRepository();
  });

  afterEach(async () => {
    await app?.close();
  });

  it("opens a GitHub issue without the reporter's contact details", async () => {
    await build();

    const res = await submit(
      report({
        email: "Jatekos@Example.com",
        description: "Hívj a +36 30 123 4567 számon vagy írj: x@y.hu",
      }),
    );

    expect(res.statusCode).toBe(202);
    expect(res.json()).toEqual({ id: expect.any(String), issueNumber: 100 });

    const [issue] = tracker.issues;
    expect(issue).toMatchObject({
      title: "[Bug]: Nem indul a kampány",
      labels: ["bug", "from-app", "has-contact"],
    });
    expect(issue!.body).toContain("## Steps to Reproduce\n\n1. Új játék");
    expect(issue!.body).toContain("- Version: 1.2.3");
    expect(issue!.body).not.toMatch(/jatekos|123 4567|x@y\.hu/i);
    expect(issue!.body).toContain("[telefonszám eltávolítva]");

    await expect(repository.findById(res.json().id)).resolves.toMatchObject({
      email: "jatekos@example.com",
      githubStatus: "created",
      issueUrl: `https://github.com/${REPO}/issues/100`,
      notifications: [{ type: "confirm", status: "queued" }],
    });
  });

  it("answers 503 when GitHub is not configured", async () => {
    await build({ bugReportTracker: null });

    const res = await submit(report());

    expect(res.statusCode).toBe(503);
    expect(res.headers["content-type"]).toContain("application/problem+json");
  });

  it("validates the request body", async () => {
    await build();

    const missing = await submit(report({ description: undefined }));
    const badEmail = await submit(report({ email: "nem-email" }));
    const blank = await submit(report({ title: "   " }));
    const emptyEmail = await submit(report({ email: "" }));

    expect(missing.statusCode).toBe(400);
    expect(badEmail.statusCode).toBe(400);
    expect(blank.statusCode).toBe(400);
    expect(emptyEmail.statusCode).toBe(202);
    expect(tracker.issues[0]!.labels).toEqual(["bug", "from-app"]);
  });

  it("silently drops submissions with a filled honeypot", async () => {
    await build();

    const res = await submit(report({ website: "https://spam.example" }));

    expect(res.statusCode).toBe(202);
    expect(res.json().issueNumber).toBeNull();
    expect(tracker.createIssue).not.toHaveBeenCalled();
  });

  it("verifies the Turnstile token with the client IP", async () => {
    const fetchFn = vi.fn<typeof fetch>(async (_url, init) => {
      const form = init?.body as URLSearchParams;
      return Response.json({
        success: form.get("response") === "good-token",
        "error-codes": [],
      });
    });
    await build({ turnstile: new TurnstileVerifier("ts-secret", fetchFn) });

    const missing = await submit(report());
    const invalid = await submit(report({ turnstileToken: "bad-token" }));
    const valid = await submit(report({ turnstileToken: "good-token" }));

    expect(missing.statusCode).toBe(400);
    expect(invalid.statusCode).toBe(400);
    expect(valid.statusCode).toBe(202);
    const form = fetchFn.mock.calls[1]![1]!.body as URLSearchParams;
    expect(form.get("secret")).toBe("ts-secret");
    expect(form.get("remoteip")).toBe("127.0.0.1");
  });

  it("returns the existing report for a repeated submission", async () => {
    await build();

    const first = await submit(report());
    const second = await submit(
      report({ description: "  a START gomb   nem csinál semmit. " }),
    );

    expect(second.json()).toEqual(first.json());
    expect(tracker.createIssue).toHaveBeenCalledTimes(1);
  });

  it("limits submissions per IP", async () => {
    await build({ bugReportRateLimit: { max: 2, timeWindow: "1 hour" } });

    const results = [];
    for (let i = 0; i < 3; i++) {
      results.push(await submit(report({ title: `Hiba ${i}` })));
    }

    expect(results.map((r) => r.statusCode)).toEqual([202, 202, 429]);
    expect(results[2]!.headers["content-type"]).toContain(
      "application/problem+json",
    );
  });

  it("keeps the report pending and retries when GitHub fails", async () => {
    await build();
    tracker.failing = true;

    const res = await submit(report());
    expect(res.json().issueNumber).toBeNull();

    tracker.failing = false;
    await app.bugReports.jobs.runFrequent();
    expect(tracker.createIssue).toHaveBeenCalledTimes(1);

    advance(1);
    await app.bugReports.jobs.runFrequent();
    await expect(repository.findById(res.json().id)).resolves.toMatchObject({
      githubStatus: "created",
      issueNumber: 100,
    });
  });

  it("sends a fixed mail once, only after the address is confirmed", async () => {
    await build();
    await submit(report({ email: "jatekos@example.com" }));

    await app.bugReports.jobs.sendDueMails();
    expect(mailer.sent).toHaveLength(1);
    const [confirm] = mailer.sent;
    expect(confirm).toMatchObject({
      to: "jatekos@example.com",
      subject: "Megkaptuk a hibabejelentésedet: Nem indul a kampány",
    });
    const token = tokenFrom(confirm!, "confirm");
    expect(confirm!.text).toContain(
      `https://kampanykorut.hu/api/v1/bug-reports/confirm/${token}`,
    );

    const page = await app.inject({
      method: "GET",
      url: `/api/v1/bug-reports/confirm/${token}`,
    });
    expect(page.statusCode).toBe(200);
    expect(page.headers["cache-control"]).toBe("no-store");
    expect(page.body).toContain('method="post"');
    await expect(
      repository.findByConfirmToken(hashToken(token)),
    ).resolves.toMatchObject({ confirmedAt: null });

    const confirmed = await app.inject({
      method: "POST",
      url: `/api/v1/bug-reports/confirm/${token}`,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      payload: "",
    });
    expect(confirmed.statusCode).toBe(200);
    expect(confirmed.body).toContain("Megerősítve");

    expect((await issueEvent("closed", 100, "completed")).statusCode).toBe(204);
    expect((await issueEvent("closed", 100, "completed")).statusCode).toBe(204);
    await app.bugReports.jobs.sendDueMails();

    expect(mailer.sent).toHaveLength(2);
    const fixed = mailer.sent[1]!;
    const unsubscribe = tokenFrom(fixed, "unsubscribe");
    expect(fixed.subject).toBe(
      "Kijavítottuk a bejelentett hibát: Nem indul a kampány",
    );
    expect(fixed.headers).toEqual({
      "List-Unsubscribe": `<https://kampanykorut.hu/api/v1/bug-reports/unsubscribe/${unsubscribe}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });

    await expect(
      repository.findByUnsubscribeToken(hashToken(unsubscribe)),
    ).resolves.toMatchObject({
      email: null,
      status: "fixed",
      notifications: [
        { type: "confirm", status: "sent" },
        { type: "fixed", status: "sent" },
      ],
    });

    const oneClick = await app.inject({
      method: "POST",
      url: `/api/v1/bug-reports/unsubscribe/${unsubscribe}`,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      payload: "List-Unsubscribe=One-Click",
    });
    expect(oneClick.statusCode).toBe(200);

    await issueEvent("reopened", 100, null);
    await issueEvent("closed", 100, "completed");
    await app.bugReports.jobs.sendDueMails();
    expect(mailer.sent).toHaveLength(2);
  });

  it("does not mail unconfirmed or not planned reports", async () => {
    await build();
    await submit(report({ email: "a@example.com" }));
    await submit(report({ title: "Más hiba", email: "b@example.com" }));
    await app.bugReports.jobs.sendDueMails();
    const confirmB = tokenFrom(mailer.sent[1]!, "confirm");
    await app.inject({
      method: "POST",
      url: `/api/v1/bug-reports/confirm/${confirmB}`,
    });

    await issueEvent("closed", 100, "completed");
    await issueEvent("closed", 101, "not_planned");
    await issueEvent("closed", 101, "completed", "someone/else");
    await app.bugReports.jobs.sendDueMails();

    expect(mailer.sent).toHaveLength(2);
  });

  it("backfills closures missed by the webhook", async () => {
    await build();
    await submit(report({ email: "a@example.com" }));
    await app.bugReports.jobs.sendDueMails();
    await app.inject({
      method: "POST",
      url: `/api/v1/bug-reports/confirm/${tokenFrom(mailer.sent[0]!, "confirm")}`,
    });
    tracker.listClosedWithContact.mockResolvedValue([
      { number: 100, outcome: "completed" },
      { number: 555, outcome: "completed" },
    ]);

    await app.bugReports.jobs.runDaily();
    await app.bugReports.jobs.sendDueMails();

    expect(tracker.listClosedWithContact).toHaveBeenCalledWith(
      new Date("2026-10-17T10:00:00Z"),
    );
    expect(mailer.sent.map((m) => m.subject)).toEqual([
      expect.stringMatching(/^Megkaptuk/),
      expect.stringMatching(/^Kijavítottuk/),
    ]);
  });

  it("retries failed mail with backoff and gives up after five attempts", async () => {
    await build();
    const { id } = (await submit(report({ email: "a@example.com" }))).json();
    mailer.failing = true;

    for (let i = 0; i < MAX_MAIL_ATTEMPTS; i++) {
      await app.bugReports.jobs.sendDueMails();
      advance(60);
    }

    await expect(repository.findById(id)).resolves.toMatchObject({
      notifications: [
        {
          type: "confirm",
          status: "failed",
          attempts: MAX_MAIL_ATTEMPTS,
          lastError: "SMTP unavailable",
        },
      ],
    });
  });

  it("limits confirmation mails per address per day", async () => {
    await build();

    for (let i = 0; i < 4; i++) {
      await submit(report({ title: `Hiba ${i}`, email: "a@example.com" }));
    }

    expect(tracker.issues.map((issue) => issue.labels.length)).toEqual([
      3, 3, 3, 2,
    ]);
  });

  it("shows an error page for unknown or expired links", async () => {
    await build();
    const unknown = "A".repeat(43);

    const confirm = await app.inject({
      method: "POST",
      url: `/api/v1/bug-reports/confirm/${unknown}`,
    });
    const unsubscribe = await app.inject({
      method: "GET",
      url: `/api/v1/bug-reports/unsubscribe/${unknown}`,
    });
    const malformed = await app.inject({
      method: "GET",
      url: "/api/v1/bug-reports/confirm/short",
    });

    expect(confirm.statusCode).toBe(404);
    expect(confirm.body).toContain("Érvénytelen vagy lejárt link");
    expect(unsubscribe.statusCode).toBe(404);
    expect(malformed.statusCode).toBe(400);
  });
});
