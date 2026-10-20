import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import fp from "fastify-plugin";
import { Type } from "typebox";

type ReadinessCheck = () => Promise<void>;

declare module "fastify" {
  interface FastifyInstance {
    addReadinessCheck(name: string, check: ReadinessCheck): void;
  }
}

const CHECK_TIMEOUT_MS = 2000;

function withTimeout(check: ReadinessCheck): Promise<void> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Timed out after ${CHECK_TIMEOUT_MS} ms`)),
      CHECK_TIMEOUT_MS,
    );
  });

  return Promise.race([check(), timeout]).finally(() => clearTimeout(timer));
}

const HealthResponse = Type.Object({
  status: Type.Literal("ok"),
  version: Type.String(),
  commit: Type.String(),
  uptime: Type.Number({ description: "Process uptime in seconds" }),
});

const CheckResult = Type.Union([Type.Literal("ok"), Type.Literal("fail")]);

const ReadyResponse = Type.Object({
  status: Type.Union([Type.Literal("ready"), Type.Literal("not_ready")]),
  checks: Type.Record(Type.String(), CheckResult),
});

const routes: FastifyPluginAsyncTypebox = async (app) => {
  const checks = new Map<string, ReadinessCheck>();

  app.decorate("addReadinessCheck", (name: string, check: ReadinessCheck) => {
    checks.set(name, check);
  });

  app.get(
    "/health",
    {
      schema: {
        tags: ["health"],
        summary: "Liveness probe",
        response: { 200: HealthResponse },
      },
    },
    async () => ({
      status: "ok" as const,
      version: app.config.version,
      commit: app.config.gitCommit,
      uptime: process.uptime(),
    }),
  );

  app.get(
    "/ready",
    {
      schema: {
        tags: ["health"],
        summary: "Readiness probe: every registered dependency is reachable",
        response: { 200: ReadyResponse, 503: ReadyResponse },
      },
    },
    async (request, reply) => {
      const results: Record<string, "ok" | "fail"> = {};

      await Promise.all(
        [...checks].map(async ([name, check]) => {
          try {
            await withTimeout(check);
            results[name] = "ok";
          } catch (err) {
            request.log.warn({ err, check: name }, "Readiness check failed");
            results[name] = "fail";
          }
        }),
      );

      const ready = Object.values(results).every((r) => r === "ok");

      return reply.status(ready ? 200 : 503).send({
        status: ready ? "ready" : "not_ready",
        checks: results,
      });
    },
  );
};

export const healthRoutes = fp(routes, { name: "health" });
