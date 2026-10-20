import { beforeEach, describe, expect, it, vi } from "vitest";
import { StorageEngine } from "@/shared/logic/application/StorageEngine";
import type { NewsItem } from "@/shared/types";
import type { SessionKey } from "../SessionKey";
import { NewsReadState } from "./NewsReadState";

const FIRST_VISIT = new Date("2026-10-16T12:00:00Z");

const news = (number: number, publishedAt: string) =>
  ({ number, publishedAt }) as NewsItem;

describe("NewsReadState", () => {
  let storage: StorageEngine<SessionKey>;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageEngine<SessionKey>("test");
  });

  const create = () => {
    const state = new NewsReadState(storage);
    state.get(FIRST_VISIT);
    return state;
  };

  it("counts only the last 14 days as unread on the first visit", () => {
    const state = create();

    expect(state.isUnread(news(1, "2026-10-10T08:00:00Z"))).toBe(true);
    expect(state.isUnread(news(2, "2026-10-02T13:00:00Z"))).toBe(true);
    expect(state.isUnread(news(3, "2026-10-01T08:00:00Z"))).toBe(false);
  });

  it("remembers individually read news across instances", () => {
    create().markRead(1);

    const reloaded = new NewsReadState(storage);

    expect(reloaded.isUnread(news(1, "2026-10-15T08:00:00Z"))).toBe(false);
    expect(reloaded.isUnread(news(2, "2026-10-15T08:00:00Z"))).toBe(true);
  });

  it("marks everything up to now as read, but not later news", () => {
    const state = create();
    state.markRead(1);

    state.markAllRead(new Date("2026-10-20T12:00:00Z"));

    expect(state.get().readNumbers).toEqual([]);
    expect(state.isUnread(news(2, "2026-10-19T08:00:00Z"))).toBe(false);
    expect(state.isUnread(news(3, "2026-10-21T08:00:00Z"))).toBe(true);
  });

  it("notifies subscribers", () => {
    const state = create();
    const listener = vi.fn();
    state.subscribe(listener);

    state.markRead(5);
    state.markRead(5);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ readNumbers: [5] }),
    );
  });

  it("starts over when the stored value is corrupt or unreadable", () => {
    localStorage.setItem(storage.getPrefixedKey("newsReadState"), "{oops");
    expect(create().get().readNumbers).toEqual([]);

    vi.spyOn(storage, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(new NewsReadState(storage).get(FIRST_VISIT)).toMatchObject({
      readNumbers: [],
      firstSeenAt: FIRST_VISIT.toISOString(),
    });
  });
});
