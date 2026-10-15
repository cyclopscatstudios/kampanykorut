import fp from "fastify-plugin";
import { z } from "zod";
import type { NewsRepository } from "./news.repository";
import { type NewsSource, NewsSync } from "./news.sync";

export interface NewsModuleOptions {
  source: NewsSource;
  repository: NewsRepository;
  repo: { owner: string; name: string };
  syncIntervalMs: number | null;
}

declare module "fastify" {
  interface FastifyInstance {
    newsSync: NewsSync;
  }
}

const DiscussionEventSchema = z.object({
  action: z.string(),
  discussion: z.object({
    node_id: z.string(),
    number: z.number().int(),
    category: z.object({ node_id: z.string().optional() }).nullish(),
  }),
  repository: z.object({ full_name: z.string() }),
});

export const newsModule = fp<NewsModuleOptions>(
  async (app, { source, repository, repo, syncIntervalMs }) => {
    const sync = new NewsSync(
      source,
      repository,
      app.log.child({ module: "news" }),
    );
    app.decorate("newsSync", sync);

    if (app.hasDecorator("onGithubEvent")) {
      const fullName = `${repo.owner}/${repo.name}`.toLowerCase();

      app.onGithubEvent("discussion", async (payload, { log }) => {
        const event = DiscussionEventSchema.safeParse(payload);
        if (!event.success) {
          log.warn(
            { issues: event.error.issues },
            "Unexpected discussion payload",
          );
          return;
        }
        if (event.data.repository.full_name.toLowerCase() !== fullName) return;

        await sync.handleDiscussionEvent(event.data);
      });
    }

    if (syncIntervalMs === null) return;

    const runSafely = (run: () => Promise<unknown>, label: string) => {
      run().catch((err: unknown) =>
        app.log.error({ err, module: "news" }, `${label} failed`),
      );
    };

    let timer: NodeJS.Timeout | undefined;

    app.addHook("onReady", async () => {
      runSafely(() => sync.syncAll(), "Initial news sync");
      timer = setInterval(
        () => runSafely(() => sync.syncLatest(), "Scheduled news sync"),
        syncIntervalMs,
      );
      timer.unref();
    });

    app.addHook("onClose", async () => {
      clearInterval(timer);
    });
  },
  { name: "news" },
);
