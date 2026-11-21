import fp from "fastify-plugin";
import type { PlayTimeRepository } from "./play-time.repository";
import { type PlayTimeRateLimit, playTimeRoutes } from "./play-time.routes";
import { PlayTimeService } from "./play-time.service";

export interface PlayTimeModuleOptions {
  repository: PlayTimeRepository;
  rateLimit: PlayTimeRateLimit;
  now?: () => Date;
}

export const playTimeModule = fp<PlayTimeModuleOptions>(
  async (app, options) => {
    const service = new PlayTimeService({
      repository: options.repository,
      log: app.log.child({ module: "play-time" }),
      now: options.now,
    });

    await app.register(
      playTimeRoutes(service, { rateLimit: options.rateLimit }),
    );
  },
  { name: "play-time" },
);
