import {
  CandidateRankCondition,
  Condition,
  ConditionContext,
  LeafCondition,
} from "../types";

export class ConditionEvaluationError extends Error {
  constructor(
    message: string,
    readonly condition: unknown,
  ) {
    super(message);
    this.name = "ConditionEvaluationError";
  }
}

export function evaluateCondition(
  condition: Condition,
  context: ConditionContext,
): boolean {
  if (typeof condition !== "object" || condition === null) {
    throw new ConditionEvaluationError(
      "condition must be an object",
      condition,
    );
  }
  if ("and" in condition) {
    return requireChildren(condition.and, condition).every((child) =>
      evaluateCondition(child, context),
    );
  }
  if ("or" in condition) {
    return requireChildren(condition.or, condition).some((child) =>
      evaluateCondition(child, context),
    );
  }
  if ("not" in condition) {
    return !evaluateCondition(condition.not, context);
  }
  return evaluateLeaf(condition, context);
}

function requireChildren(children: Condition[], condition: Condition) {
  if (!Array.isArray(children) || children.length === 0) {
    throw new ConditionEvaluationError(
      "and/or conditions need at least one child",
      condition,
    );
  }
  return children;
}

function evaluateLeaf(
  condition: LeafCondition,
  context: ConditionContext,
): boolean {
  switch (condition.type) {
    case "turn":
      return (
        (condition.min === undefined || context.turn >= condition.min) &&
        (condition.max === undefined || context.turn <= condition.max)
      );
    case "candidate-support": {
      const support = context.getSupport(condition.candidateId);
      if (support === undefined) {
        throw new ConditionEvaluationError(
          `no support value for candidate "${condition.candidateId}"`,
          condition,
        );
      }
      return compare(support, condition.operator, condition.value, condition);
    }
    case "candidate-rank":
      return evaluateRank(condition, context);
    case "answer-selected":
      return context.answers.some(
        (a) =>
          a.questionId === condition.questionId &&
          a.answerId === condition.answerId,
      );
    case "candidate-status":
      return (
        context.getCandidateStatus(condition.candidateId) === condition.status
      );
    case "player-candidate":
      return context.playerCandidateId === condition.candidateId;
    case "event-triggered":
      return context.triggeredEventIds.includes(condition.eventId);
    case "focus-selected":
      return context.selectedFocusId === condition.focusId;
    default:
      throw new ConditionEvaluationError(
        `unknown condition type "${(condition as { type?: unknown }).type}"`,
        condition,
      );
  }
}

function evaluateRank(
  condition: CandidateRankCondition,
  context: ConditionContext,
) {
  if (context.getSupport(condition.candidateId) === undefined) {
    throw new ConditionEvaluationError(
      `no support value for candidate "${condition.candidateId}"`,
      condition,
    );
  }
  const standings = context.getStandings() ?? [];
  const index = standings.findIndex(
    (s) => s.candidateId === condition.candidateId,
  );
  if (index < 0) {
    return false;
  }
  const rank = index + 1;
  if (
    (condition.min !== undefined && rank < condition.min) ||
    (condition.max !== undefined && rank > condition.max)
  ) {
    return false;
  }
  const ahead = standings[index - 1];
  const gap = ahead ? ahead.share - standings[index].share : undefined;
  if (
    condition.minGapBehind !== undefined &&
    (gap === undefined || gap < condition.minGapBehind)
  ) {
    return false;
  }
  return (
    condition.maxGapBehind === undefined ||
    gap === undefined ||
    gap <= condition.maxGapBehind
  );
}

function compare(
  actual: number,
  operator: string,
  expected: number,
  condition: Condition,
) {
  switch (operator) {
    case "<":
      return actual < expected;
    case "<=":
      return actual <= expected;
    case ">":
      return actual > expected;
    case ">=":
      return actual >= expected;
    default:
      throw new ConditionEvaluationError(
        `unknown operator "${operator}"`,
        condition,
      );
  }
}
