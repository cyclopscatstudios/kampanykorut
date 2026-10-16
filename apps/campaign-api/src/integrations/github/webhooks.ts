import { createHmac, timingSafeEqual } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import fp from "fastify-plugin";

export interface GithubWebhookContext {
  deliveryId: string;
  log: FastifyBaseLogger;
}

export type GithubWebhookHandler = (
  payload: unknown,
  context: GithubWebhookContext,
) => Promise<void>;

declare module "fastify" {
  interface FastifyInstance {
    onGithubEvent(event: string, handler: GithubWebhookHandler): void;
  }
}

export const GITHUB_WEBHOOK_PATH = "/webhooks/github";
const WEBHOOK_BODY_LIMIT_BYTES = 10 * 1024 * 1024;

export function signGithubPayload(secret: string, body: string | Buffer) {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

function isValidSignature(
  secret: string,
  body: Buffer,
  signature: string | undefined,
): boolean {
  if (!signature) return false;
  const expected = Buffer.from(signGithubPayload(secret, body));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function header(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export const githubWebhooks = fp<{ secret: string }>(
  async (app, { secret }) => {
    const handlers = new Map<string, GithubWebhookHandler[]>();

    app.decorate(
      "onGithubEvent",
      (event: string, handler: GithubWebhookHandler) => {
        handlers.set(event, [...(handlers.get(event) ?? []), handler]);
      },
    );

    await app.register(async (scope) => {
      scope.removeContentTypeParser("application/json");
      scope.addContentTypeParser(
        "application/json",
        { parseAs: "buffer" },
        (_request, body, done) => done(null, body),
      );

      scope.post(
        GITHUB_WEBHOOK_PATH,
        {
          bodyLimit: WEBHOOK_BODY_LIMIT_BYTES,
          schema: { hide: true },
        },
        async (request, reply) => {
          const body = request.body;
          if (!Buffer.isBuffer(body)) {
            return reply
              .status(415)
              .send({ message: "Expected application/json" });
          }

          if (
            !isValidSignature(
              secret,
              body,
              header(request.headers["x-hub-signature-256"]),
            )
          ) {
            request.log.warn("Rejected GitHub webhook with invalid signature");
            return reply.status(401).send({ message: "Invalid signature" });
          }

          let payload: unknown;
          try {
            payload = JSON.parse(body.toString("utf8"));
          } catch {
            return reply.status(400).send({ message: "Invalid JSON" });
          }

          const event = header(request.headers["x-github-event"]) ?? "";
          const deliveryId =
            header(request.headers["x-github-delivery"]) ?? "unknown";
          const log = request.log.child({ githubEvent: event, deliveryId });
          const eventHandlers = handlers.get(event) ?? [];

          for (const handler of eventHandlers) {
            await handler(payload, { deliveryId, log });
          }

          return reply.status(eventHandlers.length ? 204 : 202).send();
        },
      );
    });
  },
  { name: "github-webhooks" },
);
