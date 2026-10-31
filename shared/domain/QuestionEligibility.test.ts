import { vi } from "vitest";
import { ConditionContext, RawQuestion } from "../types";
import {
  countEligibleQuestions,
  findNextQuestionIndex,
  getQuestionCondition,
  isQuestionEligible,
} from "./QuestionEligibility";

const question = (
  id: string,
  patch: Partial<RawQuestion> = {},
): RawQuestion => ({
  id,
  question: "?",
  possibleAnswers: [{ id: "A", label: "A" }],
  ...patch,
});

const context = (
  answers: { questionId: string; answerId: string }[] = [],
  inactive: string[] = [],
): (() => ConditionContext) => {
  return () => ({
    turn: 0,
    answers,
    getSupport: () => undefined,
    getCandidateStatus: (id) => (inactive.includes(id) ? "inactive" : "active"),
    triggeredEventIds: [],
  });
};

const whileActive = {
  type: "candidate-status",
  candidateId: "szentkiralyi",
  status: "active",
} as const;

describe("getQuestionCondition", () => {
  it("has no condition for a plain question", () => {
    expect(getQuestionCondition(question("q1"))).toBeUndefined();
  });

  it("combines visibleIf, requires and blocks", () => {
    expect(
      getQuestionCondition(
        question("q3", {
          visibleIf: whileActive,
          requires: [{ questionId: "q1", answerId: "A" }],
          blocks: [
            { questionId: "q2", answerId: "A" },
            { questionId: "q2", answerId: "B" },
          ],
        }),
      ),
    ).toEqual({
      and: [
        whileActive,
        { type: "answer-selected", questionId: "q1", answerId: "A" },
        {
          not: {
            or: [
              { type: "answer-selected", questionId: "q2", answerId: "A" },
              { type: "answer-selected", questionId: "q2", answerId: "B" },
            ],
          },
        },
      ],
    });
  });
});

describe("question eligibility", () => {
  const questions = [
    question("q1"),
    question("q2", { requires: [{ questionId: "q1", answerId: "A" }] }),
    question("q3", { blocks: [{ questionId: "q1", answerId: "A" }] }),
    question("q4", { visibleIf: whileActive }),
    question("q4_after", { visibleIf: { not: whileActive } }),
  ];

  it("checks requires and blocks against the given answers", () => {
    const answered = context([{ questionId: "q1", answerId: "A" }]);
    expect(isQuestionEligible(questions[1], answered)).toBe(true);
    expect(isQuestionEligible(questions[2], answered)).toBe(false);
    expect(isQuestionEligible(questions[1], context())).toBe(false);
    expect(isQuestionEligible(questions[2], context())).toBe(true);
  });

  it("finds the next eligible question from a position", () => {
    expect(findNextQuestionIndex(questions, 1, context())).toBe(2);
    expect(
      findNextQuestionIndex(questions, 3, context([], ["szentkiralyi"])),
    ).toBe(4);
    expect(findNextQuestionIndex(questions, 5, context())).toBeUndefined();
  });

  it("counts the remaining eligible questions", () => {
    expect(countEligibleQuestions(questions, 0, context())).toBe(3);
    expect(
      countEligibleQuestions(
        questions,
        0,
        context([{ questionId: "q1", answerId: "A" }], ["szentkiralyi"]),
      ),
    ).toBe(3);
  });

  it("does not build a context for questions without conditions", () => {
    const getContext = vi.fn(context());
    findNextQuestionIndex([question("q1")], 0, getContext);
    expect(getContext).not.toHaveBeenCalled();
  });
});
