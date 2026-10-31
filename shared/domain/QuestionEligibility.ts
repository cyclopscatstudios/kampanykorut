import { Condition, ConditionContext, RawQuestion } from "../types";
import { evaluateCondition } from "./ConditionEvaluator";

type AnswerRef = { questionId: string; answerId: string };

const answerSelected = ({ questionId, answerId }: AnswerRef): Condition => ({
  type: "answer-selected",
  questionId,
  answerId,
});

export function getQuestionCondition(
  question: RawQuestion,
): Condition | undefined {
  const parts: Condition[] = [];
  if (question.visibleIf) {
    parts.push(question.visibleIf);
  }
  if (question.requires?.length) {
    parts.push(...question.requires.map(answerSelected));
  }
  if (question.blocks?.length) {
    parts.push({ not: { or: question.blocks.map(answerSelected) } });
  }
  if (!parts.length) {
    return undefined;
  }
  return parts.length === 1 ? parts[0] : { and: parts };
}

export function isQuestionEligible(
  question: RawQuestion,
  getContext: () => ConditionContext,
): boolean {
  const condition = getQuestionCondition(question);
  return !condition || evaluateCondition(condition, getContext());
}

export function findNextQuestionIndex(
  questions: RawQuestion[],
  fromIndex: number,
  getContext: () => ConditionContext,
): number | undefined {
  for (let i = fromIndex; i < questions.length; i++) {
    if (isQuestionEligible(questions[i], getContext)) {
      return i;
    }
  }
  return undefined;
}

export function countEligibleQuestions(
  questions: RawQuestion[],
  fromIndex: number,
  getContext: () => ConditionContext,
): number {
  return questions
    .slice(Math.max(0, fromIndex))
    .filter((question) => isQuestionEligible(question, getContext)).length;
}
