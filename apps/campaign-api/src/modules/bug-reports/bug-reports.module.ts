import fp from "fastify-plugin";
import { z } from "zod";
import type { TurnstileVerifier } from "../../integrations/turnstile/turnstile";
import { type BugReportTracker, closedOutcome } from "./bug-reports.github";
import { BugReportJobs } from "./bug-reports.jobs";
import type { Mailer } from "./bug-reports.mailer";
import { bugReportPages } from "./bug-reports.pages";
import type {
  BugReportRepository,
  IssueOutcome,
} from "./bug-reports.repository";
import { type BugReportRateLimit, bugReportRoutes } from "./bug-reports.routes";
import { BugReportService } from "./bug-reports.service";

export interface BugReportsModuleOptions {
  repository: BugReportRepository;
  tracker: BugReportTracker | null;
  turnstile: TurnstileVerifier | null;
  mailer: Mailer | null;
  ipSalt: string;
  siteUrl: string;
  repo: { owner: string; name: string } | null;
  rateLimit: BugReportRateLimit;
  schedule: { frequentMs: number; dailyMs: number } | null;
  now?: () => Date;
}

declare module "fastify" {
  interface FastifyInstance {
    bugReports: { service: BugReportService; jobs: BugReportJobs };
  }
}

const IssuesEventSchema = z.object({
  action: z.string(),
  issue: z.object({
    number: z.number().int(),
    state_reason: z.string().nullish(),
  }),
  repository: z.object({ full_name: z.string() }),
});

function eventOutcome(
  action: string,
  stateReason: string | null | undefined,
): IssueOutcome | null {
  if (action === "reopened") return "reopened";
  if (action === "closed") return closedOutcome(stateReason);
  return null;
}

export const bugReportsModule = fp<BugReportsModuleOptions>(
  async (app, options) => {
    const log = app.log.child({ module: "bug-reports" });
    const service = new BugReportService({
      repository: options.repository,
      tracker: options.tracker,
      turnstile: options.turnstile,
      ipSalt: options.ipSalt,
      log,
      now: options.now,
    });
    const jobs = new BugReportJobs({
      service,
      repository: options.repository,
      tracker: options.tracker,
      mailer: options.mailer,
      siteUrl: options.siteUrl,
      log,
      now: options.now,
    });
    app.decorate("bugReports", { service, jobs });

    await app.register(
      bugReportRoutes(service, { rateLimit: options.rateLimit }),
    );
    await app.register(bugReportPages(service, { now: options.now }));

    if (options.repo && app.hasDecorator("onGithubEvent")) {
      const fullName =
        `${options.repo.owner}/${options.repo.name}`.toLowerCase();

      app.onGithubEvent("issues", async (payload, { log: eventLog }) => {
        const event = IssuesEventSchema.safeParse(payload);
        if (!event.success) {
          eventLog.warn(
            { issues: event.error.issues },
            "Unexpected issues payload",
          );
          return;
        }
        if (event.data.repository.full_name.toLowerCase() !== fullName) return;

        const outcome = eventOutcome(
          event.data.action,
          event.data.issue.state_reason,
        );
        if (!outcome) return;

        await service.applyIssueOutcome(event.data.issue.number, outcome);
      });
    }

    const { schedule, mailer } = options;
    if (!schedule) return;

    const timers: NodeJS.Timeout[] = [];
    const every = (ms: number, label: string, run: () => Promise<unknown>) => {
      let running = false;
      const tick = () => {
        if (running) return;
        running = true;
        run()
          .catch((err: unknown) => log.error({ err }, `${label} failed`))
          .finally(() => {
            running = false;
          });
      };
      tick();
      const timer = setInterval(tick, ms);
      timer.unref();
      timers.push(timer);
    };

    app.addHook("onReady", async () => {
      mailer
        ?.verify()
        .then(() => log.info("SMTP connection verified"))
        .catch((err: unknown) =>
          log.warn({ err }, "SMTP connection check failed"),
        );

      every(schedule.frequentMs, "Bug report outbox", () => jobs.runFrequent());
      every(schedule.dailyMs, "Bug report daily job", () => jobs.runDaily());
    });

    app.addHook("onClose", async () => {
      for (const timer of timers) clearInterval(timer);
      mailer?.close?.();
    });
  },
  { name: "bug-reports" },
);
