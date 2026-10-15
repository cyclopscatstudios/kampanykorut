import { randomUUID } from "node:crypto";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, { type FastifyServerOptions, LogController } from "fastify";
import type { AppConfig } from "./config/env";
import { GithubClient } from "./integrations/github/github-client";
import { githubWebhooks } from "./integrations/github/webhooks";
import { healthRoutes } from "./modules/health/health.routes";
import { NewsGithubSource } from "./modules/news/news.github";
import { newsModule } from "./modules/news/news.module";
import {
  InMemoryNewsRepository,
  type NewsRepository,
} from "./modules/news/news.repository";
import type { NewsSource } from "./modules/news/news.sync";
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

  if (config.github) {
    const github = new GithubClient(config.github);

    if (config.github.webhookSecret) {
      await app.register(githubWebhooks, {
        secret: config.github.webhookSecret,
      });
    }

    await app.register(newsModule, {
      source:
        deps.newsSource ??
        new NewsGithubSource(github, config.github.newsCategory),
      repository: deps.newsRepository ?? new InMemoryNewsRepository(),
      repo: config.github.repo,
      syncIntervalMs:
        config.env === "test" ? null : config.github.newsSyncIntervalMs,
    });
  }

  return app;
}

export type App = Awaited<ReturnType<typeof buildApp>>;
