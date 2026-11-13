import { describe, expect, it } from "vitest";
import { ConditionReferences, validateCondition } from "./conditionValidator";

const refs: ConditionReferences = {
  questions: new Map([["question_12", new Set(["answer_1", "answer_3"])]]),
  candidateIds: new Set(["szentkiralyi", "vitezy", "karacsony"]),
  eventIds: new Set(["szentkiralyi_withdrawal"]),
  focusIds: new Set(["without_kadar"]),
  relationIds: new Set(["moszkva"]),
  issueIds: new Set(["kelet_nyugat"]),
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

  it("validates candidate ranks", () => {
    const rank = (patch: object) =>
      codes({ type: "candidate-rank", candidateId: "vitezy", ...patch });

    expect(rank({ min: 3, minGapBehind: 0.03 })).toEqual([]);
    expect(rank({ max: 1 })).toEqual([]);
    expect(rank({})).toEqual(["condition-invalid@/if"]);
    expect(rank({ min: 0 })).toEqual(["condition-invalid@/if/min"]);
    expect(rank({ max: 1.5 })).toEqual(["condition-invalid@/if/max"]);
    expect(rank({ min: 3, max: 2 })).toEqual(["condition-invalid@/if"]);
    expect(rank({ min: 3, minGapBehind: 3 })).toEqual([
      "condition-invalid@/if/minGapBehind",
    ]);
    expect(rank({ max: 2, maxGapBehind: -0.1 })).toEqual([
      "condition-invalid@/if/maxGapBehind",
    ]);
    expect(rank({ max: 2, minGapBehind: 0.1, maxGapBehind: 0.05 })).toEqual([
      "condition-invalid@/if",
    ]);
    expect(rank({ min: 1, candidateId: "fidesz" })).toEqual([
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

  it("checks the candidate of a player-candidate condition", () => {
    expect(
      codes({ not: { type: "player-candidate", candidateId: "vitezy" } }),
    ).toEqual([]);
    expect(codes({ type: "player-candidate", candidateId: "nobody" })).toEqual([
      "unknown-candidate@/if/candidateId",
    ]);
    expect(codes({ type: "player-candidate" })).toEqual([
      "condition-invalid@/if/candidateId",
    ]);
  });

  it("checks the focus of a focus-selected condition", () => {
    expect(codes({ type: "focus-selected", focusId: "without_kadar" })).toEqual(
      [],
    );
    expect(codes({ type: "focus-selected", focusId: "nope" })).toEqual([
      "unknown-focus@/if/focusId",
    ]);
    expect(codes({ type: "focus-selected" })).toEqual([
      "condition-invalid@/if/focusId",
    ]);
  });

  it("checks the relation and tones of a relation condition", () => {
    expect(
      codes({ type: "relation", relationId: "moszkva", tone: ["bad"] }),
    ).toEqual([]);
    expect(
      codes({ type: "relation", relationId: "nope", tone: ["sad"] }),
    ).toEqual([
      "unknown-relation@/if/relationId",
      "condition-invalid@/if/tone",
    ]);
    expect(
      codes({ type: "relation", relationId: "moszkva", tone: [] }),
    ).toEqual(["condition-invalid@/if/tone"]);
  });

  it("checks the issue and bounds of an issue-position condition", () => {
    expect(
      codes({ type: "issue-position", issueId: "kelet_nyugat", min: 2 }),
    ).toEqual([]);
    expect(
      codes({ type: "issue-position", issueId: "nope", party: "x", max: 3 }),
    ).toEqual([
      "unknown-issue@/if/issueId",
      "unknown-candidate@/if/party",
      "condition-invalid@/if/max",
    ]);
    expect(codes({ type: "issue-position", issueId: "kelet_nyugat" })).toEqual([
      "condition-invalid@/if",
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
            { type: "focus-selected", focusId: "any" },
            { type: "relation", relationId: "any", tone: ["good"] },
          ],
        },
        {},
      ),
    ).toEqual([]);
  });
});
