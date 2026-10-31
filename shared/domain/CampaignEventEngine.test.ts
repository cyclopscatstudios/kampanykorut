import { vi } from "vitest";
import {
  CampaignEvent,
  CampaignState,
  EffectType,
  ElectionConfig,
  MayoralResult,
  RawEffect,
} from "../types";
import { ApplyEventEffects, CampaignEventEngine } from "./CampaignEventEngine";
import { ConditionEvaluationError } from "./ConditionEvaluator";
import { mockElectionConfig } from "./mocks/mockElectionConfig";

const electionConfig = {
  ...mockElectionConfig,
  election: { type: "mayoral" },
  parties: [
    { id: "szentkiralyi", name: "Sz", color: "#f60" },
    { id: "vitezy", name: "V", color: "#0f0" },
  ],
} as ElectionConfig;

const state = {
  activeCampaignId: "budapest_2024",
  turn: 20,
  isEnded: false,
  isBaseResultsAlreadyApplied: true,
  mayoralResult: {
    percentages: { szentkiralyi: 0.2, vitezy: 0.4 },
  } as unknown as MayoralResult,
} as CampaignState;

const swing = (candidateId: string): RawEffect => ({
  type: EffectType.UniformSwing,
  params: { [candidateId]: 1 },
});

const always = { type: "turn", min: 0 } as const;
const never = { type: "turn", max: 0 } as const;

function event(id: string, patch: Partial<CampaignEvent> = {}): CampaignEvent {
  return {
    id,
    conditions: [{ if: always, effects: [swing(id)] }],
    ...patch,
  };
}

function recordingApply() {
  const calls: string[] = [];
  const apply: ApplyEventEffects = (current, effects) => {
    calls.push(
      ...effects.map((e) =>
        "params" in e ? Object.keys(e.params).join() : e.candidateId,
      ),
    );
    return { ...current };
  };
  return { apply, calls };
}

const run = (
  events: CampaignEvent[],
  input: CampaignState = state,
  apply: ApplyEventEffects = recordingApply().apply,
  answers: { questionId: string; answerId: string }[] = [],
) =>
  new CampaignEventEngine().run(events, input, answers, electionConfig, apply);

describe("CampaignEventEngine", () => {
  it("applies the effects of a met event and records it", () => {
    const { apply, calls } = recordingApply();

    const result = run(
      [
        event("withdrawal", {
          announcement: { title: "Visszalép", body: "A mezőny megváltozott." },
        }),
      ],
      state,
      apply,
    );

    expect(calls).toEqual(["withdrawal"]);
    expect(result.campaignEvents).toEqual({
      triggeredEventIds: ["withdrawal"],
      pendingAnnouncementIds: ["withdrawal"],
    });
  });

  it("queues no announcement for an event without one", () => {
    const result = run([event("silent")]);

    expect(result.campaignEvents?.pendingAnnouncementIds).toEqual([]);
  });

  it("leaves the state untouched when no branch is met", () => {
    const { apply, calls } = recordingApply();

    const result = run(
      [event("x", { conditions: [{ if: never, effects: [swing("x")] }] })],
      state,
      apply,
    );

    expect(calls).toEqual([]);
    expect(result).toBe(state);
  });

  it("runs only the first met branch", () => {
    const { apply, calls } = recordingApply();

    run(
      [
        event("withdrawal", {
          conditions: [
            { if: never, effects: [swing("first")] },
            { if: always, effects: [swing("second")] },
            { if: always, effects: [swing("third")] },
          ],
        }),
      ],
      state,
      apply,
    );

    expect(calls).toEqual(["second"]);
  });

  it("does not run a once event again", () => {
    const { apply, calls } = recordingApply();
    const triggered = {
      ...state,
      campaignEvents: {
        triggeredEventIds: ["withdrawal"],
        pendingAnnouncementIds: [],
      },
    };

    const result = run([event("withdrawal")], triggered, apply);

    expect(calls).toEqual([]);
    expect(result).toBe(triggered);
  });

  it("runs a repeatable event every time without duplicating its id", () => {
    const { apply, calls } = recordingApply();
    const repeatable = event("rally", { once: false });

    const first = run([repeatable], state, apply);
    const second = run([repeatable], first, apply);

    expect(calls).toEqual(["rally", "rally"]);
    expect(second.campaignEvents?.triggeredEventIds).toEqual(["rally"]);
  });

  it("evaluates events by priority, then by declaration order", () => {
    const { apply, calls } = recordingApply();

    run(
      [
        event("low"),
        event("high", { priority: 100 }),
        event("mid_a", { priority: 10 }),
        event("mid_b", { priority: 10 }),
      ],
      state,
      apply,
    );

    expect(calls).toEqual(["high", "mid_a", "mid_b", "low"]);
  });

  it("lets a later event see an earlier one in the same turn, but never re-runs the list", () => {
    const followUp = event("follow_up", {
      conditions: [
        {
          if: { type: "event-triggered", eventId: "withdrawal" },
          effects: [swing("follow_up")],
        },
      ],
    });

    const afterFirstTurn = run([event("withdrawal"), followUp]);
    expect(afterFirstTurn.campaignEvents?.triggeredEventIds).toEqual([
      "withdrawal",
      "follow_up",
    ]);

    const declaredBefore = run([followUp, event("withdrawal")]);
    expect(declaredBefore.campaignEvents?.triggeredEventIds).toEqual([
      "withdrawal",
    ]);
    expect(
      run([followUp, event("withdrawal")], declaredBefore).campaignEvents
        ?.triggeredEventIds,
    ).toEqual(["withdrawal", "follow_up"]);
  });

  it("evaluates each event against the state left by the previous one", () => {
    const apply: ApplyEventEffects = (current) => ({
      ...current,
      mayoralResult: {
        percentages: { szentkiralyi: 0.5, vitezy: 0.1 },
      } as unknown as MayoralResult,
    });
    const boost = event("boost");
    const reaction = event("reaction", {
      conditions: [
        {
          if: {
            type: "candidate-support",
            candidateId: "szentkiralyi",
            operator: ">",
            value: 0.3,
          },
          effects: [],
        },
      ],
    });

    expect(
      run([boost, reaction], state, apply).campaignEvents?.triggeredEventIds,
    ).toEqual(["boost", "reaction"]);
  });

  it("reads the answers it is given", () => {
    const answered = event("answered", {
      conditions: [
        {
          if: {
            type: "answer-selected",
            questionId: "question_12",
            answerId: "answer_3",
          },
          effects: [],
        },
      ],
    });

    expect(run([answered]).campaignEvents).toBeUndefined();
    expect(
      run([answered], state, undefined, [
        { questionId: "question_12", answerId: "answer_3" },
      ]).campaignEvents?.triggeredEventIds,
    ).toEqual(["answered"]);
  });

  it("fails the whole run without touching the input when a condition cannot be evaluated", () => {
    const apply = vi.fn<ApplyEventEffects>((current) => ({ ...current }));
    const broken = event("broken", {
      conditions: [
        {
          if: {
            type: "candidate-support",
            candidateId: "unknown",
            operator: "<",
            value: 0.3,
          },
          effects: [],
        },
      ],
    });
    const snapshot = structuredClone(state);

    expect(() => run([event("first"), broken], state, apply)).toThrow(
      ConditionEvaluationError,
    );
    expect(state).toEqual(snapshot);
  });
});
