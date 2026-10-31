import { Condition, ConditionContext } from "../types";
import {
  ConditionEvaluationError,
  evaluateCondition,
} from "./ConditionEvaluator";

function context(overrides: Partial<ConditionContext> = {}): ConditionContext {
  const support: Record<string, number> = {
    szentkiralyi: 0.25,
    vitezy: 0.33,
    karacsony: 0.35,
  };
  return {
    turn: 20,
    answers: [{ questionId: "question_12", answerId: "answer_3" }],
    getSupport: (id) => support[id],
    getCandidateStatus: () => "active",
    triggeredEventIds: [],
    ...overrides,
  };
}

const withdrawalCondition: Condition = {
  and: [
    { type: "turn", min: 18, max: 32 },
    {
      type: "candidate-support",
      candidateId: "szentkiralyi",
      operator: "<",
      value: 0.3,
    },
    {
      type: "answer-selected",
      questionId: "question_12",
      answerId: "answer_3",
    },
    { type: "candidate-status", candidateId: "szentkiralyi", status: "active" },
  ],
};

describe("evaluateCondition", () => {
  describe("the planned withdrawal example", () => {
    it("is met inside the turn window with low support and the answer given", () => {
      expect(evaluateCondition(withdrawalCondition, context())).toBe(true);
    });

    it.each([
      ["before the window", { turn: 17 }],
      ["after the window", { turn: 33 }],
      ["without the answer", { answers: [] }],
      [
        "with a different answer to the same question",
        { answers: [{ questionId: "question_12", answerId: "answer_1" }] },
      ],
      [
        "with enough support",
        { getSupport: (id: string) => (id === "szentkiralyi" ? 0.3 : 0.1) },
      ],
      [
        "once already inactive",
        { getCandidateStatus: () => "inactive" as const },
      ],
    ])("is not met %s", (_label, overrides) => {
      expect(evaluateCondition(withdrawalCondition, context(overrides))).toBe(
        false,
      );
    });

    it("includes both ends of the turn window", () => {
      expect(
        evaluateCondition(withdrawalCondition, context({ turn: 18 })),
      ).toBe(true);
      expect(
        evaluateCondition(withdrawalCondition, context({ turn: 32 })),
      ).toBe(true);
    });
  });

  describe("logical operators", () => {
    const yes: Condition = { type: "turn", min: 0 };
    const no: Condition = { type: "turn", max: 0 };

    it.each([
      [{ and: [yes, yes] }, true],
      [{ and: [yes, no] }, false],
      [{ or: [no, yes] }, true],
      [{ or: [no, no] }, false],
      [{ not: no }, true],
      [{ not: yes }, false],
      [{ and: [yes, { or: [no, { not: no }] }] }, true],
      [{ not: { and: [yes, { or: [no, no] }] } }, true],
    ] as [Condition, boolean][])("%j is %s", (condition, expected) => {
      expect(evaluateCondition(condition, context())).toBe(expected);
    });

    it("rejects empty and/or", () => {
      expect(() => evaluateCondition({ and: [] }, context())).toThrow(
        ConditionEvaluationError,
      );
      expect(() => evaluateCondition({ or: [] }, context())).toThrow(
        ConditionEvaluationError,
      );
    });
  });

  describe("leaf conditions", () => {
    it.each([
      ["<", 0.25, false],
      ["<=", 0.25, true],
      [">", 0.2, true],
      [">=", 0.26, false],
    ] as const)("compares support with %s %s", (operator, value, expected) => {
      const condition: Condition = {
        type: "candidate-support",
        candidateId: "szentkiralyi",
        operator,
        value,
      };
      expect(evaluateCondition(condition, context())).toBe(expected);
    });

    it("never treats missing support as zero", () => {
      const condition: Condition = {
        type: "candidate-support",
        candidateId: "unknown",
        operator: "<",
        value: 0.3,
      };
      expect(() => evaluateCondition(condition, context())).toThrow(
        /no support value for candidate "unknown"/,
      );
    });

    it("checks whether an event has already run", () => {
      const condition: Condition = {
        type: "event-triggered",
        eventId: "szentkiralyi_withdrawal",
      };
      expect(evaluateCondition(condition, context())).toBe(false);
      expect(
        evaluateCondition(
          condition,
          context({ triggeredEventIds: ["szentkiralyi_withdrawal"] }),
        ),
      ).toBe(true);
    });

    it("rejects unknown types and operators", () => {
      expect(() =>
        evaluateCondition(
          { type: "weather" } as unknown as Condition,
          context(),
        ),
      ).toThrow(/unknown condition type "weather"/);
      expect(() =>
        evaluateCondition(
          {
            type: "candidate-support",
            candidateId: "vitezy",
            operator: "==",
            value: 0.3,
          } as unknown as Condition,
          context(),
        ),
      ).toThrow(/unknown operator "=="/);
      expect(() =>
        evaluateCondition(null as unknown as Condition, context()),
      ).toThrow(ConditionEvaluationError);
    });
  });

  it("is deterministic for the same input", () => {
    const ctx = context();
    const results = Array.from({ length: 5 }, () =>
      evaluateCondition(withdrawalCondition, ctx),
    );
    expect(new Set(results).size).toBe(1);
  });
});
