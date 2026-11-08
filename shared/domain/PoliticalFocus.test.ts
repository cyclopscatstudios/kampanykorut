import { CampaignConfig, CampaignState } from "../types";
import {
  buildFocusOverview,
  canSelectFocus,
  isFocusLocked,
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
});
