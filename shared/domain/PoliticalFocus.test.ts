import { CampaignConfig, CampaignState } from "../types";
import {
  buildFocusOverview,
  canSelectFocus,
  hasFocusNews,
  isFocusRequired,
  markFocusSeen,
  selectFocus,
} from "./PoliticalFocus";

const focus = (id: string, extra: object = {}) => ({
  id,
  title: id,
  summary: "Rövid",
  description: "Hosszú leírás",
  ...extra,
});

const config = {
  electionConfig: {
    parties: [{ id: "mszmp", name: "MSZMP", color: "#e11d48" }],
  },
  politicalConfig: {
    gameMode: "strategic",
    focuses: [
      focus("with_kadar", {
        completeWhen: { type: "event-triggered", eventId: "pact" },
      }),
      focus("without_kadar", {
        failWhen: { type: "answer-selected", questionId: "q1", answerId: "A" },
      }),
      focus("workers"),
      focus("peasants"),
      focus("purge"),
      focus("amnesty"),
    ],
    focusBranches: [
      {
        id: "kadar",
        title: "Kádár",
        focuses: ["with_kadar", "without_kadar"],
        requiredBeforeTurn: 2,
      },
      {
        id: "base",
        focuses: ["workers", "peasants"],
        availableFromTurn: 3,
        requiredBeforeTurn: 5,
      },
      {
        id: "justice",
        requires: "without_kadar",
        focuses: ["purge", "amnesty"],
      },
    ],
  },
} as unknown as Pick<CampaignConfig, "politicalConfig" | "electionConfig">;

const stateWith = (overrides: Partial<CampaignState> = {}): CampaignState =>
  ({
    activeCampaignId: "c",
    turn: 0,
    isEnded: false,
    isBaseResultsAlreadyApplied: true,
    ...overrides,
  }) as CampaignState;

const pick = (state: CampaignState, ...ids: string[]) =>
  ids.reduce((s, id) => selectFocus(s, config, id), state);

// Picks one focus per turn, as the player would.
const play = (state: CampaignState, ...ids: string[]) =>
  ids.reduce(
    (s, id) => ({ ...selectFocus(s, config, id), turn: s.turn + 1 }),
    state,
  );

const branches = (state: CampaignState, answers = []) =>
  buildFocusOverview(state, config, answers).branches.map((b) => [
    b.id,
    b.state,
    b.focuses.map((f) => `${f.id}:${f.status}`),
  ]);

describe("PoliticalFocus", () => {
  it("opens only the first branch at the start", () => {
    expect(branches(stateWith())).toEqual([
      ["kadar", "open", ["with_kadar:available", "without_kadar:available"]],
    ]);
    expect(canSelectFocus(stateWith(), config, "workers")).toBe(false);
  });

  it("lets the player change the choice until the next turn", () => {
    const state = pick(stateWith({ turn: 2 }), "with_kadar");
    expect(state.politicalDashboard?.selectedFocusIds).toEqual(["with_kadar"]);
    expect(branches(state)).toEqual([
      ["kadar", "decided", ["with_kadar:selected", "without_kadar:available"]],
      ["base", "upcoming", ["workers:upcoming", "peasants:upcoming"]],
    ]);
    expect(
      buildFocusOverview(state, config, []).branches[1].availableFromTurn,
    ).toBe(4);
    expect(canSelectFocus(state, config, "workers")).toBe(false);

    const changed = selectFocus(state, config, "without_kadar");
    expect(changed.politicalDashboard?.selectedFocusIds).toEqual([
      "without_kadar",
    ]);

    const next = { ...changed, turn: 3 };
    expect(selectFocus(next, config, "with_kadar")).toBe(next);
    expect(canSelectFocus(next, config, "workers")).toBe(true);
  });

  it("keeps every choice and makes it final", () => {
    const state = { ...pick(stateWith({ turn: 2 }), "with_kadar"), turn: 3 };
    expect(selectFocus(state, config, "without_kadar")).toBe(state);

    const both = { ...pick(state, "peasants"), turn: 4 };
    expect(both.politicalDashboard?.selectedFocusIds).toEqual([
      "with_kadar",
      "peasants",
    ]);
    expect(branches(both)).toEqual([
      ["kadar", "decided", ["with_kadar:selected", "without_kadar:excluded"]],
      ["base", "decided", ["workers:excluded", "peasants:selected"]],
    ]);
  });

  it("waits for a branch's opening turn", () => {
    const early = pick(stateWith({ turn: 1 }), "with_kadar");
    expect(branches(early)[1]).toEqual([
      "base",
      "upcoming",
      ["workers:upcoming", "peasants:upcoming"],
    ]);
    expect(selectFocus(early, config, "workers")).toBe(early);
    expect(hasFocusNews(early, config, [])).toBe(true);
    const seen = markFocusSeen(early, config, []);
    expect(hasFocusNews(seen, config, [])).toBe(false);

    const open = { ...seen, turn: 2 };
    expect(canSelectFocus(open, config, "workers")).toBe(true);
    expect(hasFocusNews(open, config, [])).toBe(true);
  });

  it("follows the tree: a branch shows only on its own path", () => {
    const loyal = play(stateWith({ turn: 2 }), "with_kadar", "workers");
    expect(buildFocusOverview(loyal, config, []).current).toBeUndefined();

    const rebel = play(stateWith({ turn: 2 }), "without_kadar", "workers");
    expect(branches(rebel).map(([id, state]) => [id, state])).toEqual([
      ["kadar", "decided"],
      ["base", "decided"],
      ["justice", "open"],
    ]);
    expect(canSelectFocus(rebel, config, "amnesty")).toBe(true);
  });

  it("blocks progress from a branch's deadline until it is decided", () => {
    expect(isFocusRequired(stateWith(), config)).toBe(false);
    expect(isFocusRequired(stateWith({ turn: 1 }), config)).toBe(true);

    const chosen = pick(stateWith({ turn: 1 }), "with_kadar");
    expect(isFocusRequired(chosen, config)).toBe(false);
    expect(isFocusRequired({ ...chosen, turn: 4 }, config)).toBe(true);
    expect(isFocusRequired(stateWith({ turn: 1, isEnded: true }), config)).toBe(
      false,
    );
  });

  it("reports the status of the chosen focuses", () => {
    const pact = pick(
      stateWith({
        turn: 1,
        campaignEvents: {
          triggeredEventIds: ["pact"],
          pendingAnnouncementIds: [],
        },
      }),
      "with_kadar",
    );
    expect(buildFocusOverview(pact, config, []).latest?.status).toBe(
      "completed",
    );

    const rebel = pick(stateWith({ turn: 1 }), "without_kadar");
    expect(
      buildFocusOverview(rebel, config, [{ questionId: "q1", answerId: "A" }])
        .latest?.status,
    ).toBe("failed");
    expect(buildFocusOverview(rebel, config, []).latest?.status).toBe(
      "selected",
    );
  });

  it("reads the single focus of an older save", () => {
    const old = stateWith({
      turn: 2,
      politicalDashboard: { seenEventIds: [], selectedFocusId: "with_kadar" },
    });
    expect(
      buildFocusOverview(old, config, []).selected.map((f) => f.id),
    ).toEqual(["with_kadar"]);
    expect(pick(old, "workers").politicalDashboard).toEqual({
      seenEventIds: [],
      selectedFocusIds: ["with_kadar", "workers"],
      focusChosenAtTurn: 2,
    });
  });

  it("treats focuses without branches as a single fork", () => {
    const flat = {
      ...config,
      politicalConfig: {
        ...config.politicalConfig!,
        focusBranches: undefined,
        focuses: [focus("a"), focus("b")],
      },
    } as typeof config;
    const state = selectFocus(stateWith(), flat, "a");
    expect(buildFocusOverview(state, flat, []).branches).toHaveLength(1);
    expect(canSelectFocus(state, flat, "b")).toBe(true);
    expect(canSelectFocus({ ...state, turn: 1 }, flat, "b")).toBe(false);
    expect(isFocusRequired(stateWith(), flat)).toBe(false);
  });
});
