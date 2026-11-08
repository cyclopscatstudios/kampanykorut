import { CampaignConfig, CampaignState, Condition } from "../types";
import {
  buildNewspaperEditions,
  getNewspaper,
  hasUnreadEdition,
  markNewspaperRead,
  publishNewspaperEdition,
} from "./Newspaper";

type Campaign = Pick<CampaignConfig, "politicalConfig" | "newspaper">;

const config = {
  politicalConfig: { gameMode: "strategic" },
  newspaper: {
    cadence: { minTurns: 2, maxTurns: 3 },
    papers: [
      { id: "nephang", name: "NÉPHANG" },
      { id: "esti", name: "ESTI HÍRLAP" },
    ],
    items: [
      { id: "a", headline: "A", lead: "a" },
      { id: "b", paper: "esti", headline: "B", lead: "b" },
      {
        id: "secret",
        headline: "Titok",
        lead: "s",
        priority: "pinned",
        when: { type: "answer-selected", questionId: "q1", answerId: "x" },
      },
    ],
  },
} as unknown as Campaign;

const stateWith = (overrides: Partial<CampaignState> = {}): CampaignState =>
  ({
    activeCampaignId: "c",
    turn: 2,
    isEnded: false,
    isBaseResultsAlreadyApplied: true,
    ...overrides,
  }) as CampaignState;

const never = () => false;
const answered = (condition?: Condition) =>
  condition !== undefined &&
  "type" in condition &&
  condition.type === "answer-selected";

describe("getNewspaper", () => {
  it("is off outside strategic mode", () => {
    expect(
      getNewspaper({ ...config, politicalConfig: undefined } as Campaign),
    ).toBeUndefined();
  });

  it("is off without stories", () => {
    expect(
      getNewspaper({
        ...config,
        newspaper: { papers: config.newspaper!.papers, items: [] },
      }),
    ).toBeUndefined();
  });
});

describe("publishNewspaperEdition", () => {
  it("waits for the first gap before the first edition", () => {
    const state = stateWith({ turn: 1 });
    expect(publishNewspaperEdition(state, config, never)).toBe(state);
  });

  it("prints one story and schedules the next edition within the cadence", () => {
    const next = publishNewspaperEdition(stateWith(), config, never);
    expect(next.newspaper?.editions).toHaveLength(1);
    expect(["a", "b"]).toContain(next.newspaper?.editions[0].itemId);
    expect(next.newspaper?.editions[0].turn).toBe(2);
    expect(next.newspaper?.nextTurn).toBeGreaterThanOrEqual(4);
    expect(next.newspaper?.nextTurn).toBeLessThanOrEqual(5);
  });

  it("does nothing before the next edition is due", () => {
    const state = stateWith({
      turn: 3,
      newspaper: {
        editions: [{ itemId: "a", turn: 2 }],
        readCount: 0,
        nextTurn: 4,
      },
    });
    expect(publishNewspaperEdition(state, config, never)).toBe(state);
  });

  it("is deterministic for the same session state", () => {
    const first = publishNewspaperEdition(stateWith(), config, never);
    const second = publishNewspaperEdition(stateWith(), config, never);
    expect(second.newspaper).toEqual(first.newspaper);
  });

  it("prints a pinned story as soon as its condition holds", () => {
    const next = publishNewspaperEdition(stateWith(), config, answered);
    expect(next.newspaper?.editions[0].itemId).toBe("secret");
  });

  it("never prints a story twice and waits when none is left", () => {
    const state = stateWith({
      turn: 6,
      newspaper: {
        editions: [
          { itemId: "a", turn: 2 },
          { itemId: "b", turn: 4 },
        ],
        readCount: 2,
        nextTurn: 6,
      },
    });
    expect(publishNewspaperEdition(state, config, never)).toBe(state);
  });

  it("skips stories whose weight is zero", () => {
    const weighted = {
      ...config,
      newspaper: {
        ...config.newspaper!,
        items: [
          { id: "a", headline: "A", lead: "a", weight: 0 },
          { id: "b", headline: "B", lead: "b", weight: 1 },
        ],
      },
    };
    const next = publishNewspaperEdition(stateWith(), weighted, never);
    expect(next.newspaper?.editions[0].itemId).toBe("b");
  });

  it("stops once the campaign has ended", () => {
    const state = stateWith({ isEnded: true });
    expect(publishNewspaperEdition(state, config, never)).toBe(state);
  });
});

describe("buildNewspaperEditions", () => {
  it("resolves the paper and numbers issues per paper", () => {
    const state = stateWith({
      newspaper: {
        editions: [
          { itemId: "a", turn: 2 },
          { itemId: "b", turn: 4 },
          { itemId: "secret", turn: 6 },
        ],
        readCount: 0,
      },
    });
    expect(
      buildNewspaperEditions(state, config).map((e) => [
        e.item.id,
        e.paper.id,
        e.issue,
      ]),
    ).toEqual([
      ["a", "nephang", 1],
      ["b", "esti", 1],
      ["secret", "nephang", 2],
    ]);
  });
});

describe("read state", () => {
  it("counts an edition unread until it is marked read", () => {
    const state = stateWith({
      newspaper: { editions: [{ itemId: "a", turn: 2 }], readCount: 0 },
    });
    expect(hasUnreadEdition(state)).toBe(true);
    const read = markNewspaperRead(state);
    expect(hasUnreadEdition(read)).toBe(false);
    expect(markNewspaperRead(read)).toBe(read);
  });
});
