import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { type Connection } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PlayTimeRecord } from "./play-time";
import {
  InMemoryPlayTimeRepository,
  type PlayTimeRepository,
} from "./play-time.repository";
import { MongoPlayTimeRepository } from "./play-time.repository.mongo";

let server: MongoMemoryServer;
let connection: Connection;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  connection = await mongoose.createConnection(server.getUri()).asPromise();
}, 120_000);

afterAll(async () => {
  await connection?.close();
  await server?.stop();
});

const STARTED_AT = new Date("2026-11-20T10:00:00Z");

const record = (overrides: Partial<PlayTimeRecord> = {}): PlayTimeRecord => ({
  sessionId: "session-1",
  campaignId: "2026",
  status: "active",
  activeMs: 0,
  segments: 1,
  startedAt: STARTED_AT,
  lastActiveAt: STARTED_AT,
  finishedAt: null,
  revision: 0,
  ...overrides,
});

describe.each([
  ["in-memory", async () => new InMemoryPlayTimeRepository()],
  [
    "mongo",
    async () => {
      await connection.dropDatabase();
      const repository = new MongoPlayTimeRepository(connection);
      await repository.init();
      return repository;
    },
  ],
] as const)("%s PlayTimeRepository", (_name, create) => {
  let repository: PlayTimeRepository;

  beforeEach(async () => {
    repository = await create();
  });

  it("inserts and updates a session by revision", async () => {
    expect(await repository.findBySessionId("session-1")).toBeNull();

    expect(await repository.save(record())).toBe(true);
    expect(
      await repository.save(record({ activeMs: 30_000, revision: 1 })),
    ).toBe(true);

    expect(await repository.findBySessionId("session-1")).toEqual(
      record({ activeMs: 30_000, revision: 1 }),
    );
  });

  it("rejects stale writes", async () => {
    await repository.save(record());
    await repository.save(record({ activeMs: 30_000, revision: 1 }));

    expect(await repository.save(record())).toBe(false);
    expect(
      await repository.save(record({ activeMs: 99_000, revision: 1 })),
    ).toBe(false);
    expect((await repository.findBySessionId("session-1"))?.activeMs).toBe(
      30_000,
    );
  });
});
