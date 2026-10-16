import { randomUUID } from "node:crypto";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
  LogController,
} from "fastify";
import type { AppConfig } from "./config/env";
import { GithubClient } from "./integrations/github/github-client";
import { githubWebhooks } from "./integrations/github/webhooks";
import {
  type ObjectStorage,
  S3ObjectStorage,
} from "./integrations/storage/object-storage";
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
}

const BODY_LIMIT_BYTES = 2 * 1024 * 1024;
const PROBE_URLS = new Set(["/health", "/ready"]);

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
    trustProxy: config.trustProxy,
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

  const storage =
    deps.objectStorage ??
    (config.storage ? new S3ObjectStorage(config.storage) : null);
  if (storage) {
    app.addReadinessCheck("storage", () => storage.check());
  }

  if (config.github?.webhookSecret) {
    await app.register(githubWebhooks, {
      secret: config.github.webhookSecret,
    });
  }

  await app.register(newsModule, {
    repository: deps.newsRepository ?? (await createNewsRepository(app)),
    sync: config.github
      ? {
          source:
            deps.newsSource ??
            new NewsGithubSource(
              new GithubClient(config.github),
              config.github.newsCategory,
            ),
          content: new NewsContentProcessor(
            storage
              ? new NewsImageCopier(storage, app.log.child({ module: "news" }))
              : null,
          ),
          repo: config.github.repo,
          intervalMs:
            config.env === "test" ? null : config.github.newsSyncIntervalMs,
        }
      : null,
  });

  return app;
}

async function createNewsRepository(
  app: FastifyInstance,
): Promise<NewsRepository> {
  if (!app.config.mongoUri) {
    app.log.warn("MONGODB_URI is not set, news are kept in memory");
    return new InMemoryNewsRepository();
  }

  await app.register(mongo, { uri: app.config.mongoUri });
  const repository = new MongoNewsRepository(app.mongo);
  await repository.init();
  return repository;
}

export type App = Awaited<ReturnType<typeof buildApp>>;
