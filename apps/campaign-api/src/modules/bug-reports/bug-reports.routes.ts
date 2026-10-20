import rateLimit from "@fastify/rate-limit";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "typebox";
import type { BugReportService } from "./bug-reports.service";
import { BUG_REPORTS_PATH } from "./bug-reports.templates";

export interface BugReportRateLimit {
  max: number;
  timeWindow: number | string;
}

const EnvironmentSchema = Type.Object({
  campaign: Type.String({ maxLength: 200, default: "" }),
  url: Type.String({ maxLength: 2000, default: "" }),
  browser: Type.String({ maxLength: 500, default: "" }),
  version: Type.String({ maxLength: 50, default: "" }),
});

const SubmitBody = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 120 }),
  description: Type.String({ minLength: 1, maxLength: 5000 }),
  steps: Type.Optional(Type.String({ maxLength: 5000 })),
  email: Type.Optional(
    Type.Union([
      Type.Literal(""),
      Type.String({ format: "email", maxLength: 254 }),
    ]),
  ),
  environment: EnvironmentSchema,
  turnstileToken: Type.Optional(Type.String({ maxLength: 2048 })),
  website: Type.Optional(Type.String({ maxLength: 200 })),
});

const SubmitResponse = Type.Object({
  id: Type.String(),
  issueNumber: Type.Union([Type.Integer(), Type.Null()]),
});

export function bugReportRoutes(
  service: BugReportService,
  { rateLimit: limit }: { rateLimit: BugReportRateLimit },
): FastifyPluginAsyncTypebox {
  return async (app) => {
    await app.register(rateLimit, { global: false });

    app.post(
      BUG_REPORTS_PATH,
      {
        config: { rateLimit: limit },
        schema: {
          tags: ["bug-reports"],
          summary:
            "Report a bug; opens a GitHub issue and optionally emails the reporter",
          body: SubmitBody,
          response: { 202: SubmitResponse },
        },
      },
      async (request, reply) => {
        const result = await service.submit(request.body, request.ip);
        return reply.status(202).send(result);
      },
    );
  };
}
