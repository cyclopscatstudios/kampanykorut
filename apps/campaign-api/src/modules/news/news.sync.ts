import { createHash } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import type { NewsContentProcessor } from "./news.content";
import type { NewsDiscussion, NewsGithubSource } from "./news.github";
import { parseNewsDiscussion } from "./news.parse";
import type { NewsRepository } from "./news.repository";

export type NewsSource = Pick<
  NewsGithubSource,
  "resolveCategoryId" | "fetchLatest" | "fetchAll" | "fetchByNumber" | "isNews"
>;

export interface DiscussionEvent {
  action: string;
  discussion: {
    node_id: string;
    number: number;
    category?: { node_id?: string } | null;
  };
}

export interface SyncResult {
  updated: number;
  hidden: number;
}

export class NewsSync {
  private running: Promise<SyncResult> | null = null;

  constructor(
    private readonly source: NewsSource,
    private readonly repository: NewsRepository,
    private readonly content: NewsContentProcessor,
    private readonly log: FastifyBaseLogger,
    private readonly now: () => Date = () => new Date(),
  ) {}

  syncLatest(): Promise<SyncResult> {
    return this.exclusive(async () => {
      const discussions = await this.source.fetchLatest();
      for (const discussion of discussions) await this.store(discussion, true);
      return { updated: discussions.length, hidden: 0 };
    });
  }

  syncAll(): Promise<SyncResult> {
    return this.exclusive(async () => {
      const discussions = await this.source.fetchAll();
      for (const discussion of discussions) await this.store(discussion, true);

      const seen = new Set(discussions.map((d) => d.githubId));
      const stale = (await this.repository.listVisibleGithubIds()).filter(
        (id) => !seen.has(id),
      );
      for (const githubId of stale) {
        await this.repository.hide(githubId, this.now());
      }

      return { updated: discussions.length, hidden: stale.length };
    });
  }

  async handleDiscussionEvent(event: DiscussionEvent): Promise<void> {
    const { node_id: githubId, number, category } = event.discussion;
    const stored = await this.repository.findByGithubId(githubId);
    const inNewsCategory =
      category?.node_id === (await this.source.resolveCategoryId());

    if (!stored && !inNewsCategory) return;

    if (event.action === "deleted") {
      await this.repository.hide(githubId, this.now());
      this.log.info({ githubId, number }, "News hidden: discussion deleted");
      return;
    }

    const discussion = await this.source.fetchByNumber(number);
    if (!discussion) {
      await this.repository.hide(githubId, this.now());
      return;
    }

    const visible = await this.store(
      discussion,
      await this.source.isNews(discussion),
    );
    this.log.info(
      { githubId, number, action: event.action, visible },
      "News synced from webhook",
    );
  }

  private async store(
    discussion: NewsDiscussion,
    isNews: boolean,
  ): Promise<boolean> {
    const news = parseNewsDiscussion(discussion, { isNews });
    const sourceHash = createHash("sha256")
      .update(JSON.stringify([news.markdown, news.coverSourceUrl]))
      .digest("hex");
    const stored = await this.repository.findByGithubId(news.githubId);
    const reusable =
      stored?.sourceHash === sourceHash &&
      stored.contentComplete &&
      (await this.content.imagesStored(news));
    const content = reusable
      ? { html: stored.html, cover: stored.cover, complete: true }
      : await this.content.process(news);

    await this.repository.upsert({
      ...news,
      html: content.html,
      cover: content.cover,
      sourceHash,
      contentComplete: content.complete,
      syncedAt: this.now(),
    });
    return news.visible;
  }

  private exclusive(run: () => Promise<SyncResult>): Promise<SyncResult> {
    this.running ??= run().finally(() => {
      this.running = null;
    });
    return this.running;
  }
}
