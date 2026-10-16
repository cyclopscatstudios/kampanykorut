import { inject, singleton } from "tsyringe";
import { createLogger } from "@/shared/logger/logger";
import { StorageEngine } from "@/shared/logic/application/StorageEngine";
import type { NewsItem } from "@/shared/types";
import { Emitter } from "../Emitter";
import type { SessionKey } from "../SessionKey";

export interface NewsReadSnapshot {
  readNumbers: number[];
  allReadAt: string | null;
  firstSeenAt: string;
}

export const NEWS_UNREAD_WINDOW_DAYS = 14;
const MAX_READ_NUMBERS = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

const log = createLogger("NewsReadState");

function isSnapshot(value: unknown): value is NewsReadSnapshot {
  const v = value as NewsReadSnapshot;
  return (
    typeof v === "object" &&
    v !== null &&
    Array.isArray(v.readNumbers) &&
    v.readNumbers.every(Number.isInteger) &&
    (v.allReadAt === null || typeof v.allReadAt === "string") &&
    typeof v.firstSeenAt === "string"
  );
}

@singleton()
export class NewsReadState extends Emitter<NewsReadSnapshot> {
  private snapshot: NewsReadSnapshot | null = null;

  constructor(
    @inject(StorageEngine) private storage: StorageEngine<SessionKey>,
  ) {
    super();
  }

  get(now: Date = new Date()): NewsReadSnapshot {
    this.snapshot ??=
      this.read() ??
      this.write({
        readNumbers: [],
        allReadAt: null,
        firstSeenAt: now.toISOString(),
      });
    return this.snapshot;
  }

  isUnread(news: NewsItem, snapshot: NewsReadSnapshot = this.get()): boolean {
    const published = new Date(news.publishedAt).getTime();
    const windowStart =
      new Date(snapshot.firstSeenAt).getTime() -
      NEWS_UNREAD_WINDOW_DAYS * DAY_MS;

    if (snapshot.readNumbers.includes(news.number)) return false;
    if (
      snapshot.allReadAt &&
      published <= new Date(snapshot.allReadAt).getTime()
    ) {
      return false;
    }
    return published >= windowStart;
  }

  markRead(number: number): void {
    const current = this.get();
    if (current.readNumbers.includes(number)) return;

    this.update({
      ...current,
      readNumbers: [...current.readNumbers, number].slice(-MAX_READ_NUMBERS),
    });
  }

  markAllRead(now: Date = new Date()): void {
    this.update({
      ...this.get(),
      readNumbers: [],
      allReadAt: now.toISOString(),
    });
  }

  private update(next: NewsReadSnapshot) {
    this.snapshot = this.write(next);
    this.notify(this.snapshot);
  }

  private read(): NewsReadSnapshot | null {
    try {
      const raw = this.storage.getItem("newsReadState", "localStorage");
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return isSnapshot(parsed) ? parsed : null;
    } catch (error) {
      log.warn("Could not read news read state", error);
      return null;
    }
  }

  private write(snapshot: NewsReadSnapshot): NewsReadSnapshot {
    try {
      this.storage.setItem(
        "newsReadState",
        JSON.stringify(snapshot),
        "localStorage",
      );
    } catch (error) {
      log.warn("Could not save news read state", error);
    }
    return snapshot;
  }
}
