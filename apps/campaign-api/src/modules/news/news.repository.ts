import type { ParsedNews } from "./news.parse";

export interface NewsRecord extends ParsedNews {
  syncedAt: Date;
}

export interface NewsRepository {
  upsert(news: NewsRecord): Promise<void>;
  findByGithubId(githubId: string): Promise<NewsRecord | null>;
  hide(githubId: string, syncedAt: Date): Promise<void>;
  listVisibleGithubIds(): Promise<string[]>;
}

export class InMemoryNewsRepository implements NewsRepository {
  private readonly items = new Map<string, NewsRecord>();

  async upsert(news: NewsRecord): Promise<void> {
    this.items.set(news.githubId, { ...news });
  }

  async findByGithubId(githubId: string): Promise<NewsRecord | null> {
    const item = this.items.get(githubId);
    return item ? { ...item } : null;
  }

  async hide(githubId: string, syncedAt: Date): Promise<void> {
    const item = this.items.get(githubId);
    if (item) this.items.set(githubId, { ...item, visible: false, syncedAt });
  }

  async listVisibleGithubIds(): Promise<string[]> {
    return [...this.items.values()]
      .filter((item) => item.visible)
      .map((item) => item.githubId);
  }
}
