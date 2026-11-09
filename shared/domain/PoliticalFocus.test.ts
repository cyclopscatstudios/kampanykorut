import { CampaignConfig, CampaignState } from "../types";
import {
  buildFocusOverview,
  canSelectFocus,
  hasFocusNews,
  isFocusLocked,
  isFocusRequired,
  markFocusSeen,
  selectFocus,
} from "./PoliticalFocus";

const config = {
  electionConfig: {
    parties: [{ id: "mszmp", name: "MSZMP", color: "#e11d48" }],
  },
  politicalConfig: {
    gameMode: "strategic",
    focusLockEventId: "congress",
    focuses: [
      {
        id: "with_kadar",
        title: "Kádárral",
        summary: "Egység",
        description: "Hosszú leírás",
        completeWhen: { type: "event-triggered", eventId: "pact" },
      },
      {
        id: "without_kadar",
        title: "Kádár nélkül",
        summary: "Megújulás",
        description: "Hosszú leírás",
        completeWhen: {
          type: "candidate-support",
          candidateId: "mszmp",
          operator: ">",
          value: 0.5,
        },
        failWhen: { type: "answer-selected", questionId: "q1", answerId: "A" },
      },
    ],
  },
} as unknown as Pick<CampaignConfig, "politicalConfig" | "electionConfig">;

const stateWith = (overrides: Partial<CampaignState> = {}): CampaignState =>
  ({
    activeCampaignId: "c",
    turn: 3,
    isEnded: false,
    isBaseResultsAlreadyApplied: true,
    ...overrides,
  }) as CampaignState;

const triggered = (...ids: string[]) => ({
  campaignEvents: { triggeredEventIds: ids, pendingAnnouncementIds: [] },
});

const statuses = (state: CampaignState, answers = []) =>
  buildFocusOverview(state, config, answers).focuses.map((f) => [
    f.id,
    f.status,
    f.selectable,
  ]);

describe("PoliticalFocus", () => {
  it("offers every focus before the player picks one", () => {
    expect(statuses(stateWith())).toEqual([
      ["with_kadar", "available", true],
      ["without_kadar", "available", true],
    ]);
  });

  it("records the selection without touching anything else", () => {
    const state = stateWith({ politicalDashboard: { seenEventIds: ["a"] } });
    const selected = selectFocus(state, config, "without_kadar");

    expect(selected).toEqual({
      ...state,
      politicalDashboard: {
        seenEventIds: ["a"],
        selectedFocusId: "without_kadar",
      },
    });
    expect(statuses(selected)).toEqual([
      ["with_kadar", "available", true],
      ["without_kadar", "selected", false],
    ]);
  });

  it("lets the player switch until the lock event, then excludes the other branch", () => {
    const first = selectFocus(stateWith(), config, "with_kadar");
    const switched = selectFocus(first, config, "without_kadar");
    expect(switched.politicalDashboard?.selectedFocusId).toBe("without_kadar");

    const locked = { ...switched, ...triggered("congress") };
    expect(isFocusLocked(locked, config)).toBe(true);
    expect(selectFocus(locked, config, "with_kadar")).toBe(locked);
    expect(statuses(locked)).toEqual([
      ["with_kadar", "excluded", false],
      ["without_kadar", "selected", false],
    ]);
  });

  it("ignores unknown focuses and ended campaigns", () => {
    const state = stateWith();
    expect(canSelectFocus(state, config, "nope")).toBe(false);
    expect(
      canSelectFocus(stateWith({ isEnded: true }), config, "with_kadar"),
    ).toBe(false);
  });

  it("marks the followed focus completed when its goal holds", () => {
    const state = selectFocus(
      stateWith(triggered("pact")),
      config,
      "with_kadar",
    );
    expect(buildFocusOverview(state, config, []).selected?.status).toBe(
      "completed",
    );
  });

  it("marks the followed focus failed when its failure holds", () => {
    const state = selectFocus(stateWith(), config, "without_kadar");
    expect(
      buildFocusOverview(state, config, [{ questionId: "q1", answerId: "A" }])
        .selected?.status,
    ).toBe("failed");
  });

  it("treats a goal that cannot be decided yet as not reached", () => {
    const state = selectFocus(stateWith(), config, "without_kadar");
    expect(buildFocusOverview(state, config, []).selected?.status).toBe(
      "selected",
    );
  });

  const opposites = {
    ...config,
    politicalConfig: {
      ...config.politicalConfig!,
      focusSelection: { requiredBeforeTurn: 1 },
      focuses: [
        { ...config.politicalConfig!.focuses![0], excludes: ["without_kadar"] },
        config.politicalConfig!.focuses![1],
        { id: "reform", title: "Reform", summary: "", description: "" },
      ],
    },
  } as typeof config;

  it("never offers the opposite of the chosen focus again", () => {
    const withKadar = selectFocus(stateWith(), opposites, "with_kadar");
    expect(
      buildFocusOverview(withKadar, opposites, []).focuses.map((f) => [
        f.id,
        f.status,
        f.selectable,
      ]),
    ).toEqual([
      ["with_kadar", "selected", false],
      ["without_kadar", "excluded", false],
      ["reform", "available", true],
    ]);
    expect(selectFocus(withKadar, opposites, "without_kadar")).toBe(withKadar);

    const without = selectFocus(stateWith(), opposites, "without_kadar");
    expect(canSelectFocus(without, opposites, "with_kadar")).toBe(false);
  });

  it("keeps the rest of the dashboard state when selecting", () => {
    const state = stateWith({
      politicalDashboard: { seenEventIds: [], seenRelationIds: ["r"] },
    });
    expect(
      selectFocus(state, config, "with_kadar").politicalDashboard
        ?.seenRelationIds,
    ).toEqual(["r"]);
  });

  it("requires a focus before playing only when the campaign asks", () => {
    expect(isFocusRequired(stateWith(), opposites)).toBe(true);
    expect(isFocusRequired(stateWith(), config)).toBe(false);
    expect(
      isFocusRequired(selectFocus(stateWith(), opposites, "reform"), opposites),
    ).toBe(false);
    expect(isFocusRequired(stateWith({ isEnded: true }), opposites)).toBe(
      false,
    );
  });

  const timed = {
    ...config,
    politicalConfig: {
      ...config.politicalConfig!,
      focusSelection: { availableFromTurn: 3, requiredBeforeTurn: 5 },
    },
  } as typeof config;

  it("opens focus selection and blocks progress at the configured turns", () => {
    const early = stateWith({ turn: 1 });
    expect(canSelectFocus(early, timed, "with_kadar")).toBe(false);
    expect(selectFocus(early, timed, "with_kadar")).toBe(early);
    expect(buildFocusOverview(early, timed, []).availableFromTurn).toBe(3);
    expect(hasFocusNews(early, timed, [])).toBe(false);

    const open = stateWith({ turn: 2 });
    expect(canSelectFocus(open, timed, "with_kadar")).toBe(true);
    expect(isFocusRequired(open, timed)).toBe(false);
    expect(buildFocusOverview(open, timed, []).availableFromTurn).toBe(
      undefined,
    );

    const deadline = stateWith({ turn: 4 });
    expect(isFocusRequired(deadline, timed)).toBe(true);
    expect(
      isFocusRequired(selectFocus(deadline, timed, "with_kadar"), timed),
    ).toBe(false);
  });

  it("flags news until a focus is chosen and whenever its status changes", () => {
    expect(hasFocusNews(stateWith(), config, [])).toBe(true);

    const selected = selectFocus(stateWith(), config, "with_kadar");
    expect(hasFocusNews(selected, config, [])).toBe(true);
    const seen = markFocusSeen(selected, config, []);
    expect(hasFocusNews(seen, config, [])).toBe(false);
    expect(markFocusSeen(seen, config, [])).toBe(seen);

    const completed = { ...seen, ...triggered("pact") };
    expect(hasFocusNews(completed, config, [])).toBe(true);
    expect(hasFocusNews(markFocusSeen(completed, config, []), config, [])).toBe(
      false,
    );
  });

  it("has no focus news once the choice is locked or the campaign ended", () => {
    expect(
      hasFocusNews({ ...stateWith(), ...triggered("congress") }, config, []),
    ).toBe(false);
    expect(hasFocusNews(stateWith({ isEnded: true }), config, [])).toBe(false);
  });
});
