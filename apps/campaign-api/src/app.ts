import { randomUUID } from "node:crypto";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, { type FastifyServerOptions, LogController } from "fastify";
import type { AppConfig } from "./config/env";
import { healthRoutes } from "./modules/health/health.routes";
import { problemDetails } from "./plugins/problem-details";
import { openApi } from "./plugins/swagger";

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
  }
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

export async function buildApp(config: AppConfig) {
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

  return app;
}

export type App = Awaited<ReturnType<typeof buildApp>>;
