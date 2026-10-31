export interface ConditionReferences {
  questions?: Map<string, Set<string>>;
  candidateIds?: Set<string>;
  eventIds?: Set<string>;
}

export interface ConditionIssue {
  code: string;
  path: string;
  message: string;
}

const OPERATORS = ["<", "<=", ">", ">="];
const STATUSES = ["active", "inactive"];
const COMBINATORS = ["and", "or", "not"] as const;

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonNegativeInteger = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

export function validateCondition(
  condition: unknown,
  refs: ConditionReferences = {},
  path = "",
): ConditionIssue[] {
  const issues: ConditionIssue[] = [];
  check(condition, refs, path, issues);
  return issues;
}

function check(
  condition: unknown,
  refs: ConditionReferences,
  path: string,
  issues: ConditionIssue[],
) {
  const issue = (code: string, at: string, message: string) =>
    issues.push({ code, path: at, message });

  if (!isObject(condition)) {
    issue("condition-invalid", path, "condition must be an object");
    return;
  }

  const keys = [
    ...COMBINATORS.filter((key) => key in condition),
    ...("type" in condition ? ["type"] : []),
  ];
  if (keys.length !== 1) {
    issue(
      "condition-invalid",
      path,
      "condition must have exactly one of and, or, not, type",
    );
    return;
  }

  if ("and" in condition || "or" in condition) {
    const key = "and" in condition ? "and" : "or";
    const children = condition[key];
    if (!Array.isArray(children) || children.length === 0) {
      issue(
        "condition-invalid",
        `${path}/${key}`,
        `${key} must be a non-empty array`,
      );
      return;
    }
    children.forEach((child, i) =>
      check(child, refs, `${path}/${key}/${i}`, issues),
    );
    return;
  }

  if ("not" in condition) {
    check(condition.not, refs, `${path}/not`, issues);
    return;
  }

  switch (condition.type) {
    case "turn": {
      const { min, max } = condition;
      if (min === undefined && max === undefined) {
        issue("condition-invalid", path, "turn needs min, max or both");
      }
      for (const [key, value] of Object.entries({ min, max })) {
        if (value !== undefined && !isNonNegativeInteger(value)) {
          issue(
            "condition-invalid",
            `${path}/${key}`,
            `${key} must be a non-negative integer`,
          );
        }
      }
      if (
        isNonNegativeInteger(min) &&
        isNonNegativeInteger(max) &&
        (min as number) > (max as number)
      ) {
        issue("condition-invalid", path, "min must not be greater than max");
      }
      return;
    }
    case "candidate-support":
      checkCandidate(condition.candidateId, refs, `${path}/candidateId`, issue);
      if (!OPERATORS.includes(String(condition.operator))) {
        issue(
          "condition-invalid",
          `${path}/operator`,
          `operator must be one of ${OPERATORS.join(", ")}`,
        );
      }
      if (
        typeof condition.value !== "number" ||
        !Number.isFinite(condition.value) ||
        condition.value < 0 ||
        condition.value > 1
      ) {
        issue(
          "condition-invalid",
          `${path}/value`,
          "value must be a share between 0 and 1",
        );
      }
      return;
    case "candidate-status":
      checkCandidate(condition.candidateId, refs, `${path}/candidateId`, issue);
      if (!STATUSES.includes(String(condition.status))) {
        issue(
          "condition-invalid",
          `${path}/status`,
          `status must be one of ${STATUSES.join(", ")}`,
        );
      }
      return;
    case "answer-selected": {
      const questionId = String(condition.questionId);
      const answers = refs.questions?.get(questionId);
      if (typeof condition.questionId !== "string") {
        issue(
          "condition-invalid",
          `${path}/questionId`,
          "questionId must be a string",
        );
      } else if (refs.questions && !answers) {
        issue(
          "unknown-question",
          `${path}/questionId`,
          `unknown question "${questionId}"`,
        );
      }
      if (typeof condition.answerId !== "string") {
        issue(
          "condition-invalid",
          `${path}/answerId`,
          "answerId must be a string",
        );
      } else if (answers && !answers.has(condition.answerId)) {
        issue(
          "unknown-answer",
          `${path}/answerId`,
          `question "${questionId}" has no answer "${condition.answerId}"`,
        );
      }
      return;
    }
    case "event-triggered":
      if (typeof condition.eventId !== "string") {
        issue(
          "condition-invalid",
          `${path}/eventId`,
          "eventId must be a string",
        );
      } else if (refs.eventIds && !refs.eventIds.has(condition.eventId)) {
        issue(
          "unknown-event",
          `${path}/eventId`,
          `unknown event "${condition.eventId}"`,
        );
      }
      return;
    default:
      issue(
        "condition-type-unknown",
        `${path}/type`,
        `unknown condition type "${String(condition.type)}"`,
      );
  }
}

function checkCandidate(
  candidateId: unknown,
  refs: ConditionReferences,
  path: string,
  issue: (code: string, at: string, message: string) => void,
) {
  if (typeof candidateId !== "string") {
    issue("condition-invalid", path, "candidateId must be a string");
  } else if (refs.candidateIds && !refs.candidateIds.has(candidateId)) {
    issue("unknown-candidate", path, `unknown candidate "${candidateId}"`);
  }
}
