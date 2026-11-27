import {
  Condition,
  ConditionContext,
  QuestionVariants,
  RawQuestion,
} from "@shared/types";
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

export function pickQuestionVariants(
  questions: RawQuestion[],
  random: () => number = Math.random,
): QuestionVariants | undefined {
  const groups = new Map<string, string[]>();
  for (const question of questions) {
    if (question.alternativeTo) {
      const group = groups.get(question.alternativeTo) ?? [
        question.alternativeTo,
      ];
      groups.set(question.alternativeTo, [...group, question.id]);
    }
  }
  if (!groups.size) {
    return undefined;
  }
  return Object.fromEntries(
    [...groups].map(([mainId, options]) => [
      mainId,
      options[
        Math.min(options.length - 1, Math.floor(random() * options.length))
      ],
    ]),
  );
}

// Saves without drawn variants keep the main questions.
export function isSelectedVariant(
  question: RawQuestion,
  variants: QuestionVariants | undefined,
): boolean {
  const mainId = question.alternativeTo ?? question.id;
  return (variants?.[mainId] ?? mainId) === question.id;
}

export function findNextQuestionIndex(
  questions: RawQuestion[],
  fromIndex: number,
  getContext: () => ConditionContext,
  variants?: QuestionVariants,
): number | undefined {
  for (let i = fromIndex; i < questions.length; i++) {
    if (
      isSelectedVariant(questions[i], variants) &&
      isQuestionEligible(questions[i], getContext)
    ) {
      return i;
    }
  }
  return undefined;
}

export function countEligibleQuestions(
  questions: RawQuestion[],
  fromIndex: number,
  getContext: () => ConditionContext,
  variants?: QuestionVariants,
): number {
  return questions
    .slice(Math.max(0, fromIndex))
    .filter(
      (question) =>
        isSelectedVariant(question, variants) &&
        isQuestionEligible(question, getContext),
    ).length;
}
