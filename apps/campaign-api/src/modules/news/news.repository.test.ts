import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { type Connection } from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { newsRecord } from "./__fixtures__/news";
import { InMemoryNewsRepository, type NewsRepository } from "./news.repository";
import { MongoNewsRepository } from "./news.repository.mongo";

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

const NOW = new Date("2026-10-15T12:00:00Z");

describe.each([
  ["in-memory", async () => new InMemoryNewsRepository()],
  [
    "mongo",
    async () => {
      await connection.dropDatabase();
      const repository = new MongoNewsRepository(connection);
      await repository.init();
      return repository;
    },
  ],
] as const)("%s NewsRepository", (_name, create) => {
  let repository: NewsRepository;

  beforeEach(async () => {
    repository = await create();
  });

  it("upserts and finds news by GitHub id", async () => {
    await repository.upsert(newsRecord({ title: "Első" }));
    await repository.upsert(newsRecord({ title: "Javított" }));

    await expect(repository.findByGithubId("D_1")).resolves.toEqual(
      newsRecord({ title: "Javított" }),
    );
    await expect(repository.findByGithubId("D_404")).resolves.toBeNull();
  });

  it("hides news and finds only visible ones by number", async () => {
    await repository.upsert(newsRecord({ number: 1 }));
    await repository.upsert(newsRecord({ number: 2 }));

    await repository.hide("D_1", NOW);

    await expect(repository.findVisibleByNumber(1)).resolves.toBeNull();
    await expect(repository.findVisibleByNumber(2)).resolves.toMatchObject({
      number: 2,
    });
    await expect(repository.listVisibleGithubIds()).resolves.toEqual(["D_2"]);
    await expect(repository.findByGithubId("D_1")).resolves.toMatchObject({
      visible: false,
      syncedAt: NOW,
    });
  });

  it("lists active news: pinned first, newest next, no expired or hidden", async () => {
    await repository.upsert(newsRecord({ number: 1, isPinned: true }));
    await repository.upsert(newsRecord({ number: 2 }));
    await repository.upsert(newsRecord({ number: 3 }));
    await repository.upsert(
      newsRecord({ number: 4, expiresAt: new Date("2026-10-15T00:00:00Z") }),
    );
    await repository.upsert(
      newsRecord({ number: 5, expiresAt: new Date("2026-10-16T00:00:00Z") }),
    );
    await repository.upsert(newsRecord({ number: 6, visible: false }));
    await repository.upsert(newsRecord({ number: 7, lang: "en" }));

    const active = await repository.listActive({
      lang: "hu",
      limit: 3,
      now: NOW,
    });

    expect(active.map((n) => n.number)).toEqual([1, 5, 3]);
    await expect(
      repository.listActive({ lang: "en", limit: 5, now: NOW }),
    ).resolves.toMatchObject([{ number: 7 }]);
  });

  it("tells whether a language has visible news", async () => {
    await repository.upsert(newsRecord({ number: 1 }));
    await repository.upsert(
      newsRecord({ number: 2, lang: "en", visible: false }),
    );

    await expect(repository.hasVisible("hu")).resolves.toBe(true);
    await expect(repository.hasVisible("en")).resolves.toBe(false);
  });

  it("pages through the archive, expired news included", async () => {
    for (const number of [1, 2, 3, 4]) {
      await repository.upsert(
        newsRecord({
          number,
          type: number % 2 ? "kampany" : "javitas",
          expiresAt: new Date("2026-10-01T00:00:00Z"),
        }),
      );
    }

    const first = await repository.listArchive({ lang: "hu", limit: 2 });
    const second = await repository.listArchive({
      lang: "hu",
      limit: 2,
      before: { publishedAt: first[1]!.publishedAt, number: first[1]!.number },
    });
    const campaigns = await repository.listArchive({
      lang: "hu",
      limit: 10,
      type: "kampany",
    });

    expect(first.map((n) => n.number)).toEqual([4, 3]);
    expect(second.map((n) => n.number)).toEqual([2, 1]);
    expect(campaigns.map((n) => n.number)).toEqual([3, 1]);
  });
});
