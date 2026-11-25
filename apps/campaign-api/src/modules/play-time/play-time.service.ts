import type { FastifyBaseLogger } from "fastify";
import { applyPlayTimeEvent, type PlayTimeEvent } from "./play-time";
import type { PlayTimeRepository } from "./play-time.repository";

const MAX_SAVE_ATTEMPTS = 3;

export class PlayTimeService {
  private readonly repository: PlayTimeRepository;
  private readonly log: FastifyBaseLogger;
  private readonly now: () => Date;

  constructor(options: {
    repository: PlayTimeRepository;
    log: FastifyBaseLogger;
    now?: () => Date;
  }) {
    this.repository = options.repository;
    this.log = options.log;
    this.now = options.now ?? (() => new Date());
  }

  async record(event: PlayTimeEvent): Promise<void> {
    for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt++) {
      const current = await this.repository.findBySessionId(event.sessionId);
      const next = applyPlayTimeEvent(current, event, this.now());
      if (!next) return;

      const saved = await this.repository.save(
        current ? { ...next, revision: current.revision + 1 } : next,
      );
      if (saved) return;
    }

    this.log.warn(
      { sessionId: event.sessionId, type: event.type },
      "Play time event dropped after concurrent updates",
    );
  }
}
