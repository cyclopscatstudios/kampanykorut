import rateLimit from "@fastify/rate-limit";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "typebox";
import { PLAY_TIME_EVENT_TYPES } from "../../../../../shared/types/play-time";
import type { PlayTimeService } from "./play-time.service";

export const PLAY_TIME_PATH = "/api/v1/play-time";

export interface PlayTimeRateLimit {
  max: number;
  timeWindow: number | string;
}

const Params = Type.Object({
  sessionId: Type.String({ pattern: "^[A-Za-z0-9-]{8,64}$" }),
});

const EventBody = Type.Object({
  type: Type.Union(PLAY_TIME_EVENT_TYPES.map((type) => Type.Literal(type))),
  campaignId: Type.String({ minLength: 1, maxLength: 200 }),
});

export function playTimeRoutes(
  service: PlayTimeService,
  { rateLimit: limit }: { rateLimit: PlayTimeRateLimit },
): FastifyPluginAsyncTypebox {
  return async (app) => {
    await app.register(rateLimit, { global: false });

    app.post(
      `${PLAY_TIME_PATH}/:sessionId/events`,
      {
        config: { rateLimit: limit },
        schema: {
          tags: ["play-time"],
          summary:
            "Record a play time event; the server measures the active time between events",
          params: Params,
          body: EventBody,
          response: { 204: Type.Null() },
        },
      },
      async (request, reply) => {
        await service.record({
          sessionId: request.params.sessionId,
          campaignId: request.body.campaignId,
          type: request.body.type,
        });
        return reply.status(204).send(null);
      },
    );
  };
}
