import type { NewsCover } from "./news.images";
import type { NewsLang, NewsType, ParsedNews } from "./news.parse";

export interface NewsRecord extends ParsedNews {
  html: string;
  cover: NewsCover | null;
  sourceHash: string;
  contentComplete: boolean;
  syncedAt: Date;
}

export interface ArchiveCursor {
  publishedAt: Date;
  number: number;
}

export interface ActiveNewsQuery {
  lang: NewsLang;
  limit: number;
  now: Date;
}

export interface ArchiveNewsQuery {
  lang: NewsLang;
  limit: number;
  type?: NewsType;
  before?: ArchiveCursor;
}

export interface NewsRepository {
  upsert(news: NewsRecord): Promise<void>;
  findByGithubId(githubId: string): Promise<NewsRecord | null>;
  findVisibleByNumber(number: number): Promise<NewsRecord | null>;
  hide(githubId: string, syncedAt: Date): Promise<void>;
  listVisibleGithubIds(): Promise<string[]>;
  hasVisible(lang: NewsLang): Promise<boolean>;
  listActive(query: ActiveNewsQuery): Promise<NewsRecord[]>;
  listArchive(query: ArchiveNewsQuery): Promise<NewsRecord[]>;
}

const byNewest = (a: NewsRecord, b: NewsRecord) =>
  b.publishedAt.getTime() - a.publishedAt.getTime() || b.number - a.number;

export class InMemoryNewsRepository implements NewsRepository {
  private readonly items = new Map<string, NewsRecord>();

  async upsert(news: NewsRecord): Promise<void> {
    this.items.set(news.githubId, { ...news });
  }

  async findByGithubId(githubId: string): Promise<NewsRecord | null> {
    const item = this.items.get(githubId);
    return item ? { ...item } : null;
  }

  async findVisibleByNumber(number: number): Promise<NewsRecord | null> {
    const item = this.visible().find((news) => news.number === number);
    return item ? { ...item } : null;
  }

  async hide(githubId: string, syncedAt: Date): Promise<void> {
    const item = this.items.get(githubId);
    if (item) this.items.set(githubId, { ...item, visible: false, syncedAt });
  }

  async listVisibleGithubIds(): Promise<string[]> {
    return this.visible().map((item) => item.githubId);
  }

  async hasVisible(lang: NewsLang): Promise<boolean> {
    return this.visible().some((item) => item.lang === lang);
  }

  async listActive({ lang, limit, now }: ActiveNewsQuery) {
    return this.visible()
      .filter(
        (news) =>
          news.lang === lang &&
          (news.expiresAt === null || news.expiresAt > now),
      )
      .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || byNewest(a, b))
      .slice(0, limit);
  }

  async listArchive({ lang, limit, type, before }: ArchiveNewsQuery) {
    return this.visible()
      .filter(
        (news) =>
          news.lang === lang &&
          (!type || news.type === type) &&
          (!before ||
            news.publishedAt < before.publishedAt ||
            (news.publishedAt.getTime() === before.publishedAt.getTime() &&
              news.number < before.number)),
      )
      .sort(byNewest)
      .slice(0, limit);
  }

  private visible() {
    return [...this.items.values()].filter((item) => item.visible);
  }
}
