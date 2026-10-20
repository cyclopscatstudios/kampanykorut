import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import type { TurnstileVerifier } from "../../integrations/turnstile/turnstile";
import {
  BUG_LABEL,
  type BugReportTracker,
  FROM_APP_LABEL,
  HAS_CONTACT_LABEL,
  type NewIssue,
} from "./bug-reports.github";
import type {
  BugReportEnvironment,
  BugReportRecord,
  BugReportRepository,
  ClosureResult,
  IssueOutcome,
} from "./bug-reports.repository";

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const DUPLICATE_WINDOW_MS = DAY_MS;
const CONFIRM_MAILS_PER_EMAIL_PER_DAY = 3;
const ISSUE_RETRY_MAX_DELAY_MS = 6 * 60 * MINUTE_MS;
const ISSUE_RETRY_BATCH = 10;

export const CONFIRM_TOKEN_TTL_MS = 7 * DAY_MS;

export interface BugReportInput {
  title: string;
  description: string;
  steps?: string;
  email?: string;
  environment: BugReportEnvironment;
  turnstileToken?: string;
  website?: string;
}

export interface SubmitResult {
  id: string;
  issueNumber: number | null;
}

export class BugReportError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "BugReportError";
  }
}

export interface BugReportServiceOptions {
  repository: BugReportRepository;
  tracker: BugReportTracker | null;
  turnstile: TurnstileVerifier | null;
  ipSalt: string;
  log: FastifyBaseLogger;
  now?: () => Date;
}

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const createToken = () => randomBytes(32).toString("base64url");

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const PHONE_PATTERN = /(?<![\w.])(?:\+|00|06)[\d\s\-/().]{7,}\d/g;

export function redactContacts(text: string): string {
  return text
    .replace(EMAIL_PATTERN, "[email cím eltávolítva]")
    .replace(PHONE_PATTERN, (match) => {
      const digits = match.replace(/\D/g, "").length;
      return digits >= 9 && digits <= 15 ? "[telefonszám eltávolítva]" : match;
    });
}

const neutralizeMentions = (text: string) =>
  text.replace(/(^|[^\w`])@(?=[\w-])/g, "$1@​");

const normalize = (text: string) =>
  text.toLocaleLowerCase("hu").replace(/\s+/g, " ").trim();

export function formatIssue(report: BugReportRecord): NewIssue {
  const { environment: env } = report;
  const body = [
    "## Description",
    "",
    neutralizeMentions(report.description),
    "",
    "## Steps to Reproduce",
    "",
    neutralizeMentions(report.steps) || "-",
    "",
    "## Environment",
    "",
    `- Campaign: ${env.campaign || "-"}`,
    `- URL: ${env.url || "-"}`,
    `- Browser: ${env.browser || "-"}`,
    `- Version: ${env.version || "unknown"}`,
  ].join("\n");

  return {
    title: `[Bug]: ${neutralizeMentions(report.title)}`,
    body,
    labels: [
      BUG_LABEL,
      FROM_APP_LABEL,
      ...(report.email ? [HAS_CONTACT_LABEL] : []),
    ],
  };
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export class BugReportService {
  private readonly repository: BugReportRepository;
  private readonly tracker: BugReportTracker | null;
  private readonly turnstile: TurnstileVerifier | null;
  private readonly ipSalt: string;
  private readonly log: FastifyBaseLogger;
  private readonly now: () => Date;

  constructor(options: BugReportServiceOptions) {
    this.repository = options.repository;
    this.tracker = options.tracker;
    this.turnstile = options.turnstile;
    this.ipSalt = options.ipSalt;
    this.log = options.log;
    this.now = options.now ?? (() => new Date());
  }

  get acceptsReports(): boolean {
    return this.tracker !== null;
  }

  async submit(input: BugReportInput, ip: string): Promise<SubmitResult> {
    if (!this.tracker) {
      throw new BugReportError("Bug reporting is not configured", 503);
    }

    const title = input.title.trim();
    const description = input.description.trim();
    const steps = input.steps?.trim() ?? "";
    if (!title || !description) {
      throw new BugReportError("Title and description are required", 400);
    }

    if (input.website) {
      this.log.info("Dropped bug report with a filled honeypot field");
      return { id: randomUUID(), issueNumber: null };
    }

    await this.verifyTurnstile(input.turnstileToken, ip);

    const now = this.now();
    const contentHash = createHash("sha256")
      .update(`${normalize(title)}\n${normalize(description)}`)
      .digest("hex");

    const duplicate = await this.repository.findRecentByContentHash(
      contentHash,
      new Date(now.getTime() - DUPLICATE_WINDOW_MS),
    );
    if (duplicate) {
      this.log.info({ bugReportId: duplicate.id }, "Duplicate bug report");
      return { id: duplicate.id, issueNumber: duplicate.issueNumber };
    }

    const email = await this.acceptedEmail(input.email, now);

    const report: BugReportRecord = {
      id: randomUUID(),
      title: redactContacts(title),
      description: redactContacts(description),
      steps: redactContacts(steps),
      environment: input.environment,
      issueNumber: null,
      issueUrl: null,
      githubStatus: "pending",
      attempts: 0,
      lastError: null,
      nextAttemptAt: now,
      status: "open",
      email,
      confirmTokenHash: null,
      confirmExpiresAt: null,
      confirmedAt: null,
      unsubscribeTokenHash: null,
      unsubscribedAt: null,
      notifications: email
        ? [
            {
              type: "confirm",
              status: "queued",
              queuedAt: now,
              nextAttemptAt: now,
              sentAt: null,
              messageId: null,
              attempts: 0,
              lastError: null,
            },
          ]
        : [],
      contentHash,
      ipHash: this.hashIp(ip),
      createdAt: now,
    };

    await this.repository.insert(report);

    return { id: report.id, issueNumber: await this.createIssue(report) };
  }

  async retryPendingIssues(): Promise<number> {
    if (!this.tracker) return 0;

    const pending = await this.repository.listPendingIssues(
      this.now(),
      ISSUE_RETRY_BATCH,
    );
    let created = 0;
    for (const report of pending) {
      if ((await this.createIssue(report)) !== null) created++;
    }
    return created;
  }

  findConfirmable(token: string) {
    return this.repository.findByConfirmToken(hashToken(token));
  }

  confirm(token: string) {
    return this.repository.confirm(hashToken(token), this.now());
  }

  findUnsubscribable(token: string) {
    return this.repository.findByUnsubscribeToken(hashToken(token));
  }

  unsubscribe(token: string) {
    return this.repository.unsubscribe(hashToken(token), this.now());
  }

  async applyIssueOutcome(
    issueNumber: number,
    outcome: IssueOutcome,
  ): Promise<ClosureResult> {
    const result = await this.repository.applyIssueOutcome(
      issueNumber,
      outcome,
      this.now(),
    );
    if (result.found) {
      this.log.info(
        { issueNumber, outcome, fixedMailQueued: result.fixedMailQueued },
        "Bug report issue state changed",
      );
    }
    return result;
  }

  private async createIssue(report: BugReportRecord): Promise<number | null> {
    if (!this.tracker) return null;

    try {
      const issue = await this.tracker.createIssue(formatIssue(report));
      await this.repository.markIssueCreated(report.id, issue);
      return issue.number;
    } catch (err) {
      const delay = Math.min(
        2 ** report.attempts * MINUTE_MS,
        ISSUE_RETRY_MAX_DELAY_MS,
      );
      await this.repository.markIssueFailed(
        report.id,
        errorMessage(err),
        new Date(this.now().getTime() + delay),
      );
      this.log.error(
        { err, bugReportId: report.id, attempts: report.attempts + 1 },
        "Creating the GitHub issue failed",
      );
      return null;
    }
  }

  private async verifyTurnstile(token: string | undefined, ip: string) {
    if (!this.turnstile) return;
    if (!token) {
      throw new BugReportError("Missing Turnstile token", 400);
    }

    const result = await this.turnstile.verify(token, ip).catch((err) => {
      this.log.error({ err }, "Turnstile verification failed");
      throw new BugReportError("Turnstile verification unavailable", 503);
    });

    if (!result.success) {
      this.log.info(
        { errorCodes: result.errorCodes },
        "Rejected bug report with an invalid Turnstile token",
      );
      throw new BugReportError("Turnstile verification failed", 400);
    }
  }

  private async acceptedEmail(
    email: string | undefined,
    now: Date,
  ): Promise<string | null> {
    const normalized = email?.trim().toLowerCase();
    if (!normalized) return null;

    const recent = await this.repository.countWithEmailSince(
      normalized,
      new Date(now.getTime() - DAY_MS),
    );
    if (recent >= CONFIRM_MAILS_PER_EMAIL_PER_DAY) {
      this.log.info("Daily confirmation limit reached for an email address");
      return null;
    }
    return normalized;
  }

  private hashIp(ip: string): string {
    return createHash("sha256").update(`${this.ipSalt}:${ip}`).digest("hex");
  }
}
