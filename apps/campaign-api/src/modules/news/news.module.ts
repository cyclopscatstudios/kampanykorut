import fp from "fastify-plugin";
import { z } from "zod";
import type { NewsContentProcessor } from "./news.content";
import { newsPages } from "./news.pages";
import type { NewsRepository } from "./news.repository";
import { newsRoutes } from "./news.routes";
import { type NewsSource, NewsSync } from "./news.sync";

export interface NewsSyncOptions {
  source: NewsSource;
  content: NewsContentProcessor;
  repo: { owner: string; name: string };
  intervalMs: number | null;
}

export interface NewsModuleOptions {
  repository: NewsRepository;
  cacheControl?: string;
  siteUrl: string;
  sync: NewsSyncOptions | null;
}

declare module "fastify" {
  interface FastifyInstance {
    newsSync: NewsSync | null;
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
  async (app, { repository, cacheControl, siteUrl, sync: syncOptions }) => {
    await app.register(newsRoutes(repository, { cacheControl }));
    await app.register(newsPages(repository, { cacheControl, siteUrl }));

    if (!syncOptions) {
      app.decorate("newsSync", null);
      return;
    }

    const { source, content, repo, intervalMs } = syncOptions;
    const sync = new NewsSync(
      source,
      repository,
      content,
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

    if (intervalMs === null) return;

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
        intervalMs,
      );
      timer.unref();
    });

    app.addHook("onClose", async () => {
      clearInterval(timer);
    });
  },
  { name: "news" },
);
