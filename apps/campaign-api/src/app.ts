import { randomBytes, randomUUID } from "node:crypto";
import path from "node:path";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
  LogController,
} from "fastify";
import type { Connection } from "mongoose";
import type { AppConfig } from "./config/env";
import { GithubClient } from "./integrations/github/github-client";
import { githubWebhooks } from "./integrations/github/webhooks";
import {
  localAssets,
  LocalObjectStorage,
} from "./integrations/storage/local-storage";
import {
  type ObjectStorage,
  S3ObjectStorage,
} from "./integrations/storage/object-storage";
import { TurnstileVerifier } from "./integrations/turnstile/turnstile";
import {
  type BugReportTracker,
  GithubBugReportTracker,
} from "./modules/bug-reports/bug-reports.github";
import {
  type Mailer,
  SmtpMailer,
} from "./modules/bug-reports/bug-reports.mailer";
import { bugReportsModule } from "./modules/bug-reports/bug-reports.module";
import {
  type BugReportRepository,
  InMemoryBugReportRepository,
} from "./modules/bug-reports/bug-reports.repository";
import { MongoBugReportRepository } from "./modules/bug-reports/bug-reports.repository.mongo";
import type { BugReportRateLimit } from "./modules/bug-reports/bug-reports.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { NewsContentProcessor } from "./modules/news/news.content";
import { NewsGithubSource } from "./modules/news/news.github";
import { NewsImageCopier } from "./modules/news/news.images";
import { newsModule } from "./modules/news/news.module";
import {
  InMemoryNewsRepository,
  type NewsRepository,
} from "./modules/news/news.repository";
import { MongoNewsRepository } from "./modules/news/news.repository.mongo";
import type { NewsSource } from "./modules/news/news.sync";
import { mongo } from "./plugins/mongo";
import { problemDetails } from "./plugins/problem-details";
import { openApi } from "./plugins/swagger";

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
  }
}

export interface AppDeps {
  newsSource?: NewsSource;
  newsRepository?: NewsRepository;
  objectStorage?: ObjectStorage;
  bugReportRepository?: BugReportRepository;
  bugReportTracker?: BugReportTracker | null;
  bugReportRateLimit?: BugReportRateLimit;
  turnstile?: TurnstileVerifier | null;
  mailer?: Mailer | null;
  now?: () => Date;
}

const LOCAL_ASSETS_DIR = ".data/assets";
const BODY_LIMIT_BYTES = 2 * 1024 * 1024;
const PROBE_URLS = new Set(["/health", "/ready"]);
const BUG_REPORT_RATE_LIMIT: BugReportRateLimit = {
  max: 5,
  timeWindow: "1 hour",
};
const BUG_REPORT_OUTBOX_INTERVAL_MS = 60_000;
const BUG_REPORT_DAILY_INTERVAL_MS = 24 * 60 * 60_000;

export function trustProxyOption(trustProxy: boolean | number) {
  if (typeof trustProxy === "boolean") return trustProxy;
  return (_address: string, hop: number) => hop < trustProxy;
}

function loggerOptions(config: AppConfig): FastifyServerOptions["logger"] {
  if (config.env === "development") {
    return {
      level: config.logLevel,
      transport: { target: "pino-pretty", options: { translateTime: true } },
    };
  }

  return { level: config.logLevel };
}

export async function buildApp(config: AppConfig, deps: AppDeps = {}) {
  const app = Fastify({
    logger: loggerOptions(config),
    genReqId: () => randomUUID(),
    requestIdHeader: "x-request-id",
    logController: new LogController({
      requestIdLogLabel: "requestId",
      disableRequestLogging: (request) => PROBE_URLS.has(request.url),
    }),
    trustProxy: trustProxyOption(config.trustProxy),
    bodyLimit: BODY_LIMIT_BYTES,
  }).withTypeProvider<TypeBoxTypeProvider>();

  app.decorate("config", config);

  app.addHook("onSend", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  await app.register(problemDetails);

  if (config.docsEnabled) {
    await app.register(openApi);
  }

  await app.register(healthRoutes);

  const storage = deps.objectStorage ?? createObjectStorage(config);
  if (storage) {
    app.addReadinessCheck("storage", () => storage.check());
  }
  if (storage instanceof LocalObjectStorage) {
    await app.register(localAssets, { storage });
  }

  if (config.github?.webhookSecret) {
    await app.register(githubWebhooks, {
      secret: config.github.webhookSecret,
    });
  }

  const github = config.github ? new GithubClient(config.github) : null;

  await app.register(newsModule, {
    repository: deps.newsRepository ?? (await createNewsRepository(app)),
    cacheControl: config.env === "development" ? "no-cache" : undefined,
    siteUrl: config.siteUrl,
    sync:
      config.github && github
        ? {
            source:
              deps.newsSource ??
              new NewsGithubSource(github, config.github.newsCategory),
            content: new NewsContentProcessor(
              storage
                ? new NewsImageCopier(
                    storage,
                    app.log.child({ module: "news" }),
                  )
                : null,
            ),
            repo: config.github.repo,
            intervalMs:
              config.env === "test" ? null : config.github.newsSyncIntervalMs,
          }
        : null,
  });

  await app.register(bugReportsModule, {
    repository:
      deps.bugReportRepository ?? (await createBugReportRepository(app)),
    tracker:
      deps.bugReportTracker !== undefined
        ? deps.bugReportTracker
        : github && new GithubBugReportTracker(github),
    turnstile:
      deps.turnstile !== undefined
        ? deps.turnstile
        : config.bugReports.turnstileSecret
          ? new TurnstileVerifier(config.bugReports.turnstileSecret)
          : null,
    mailer:
      deps.mailer !== undefined
        ? deps.mailer
        : config.mail && new SmtpMailer(config.mail),
    ipSalt: bugReportIpSalt(app),
    siteUrl: config.siteUrl,
    repo: config.github?.repo ?? null,
    rateLimit: deps.bugReportRateLimit ?? BUG_REPORT_RATE_LIMIT,
    schedule:
      config.env === "test"
        ? null
        : {
            frequentMs: BUG_REPORT_OUTBOX_INTERVAL_MS,
            dailyMs: BUG_REPORT_DAILY_INTERVAL_MS,
          },
    now: deps.now,
  });

  warnAboutBugReportSetup(app);

  return app;
}

function createObjectStorage(config: AppConfig): ObjectStorage | null {
  if (config.storage) {
    return new S3ObjectStorage(config.storage);
  }
  if (config.assetsDir) {
    return new LocalObjectStorage(path.resolve(config.assetsDir));
  }
  if (config.env === "development") {
    return new LocalObjectStorage(path.resolve(LOCAL_ASSETS_DIR));
  }
  return null;
}

async function mongoConnection(
  app: FastifyInstance,
): Promise<Connection | null> {
  if (!app.config.mongoUri) return null;
  if (!app.hasDecorator("mongo")) {
    await app.register(mongo, { uri: app.config.mongoUri });
  }
  return app.mongo;
}

async function createNewsRepository(
  app: FastifyInstance,
): Promise<NewsRepository> {
  const connection = await mongoConnection(app);
  if (!connection) {
    app.log.warn("MONGODB_URI is not set, news are kept in memory");
    return new InMemoryNewsRepository();
  }

  const repository = new MongoNewsRepository(connection);
  await repository.init();
  return repository;
}

async function createBugReportRepository(
  app: FastifyInstance,
): Promise<BugReportRepository> {
  const connection = await mongoConnection(app);
  if (!connection) {
    app.log.warn("MONGODB_URI is not set, bug reports are kept in memory");
    return new InMemoryBugReportRepository();
  }

  const repository = new MongoBugReportRepository(connection);
  await repository.init();
  return repository;
}

function bugReportIpSalt(app: FastifyInstance): string {
  if (app.config.bugReports.ipSalt) return app.config.bugReports.ipSalt;
  if (app.config.env !== "test") {
    app.log.warn(
      "BUG_REPORT_IP_SALT is not set, using a random salt until restart",
    );
  }
  return randomBytes(32).toString("hex");
}

function warnAboutBugReportSetup(app: FastifyInstance) {
  const { config } = app;
  if (config.env === "test") return;

  if (!config.github) {
    app.log.warn("GitHub App is not configured, bug reports answer 503");
    return;
  }
  if (!config.mail) {
    app.log.warn(
      "SMTP_USER / SMTP_APP_PASSWORD are not set, bug report emails are not sent",
    );
  }
  if (!config.bugReports.turnstileSecret) {
    app.log.warn(
      "TURNSTILE_SECRET_KEY is not set, bug reports are accepted without a captcha",
    );
  }
}

export type App = Awaited<ReturnType<typeof buildApp>>;
