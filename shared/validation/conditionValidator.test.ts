import { describe, expect, it } from "vitest";
import { ConditionReferences, validateCondition } from "./conditionValidator";

const refs: ConditionReferences = {
  questions: new Map([["question_12", new Set(["answer_1", "answer_3"])]]),
  candidateIds: new Set(["szentkiralyi", "vitezy", "karacsony"]),
  eventIds: new Set(["szentkiralyi_withdrawal"]),
};

const codes = (condition: unknown, references = refs) =>
  validateCondition(condition, references, "/if").map(
    (i) => `${i.code}@${i.path}`,
  );

describe("validateCondition", () => {
  it("accepts the planned withdrawal condition", () => {
    expect(
      codes({
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
          {
            type: "candidate-status",
            candidateId: "szentkiralyi",
            status: "active",
          },
          {
            not: {
              type: "event-triggered",
              eventId: "szentkiralyi_withdrawal",
            },
          },
        ],
      }),
    ).toEqual([]);
  });

  it("reports structural errors with their path", () => {
    expect(codes(null)).toEqual(["condition-invalid@/if"]);
    expect(codes({ and: [] })).toEqual(["condition-invalid@/if/and"]);
    expect(codes({ or: {} })).toEqual(["condition-invalid@/if/or"]);
    expect(codes({ and: [{ type: "turn", min: 1 }], type: "turn" })).toEqual([
      "condition-invalid@/if",
    ]);
    expect(codes({})).toEqual(["condition-invalid@/if"]);
    expect(codes({ not: [] })).toEqual(["condition-invalid@/if/not"]);
    expect(codes({ type: "weather" })).toEqual([
      "condition-type-unknown@/if/type",
    ]);
  });

  it("validates turn windows", () => {
    expect(codes({ type: "turn" })).toEqual(["condition-invalid@/if"]);
    expect(codes({ type: "turn", min: -1 })).toEqual([
      "condition-invalid@/if/min",
    ]);
    expect(codes({ type: "turn", max: 2.5 })).toEqual([
      "condition-invalid@/if/max",
    ]);
    expect(codes({ type: "turn", min: 30, max: 20 })).toEqual([
      "condition-invalid@/if",
    ]);
  });

  it("validates support comparisons", () => {
    const support = (patch: object) =>
      codes({
        type: "candidate-support",
        candidateId: "vitezy",
        operator: "<",
        value: 0.3,
        ...patch,
      });

    expect(support({ operator: "==" })).toEqual([
      "condition-invalid@/if/operator",
    ]);
    expect(support({ value: 30 })).toEqual(["condition-invalid@/if/value"]);
    expect(support({ value: "0.3" })).toEqual(["condition-invalid@/if/value"]);
    expect(support({ candidateId: "fidesz" })).toEqual([
      "unknown-candidate@/if/candidateId",
    ]);
  });

  it("reports unknown references in nested conditions", () => {
    expect(
      codes({
        or: [
          { type: "answer-selected", questionId: "question_99", answerId: "x" },
          {
            type: "answer-selected",
            questionId: "question_12",
            answerId: "answer_9",
          },
          { type: "candidate-status", candidateId: "vitezy", status: "gone" },
          { not: { type: "event-triggered", eventId: "missing" } },
        ],
      }),
    ).toEqual([
      "unknown-question@/if/or/0/questionId",
      "unknown-answer@/if/or/1/answerId",
      "condition-invalid@/if/or/2/status",
      "unknown-event@/if/or/3/not/eventId",
    ]);
  });

  it("skips reference checks that have no reference set", () => {
    expect(
      codes(
        {
          and: [
            { type: "answer-selected", questionId: "any", answerId: "any" },
            { type: "candidate-status", candidateId: "any", status: "active" },
            { type: "event-triggered", eventId: "any" },
          ],
        },
        {},
      ),
    ).toEqual([]);
  });
});
