import { evaluateCondition } from "../domain/ConditionEvaluator";
import { defaultGroups } from "../domain/DefaultGroups";
import { getQuestionCondition } from "../domain/QuestionEligibility";
import { CandidateStatus, Condition, RawQuestion } from "../types";
import { validateCondition } from "./conditionValidator";

export type Severity = "error" | "warning";

export interface Diagnostic {
  severity: Severity;
  code: string;
  file: string;
  path: string;
  message: string;
}

export interface CampaignHeaderInput {
  id: string;
  route: string;
  campaignBanner?: string;
  thinCampaignBanner?: string;
}

export type ReadResult =
  | { ok: true; data: unknown }
  | { ok: false; reason: "missing" | "invalid-json"; message?: string };

export interface CampaignSource {
  readCampaignFile(route: string, relativePath: string): ReadResult;
  publicFileExists(publicPath: string): boolean;
}

export const SUPPORTED_SCHEMA_VERSIONS = [1];

const EFFECT_TYPES = [
  "uniform-swing",
  "vote-allocation",
  "turnout-change",
  "district-vote-transfer",
];

const DISTRICT_MAPS = ["2011", "2024"];

const ELECTION_TYPES = ["parliamentary", "mayoral"];

const RESULT_RULES = ["plurality"];

const WITHDRAW_REASONS = ["withdrawal", "disqualification", "other"];

type Json = Record<string, unknown>;

interface QuestionInfo {
  index: number;
  answers: Set<string>;
}

interface Context {
  diagnostics: Diagnostic[];
  source: CampaignSource;
  route: string;
  parties: Set<string>;
  groups: Set<string>;
  districts: Set<string>;
  electionType?: string;
  playableCandidates: Set<string>;
  eventIds: Set<string>;
}

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const districtKey = (megyekod: unknown, oevk: unknown) => `${megyekod}-${oevk}`;

function report(
  ctx: Context,
  severity: Severity,
  code: string,
  file: string,
  path: string,
  message: string,
) {
  ctx.diagnostics.push({ severity, code, file, path, message });
}

function isInsideBundle(relativePath: string) {
  const segments = relativePath.split(/[\\/]/);
  return (
    !relativePath.startsWith("/") &&
    !/^[a-zA-Z]:/.test(relativePath) &&
    !segments.includes("..")
  );
}

function readFile(
  ctx: Context,
  relativePath: unknown,
  referencedFrom: string,
  path: string,
): unknown {
  if (typeof relativePath !== "string" || !relativePath) {
    report(
      ctx,
      "error",
      "manifest-path-invalid",
      referencedFrom,
      path,
      "file path must be a non-empty string",
    );
    return undefined;
  }
  if (!isInsideBundle(relativePath)) {
    report(
      ctx,
      "error",
      "manifest-path-outside-bundle",
      referencedFrom,
      path,
      `"${relativePath}" points outside the campaign folder`,
    );
    return undefined;
  }

  const result = ctx.source.readCampaignFile(ctx.route, relativePath);
  if (!result.ok) {
    report(
      ctx,
      "error",
      result.reason === "missing" ? "file-missing" : "file-invalid-json",
      relativePath,
      "",
      result.reason === "missing"
        ? `referenced from ${referencedFrom}${path} but does not exist`
        : `invalid JSON: ${result.message ?? ""}`,
    );
    return undefined;
  }
  return result.data;
}

function checkPublicAsset(
  ctx: Context,
  file: string,
  path: string,
  publicPath: unknown,
) {
  if (typeof publicPath !== "string" || !publicPath) {
    report(
      ctx,
      "error",
      "asset-path-invalid",
      file,
      path,
      "asset path must be a non-empty string",
    );
    return;
  }
  if (!ctx.source.publicFileExists(publicPath)) {
    report(
      ctx,
      "error",
      "asset-missing",
      file,
      path,
      `"${publicPath}" does not exist`,
    );
  }
}

function checkParty(ctx: Context, file: string, path: string, party: unknown) {
  if (typeof party !== "string" || !ctx.parties.has(party)) {
    report(
      ctx,
      "error",
      "unknown-party",
      file,
      path,
      `unknown party "${String(party)}"`,
    );
  }
}

function checkPartyNumberMap(
  ctx: Context,
  file: string,
  path: string,
  params: unknown,
) {
  if (!isObject(params) || Object.keys(params).length === 0) {
    report(
      ctx,
      "error",
      "effect-params-invalid",
      file,
      path,
      "params must be a non-empty object of party -> number",
    );
    return;
  }
  for (const [party, value] of Object.entries(params)) {
    checkParty(ctx, file, `${path}/${party}`, party);
    if (!isFiniteNumber(value)) {
      report(
        ctx,
        "error",
        "effect-value-invalid",
        file,
        `${path}/${party}`,
        "value must be a finite number",
      );
    }
  }
}

function checkVoteSource(
  ctx: Context,
  file: string,
  path: string,
  from: unknown,
) {
  if (from === undefined) {
    return;
  }
  if (!isObject(from)) {
    report(
      ctx,
      "error",
      "vote-source-invalid",
      file,
      path,
      "from must be an object",
    );
    return;
  }
  if (from.type === "bizonytalan") {
    return;
  }
  if (from.type === "party") {
    checkParty(ctx, file, `${path}/party`, from.party);
    return;
  }
  report(
    ctx,
    "error",
    "vote-source-invalid",
    file,
    `${path}/type`,
    `unknown vote source type "${String(from.type)}"`,
  );
}

function checkDistrictTransfer(
  ctx: Context,
  file: string,
  path: string,
  params: unknown,
) {
  if (!Array.isArray(params) || params.length === 0) {
    report(
      ctx,
      "error",
      "effect-params-invalid",
      file,
      path,
      "params must be a non-empty array",
    );
    return;
  }

  const isGroupForm = isObject(params[0]) && "groupId" in params[0];

  params.forEach((target, i) => {
    const targetPath = `${path}/${i}`;
    if (!isObject(target)) {
      report(
        ctx,
        "error",
        "effect-params-invalid",
        file,
        targetPath,
        "target must be an object",
      );
      return;
    }
    if ("type" in target) {
      report(
        ctx,
        "error",
        "effect-nested",
        file,
        targetPath,
        "an effect is nested inside params; move it to the effects array",
      );
      return;
    }
    if (isGroupForm !== "groupId" in target) {
      report(
        ctx,
        "error",
        "district-target-mixed",
        file,
        targetPath,
        "all targets of one effect must use the same form (groupId or megyekod/oevk)",
      );
      return;
    }
    if (isGroupForm) {
      if (
        typeof target.groupId !== "string" ||
        !ctx.groups.has(target.groupId)
      ) {
        report(
          ctx,
          "error",
          "unknown-group",
          file,
          `${targetPath}/groupId`,
          `unknown district group "${String(target.groupId)}"`,
        );
      }
    } else if (!ctx.districts.has(districtKey(target.megyekod, target.oevk))) {
      report(
        ctx,
        "error",
        "unknown-district",
        file,
        targetPath,
        `unknown district ${districtKey(target.megyekod, target.oevk)}`,
      );
    }
    checkParty(ctx, file, `${targetPath}/targetParty`, target.targetParty);
    if (!isFiniteNumber(target.amount)) {
      report(
        ctx,
        "error",
        "effect-value-invalid",
        file,
        `${targetPath}/amount`,
        "amount must be a finite number",
      );
    }
    checkVoteSource(ctx, file, `${targetPath}/from`, target.from);
  });
}

function checkEffect(
  ctx: Context,
  file: string,
  path: string,
  effect: unknown,
) {
  if (!isObject(effect)) {
    report(
      ctx,
      "error",
      "effect-invalid",
      file,
      path,
      "effect must be an object",
    );
    return;
  }
  if (typeof effect.type !== "string" || !EFFECT_TYPES.includes(effect.type)) {
    report(
      ctx,
      "error",
      "effect-type-unknown",
      file,
      path,
      effect.type === undefined
        ? "effect has no type (is it a bare params object?)"
        : `unknown effect type "${String(effect.type)}"`,
    );
    return;
  }

  const paramsPath = `${path}/params`;
  switch (effect.type) {
    case "uniform-swing":
    case "turnout-change":
      checkPartyNumberMap(ctx, file, paramsPath, effect.params);
      break;
    case "vote-allocation": {
      const params = effect.params;
      if (!isObject(params) || !isFiniteNumber(params.newVotes)) {
        report(
          ctx,
          "error",
          "effect-params-invalid",
          file,
          paramsPath,
          "params must contain a finite newVotes and a share map",
        );
        return;
      }
      checkPartyNumberMap(ctx, file, `${paramsPath}/share`, params.share);
      break;
    }
    case "district-vote-transfer":
      checkDistrictTransfer(ctx, file, paramsPath, effect.params);
      break;
  }
}

function checkEffects(
  ctx: Context,
  file: string,
  path: string,
  effects: unknown,
) {
  if (!Array.isArray(effects)) {
    report(
      ctx,
      "error",
      "effects-invalid",
      file,
      path,
      "effects must be an array",
    );
    return;
  }
  effects.forEach((effect, i) =>
    checkEffect(ctx, file, `${path}/${i}`, effect),
  );
}

function checkAnswerConditions(
  ctx: Context,
  questions: Map<string, QuestionInfo>,
  file: string,
  path: string,
  conditions: unknown,
  beforeQuestionIndex?: number,
) {
  if (!Array.isArray(conditions)) {
    report(
      ctx,
      "error",
      "conditions-invalid",
      file,
      path,
      "conditions must be an array",
    );
    return;
  }
  conditions.forEach((condition, i) => {
    const conditionPath = `${path}/${i}`;
    if (!isObject(condition)) {
      report(
        ctx,
        "error",
        "conditions-invalid",
        file,
        conditionPath,
        "condition must be an object",
      );
      return;
    }
    const question = questions.get(String(condition.questionId));
    if (!question) {
      report(
        ctx,
        "error",
        "unknown-question",
        file,
        `${conditionPath}/questionId`,
        `unknown question "${String(condition.questionId)}"`,
      );
      return;
    }
    if (!question.answers.has(String(condition.answerId))) {
      report(
        ctx,
        "error",
        "unknown-answer",
        file,
        `${conditionPath}/answerId`,
        `question "${String(condition.questionId)}" has no answer "${String(condition.answerId)}"`,
      );
    }
    if (
      beforeQuestionIndex !== undefined &&
      question.index >= beforeQuestionIndex
    ) {
      report(
        ctx,
        "warning",
        "condition-not-yet-answered",
        file,
        conditionPath,
        `"${String(condition.questionId)}" is not answered before this point, so the condition can never match`,
      );
    }
  });
}

function checkQuestions(ctx: Context, file: string, data: unknown) {
  const questions = new Map<string, QuestionInfo>();
  if (!Array.isArray(data) || data.length === 0) {
    report(
      ctx,
      "error",
      "questions-invalid",
      file,
      "",
      "questions must be a non-empty array",
    );
    return questions;
  }
  data.forEach((question, index) => {
    const path = `/${index}`;
    if (!isObject(question) || typeof question.id !== "string") {
      report(
        ctx,
        "error",
        "question-invalid",
        file,
        path,
        "question must be an object with a string id",
      );
      return;
    }
    if (questions.has(question.id)) {
      report(
        ctx,
        "error",
        "duplicate-id",
        file,
        `${path}/id`,
        `duplicate question id "${question.id}"`,
      );
    }
    const answers = new Set<string>();
    if (
      !Array.isArray(question.possibleAnswers) ||
      question.possibleAnswers.length === 0
    ) {
      report(
        ctx,
        "error",
        "question-invalid",
        file,
        `${path}/possibleAnswers`,
        "possibleAnswers must be a non-empty array",
      );
    } else {
      question.possibleAnswers.forEach((answer, i) => {
        if (
          !isObject(answer) ||
          typeof answer.id !== "string" ||
          typeof answer.label !== "string"
        ) {
          report(
            ctx,
            "error",
            "question-invalid",
            file,
            `${path}/possibleAnswers/${i}`,
            "answer must have a string id and label",
          );
          return;
        }
        if (answers.has(answer.id)) {
          report(
            ctx,
            "error",
            "duplicate-id",
            file,
            `${path}/possibleAnswers/${i}/id`,
            `duplicate answer id "${answer.id}"`,
          );
        }
        answers.add(answer.id);
      });
    }
    questions.set(question.id, { index, answers });
  });
  checkQuestionConditions(ctx, file, data, questions);
  return questions;
}

function checkQuestionConditions(
  ctx: Context,
  file: string,
  data: unknown[],
  questions: Map<string, QuestionInfo>,
) {
  const refs = {
    questions: new Map(
      [...questions].map(([id, info]) => [id, info.answers] as const),
    ),
    candidateIds: ctx.parties,
    eventIds: ctx.eventIds,
  };
  let valid = true;
  data.forEach((question, index) => {
    if (!isObject(question)) {
      return;
    }
    if (question.visibleIf !== undefined) {
      const issues = validateCondition(
        question.visibleIf,
        refs,
        `/${index}/visibleIf`,
      );
      issues.forEach((issue) =>
        report(ctx, "error", issue.code, file, issue.path, issue.message),
      );
      valid &&= issues.length === 0;
    }
    for (const key of ["requires", "blocks"] as const) {
      if (question[key] !== undefined) {
        const before = ctx.diagnostics.length;
        checkAnswerConditions(
          ctx,
          questions,
          file,
          `/${index}/${key}`,
          question[key],
          index,
        );
        valid &&= ctx.diagnostics.length === before;
      }
    }
  });
  if (valid) {
    checkQuestionCountBalance(ctx, file, data as RawQuestion[]);
  }
}

function collectStatusCandidates(
  condition: Condition,
  candidates: Set<string>,
): boolean {
  if ("and" in condition || "or" in condition) {
    const children = "and" in condition ? condition.and : condition.or;
    return children.every((child) =>
      collectStatusCandidates(child, candidates),
    );
  }
  if ("not" in condition) {
    return collectStatusCandidates(condition.not, candidates);
  }
  if (condition.type === "candidate-status") {
    candidates.add(condition.candidateId);
    return true;
  }
  return false;
}

const MAX_BALANCE_CANDIDATES = 8;

function checkQuestionCountBalance(
  ctx: Context,
  file: string,
  questions: RawQuestion[],
) {
  const conditions = questions.map(getQuestionCondition);
  const candidates = new Set<string>();
  const verifiable = conditions.every(
    (condition) => !condition || collectStatusCandidates(condition, candidates),
  );
  if (
    !verifiable ||
    candidates.size === 0 ||
    candidates.size > MAX_BALANCE_CANDIDATES
  ) {
    return;
  }

  const ids = [...candidates].sort();
  const counts = new Map<number, string>();
  for (let mask = 0; mask < 1 << ids.length; mask++) {
    const inactive = ids.filter((_, i) => mask & (1 << i));
    const status = (id: string): CandidateStatus =>
      inactive.includes(id) ? "inactive" : "active";
    const context = {
      turn: 0,
      answers: [],
      getSupport: () => undefined,
      getCandidateStatus: status,
      triggeredEventIds: [],
    };
    const visible = conditions.filter(
      (condition) => !condition || evaluateCondition(condition, context),
    ).length;
    if (!counts.has(visible)) {
      counts.set(
        visible,
        inactive.length ? `${inactive.join(", ")} inactive` : "all active",
      );
    }
  }

  if (counts.size > 1) {
    const summary = [...counts]
      .sort(([a], [b]) => b - a)
      .map(([count, label]) => `${count} (${label})`)
      .join(", ");
    report(
      ctx,
      "warning",
      "question-count-differs",
      file,
      "",
      `the number of shown questions depends on candidate status: ${summary}; every branch must replace exactly the questions it skips`,
    );
  }
}

function checkAnswerEffects(
  ctx: Context,
  questions: Map<string, QuestionInfo>,
  file: string,
  data: unknown,
) {
  if (!Array.isArray(data)) {
    report(
      ctx,
      "error",
      "answer-effects-invalid",
      file,
      "",
      "answer effects must be an array",
    );
    return;
  }
  const covered = new Map<string, Set<string>>();
  data.forEach((entry, index) => {
    const path = `/${index}`;
    if (!isObject(entry) || typeof entry.id !== "string") {
      report(
        ctx,
        "error",
        "answer-effects-invalid",
        file,
        path,
        "entry must be an object with a string id",
      );
      return;
    }
    const question = questions.get(entry.id);
    if (!question) {
      report(
        ctx,
        "error",
        "unknown-question",
        file,
        `${path}/id`,
        `unknown question "${entry.id}"`,
      );
    }
    if (!Array.isArray(entry.answers)) {
      report(
        ctx,
        "error",
        "answer-effects-invalid",
        file,
        `${path}/answers`,
        "answers must be an array",
      );
      return;
    }
    const answerIds = new Set<string>();
    entry.answers.forEach((answer, i) => {
      const answerPath = `${path}/answers/${i}`;
      if (!isObject(answer) || typeof answer.id !== "string") {
        report(
          ctx,
          "error",
          "answer-effects-invalid",
          file,
          answerPath,
          "answer must have a string id",
        );
        return;
      }
      if (question && !question.answers.has(answer.id)) {
        report(
          ctx,
          "error",
          "unknown-answer",
          file,
          `${answerPath}/id`,
          `question "${entry.id}" has no answer "${answer.id}"`,
        );
      }
      answerIds.add(answer.id);
      checkEffects(ctx, file, `${answerPath}/effects`, answer.effects);
      if (answer.conditionalEffects !== undefined) {
        if (!Array.isArray(answer.conditionalEffects)) {
          report(
            ctx,
            "error",
            "conditional-effects-invalid",
            file,
            `${answerPath}/conditionalEffects`,
            "conditionalEffects must be an array",
          );
          return;
        }
        answer.conditionalEffects.forEach((cond, c) => {
          const condPath = `${answerPath}/conditionalEffects/${c}`;
          if (!isObject(cond)) {
            report(
              ctx,
              "error",
              "conditional-effects-invalid",
              file,
              condPath,
              "conditional effect must be an object",
            );
            return;
          }
          if (cond.mode !== "merge" && cond.mode !== "replace") {
            report(
              ctx,
              "error",
              "conditional-effects-invalid",
              file,
              `${condPath}/mode`,
              'mode must be "merge" or "replace"',
            );
          }
          checkAnswerConditions(
            ctx,
            questions,
            file,
            `${condPath}/if`,
            cond.if,
            question?.index,
          );
          checkEffects(ctx, file, `${condPath}/effects`, cond.effects);
        });
      }
    });
    covered.set(entry.id, answerIds);
  });

  for (const [questionId, question] of questions) {
    const answerIds = covered.get(questionId);
    if (!answerIds) {
      report(
        ctx,
        "error",
        "missing-answer-effects",
        file,
        "",
        `question "${questionId}" has no answer effects`,
      );
      continue;
    }
    for (const answerId of question.answers) {
      if (!answerIds.has(answerId)) {
        report(
          ctx,
          "error",
          "missing-answer-effects",
          file,
          "",
          `answer "${answerId}" of question "${questionId}" has no effects entry`,
        );
      }
    }
  }
}

function checkStrategies(
  ctx: Context,
  questions: Map<string, QuestionInfo>,
  file: string,
  data: unknown,
) {
  if (!Array.isArray(data)) {
    report(
      ctx,
      "error",
      "strategies-invalid",
      file,
      "",
      "strategies must be an array",
    );
    return;
  }
  const ids = new Set<string>();
  data.forEach((strategy, index) => {
    const path = `/${index}`;
    if (!isObject(strategy) || typeof strategy.id !== "string") {
      report(
        ctx,
        "error",
        "strategies-invalid",
        file,
        path,
        "strategy must have a string id",
      );
      return;
    }
    if (ids.has(strategy.id)) {
      report(
        ctx,
        "error",
        "duplicate-id",
        file,
        `${path}/id`,
        `duplicate strategy id "${strategy.id}"`,
      );
    }
    ids.add(strategy.id);
    checkAnswerConditions(
      ctx,
      questions,
      file,
      `${path}/conditions`,
      strategy.conditions,
    );
    const conditionCount = Array.isArray(strategy.conditions)
      ? strategy.conditions.length
      : 0;
    if (!Array.isArray(strategy.rewards) || strategy.rewards.length === 0) {
      report(
        ctx,
        "error",
        "strategies-invalid",
        file,
        `${path}/rewards`,
        "rewards must be a non-empty array",
      );
      return;
    }
    strategy.rewards.forEach((reward, r) => {
      const rewardPath = `${path}/rewards/${r}`;
      if (
        !isObject(reward) ||
        !Number.isInteger(reward.minMatches) ||
        (reward.minMatches as number) < 1
      ) {
        report(
          ctx,
          "error",
          "strategies-invalid",
          file,
          `${rewardPath}/minMatches`,
          "minMatches must be a positive integer",
        );
        return;
      }
      if ((reward.minMatches as number) > conditionCount) {
        report(
          ctx,
          "warning",
          "strategy-unreachable",
          file,
          `${rewardPath}/minMatches`,
          `needs ${reward.minMatches} matches but the strategy has only ${conditionCount} conditions`,
        );
      }
      checkEffects(ctx, file, `${rewardPath}/effects`, reward.effects);
    });
    if (isObject(strategy.asset) && strategy.asset.badge !== undefined) {
      checkPublicAsset(ctx, file, `${path}/asset/badge`, strategy.asset.badge);
    }
  });
}

function checkAdvisorFeedback(
  ctx: Context,
  questions: Map<string, QuestionInfo>,
  file: string,
  data: unknown,
) {
  if (!Array.isArray(data)) {
    report(
      ctx,
      "error",
      "advisor-feedback-invalid",
      file,
      "",
      "advisor feedback must be an array",
    );
    return;
  }
  data.forEach((entry, index) => {
    const path = `/${index}`;
    if (!isObject(entry)) {
      report(
        ctx,
        "error",
        "advisor-feedback-invalid",
        file,
        path,
        "entry must be an object",
      );
      return;
    }
    const question = questions.get(String(entry.questionId));
    if (!question) {
      report(
        ctx,
        "error",
        "unknown-question",
        file,
        `${path}/questionId`,
        `unknown question "${String(entry.questionId)}"`,
      );
      return;
    }
    const checkAnswerId = (answerId: unknown, answerPath: string) => {
      if (!question.answers.has(String(answerId))) {
        report(
          ctx,
          "error",
          "unknown-answer",
          file,
          answerPath,
          `question "${String(entry.questionId)}" has no answer "${String(answerId)}"`,
        );
      }
    };
    if (Array.isArray(entry.answers)) {
      entry.answers.forEach((answer, i) =>
        checkAnswerId(
          isObject(answer) ? answer.answerId : undefined,
          `${path}/answers/${i}/answerId`,
        ),
      );
    }
    if (Array.isArray(entry.conditionalAnswers)) {
      entry.conditionalAnswers.forEach((cond, c) => {
        const condPath = `${path}/conditionalAnswers/${c}`;
        if (!isObject(cond) || !isObject(cond.answer)) {
          report(
            ctx,
            "error",
            "advisor-feedback-invalid",
            file,
            condPath,
            "conditional answer must have an answer object",
          );
          return;
        }
        checkAnswerId(cond.answer.answerId, `${condPath}/answer/answerId`);
        checkAnswerConditions(
          ctx,
          questions,
          file,
          `${condPath}/if`,
          cond.if,
          question.index,
        );
      });
    }
  });
}

function checkImageFields(
  ctx: Context,
  file: string,
  data: unknown,
  path = "",
) {
  if (Array.isArray(data)) {
    data.forEach((item, i) =>
      checkImageFields(ctx, file, item, `${path}/${i}`),
    );
    return;
  }
  if (!isObject(data)) {
    return;
  }
  for (const [key, value] of Object.entries(data)) {
    if (
      /(imageuri|image|portrait|slogan|logo|badge)$/i.test(key) &&
      typeof value === "string"
    ) {
      checkPublicAsset(ctx, file, `${path}/${key}`, value);
    } else {
      checkImageFields(ctx, file, value, `${path}/${key}`);
    }
  }
}

function checkElectionDefinition(
  ctx: Context,
  file: string,
  election: unknown,
): string | undefined {
  if (election === undefined) {
    return "parliamentary";
  }
  if (!isObject(election)) {
    report(
      ctx,
      "error",
      "election-config-invalid",
      file,
      "/election",
      "election must be an object",
    );
    return undefined;
  }
  if (!ELECTION_TYPES.includes(String(election.type))) {
    report(
      ctx,
      "error",
      "election-config-invalid",
      file,
      "/election/type",
      `election type must be one of ${ELECTION_TYPES.join(", ")}`,
    );
    return undefined;
  }
  if (
    election.resultRule !== undefined &&
    !RESULT_RULES.includes(String(election.resultRule))
  ) {
    report(
      ctx,
      "error",
      "election-config-invalid",
      file,
      "/election/resultRule",
      `resultRule must be one of ${RESULT_RULES.join(", ")}`,
    );
  }
  if (election.type === "parliamentary" && election.resultRule !== undefined) {
    report(
      ctx,
      "warning",
      "result-rule-ignored",
      file,
      "/election/resultRule",
      "resultRule only applies to mayoral elections",
    );
  }
  return String(election.type);
}

function checkElectionConfig(ctx: Context, file: string, data: unknown) {
  if (!isObject(data)) {
    report(
      ctx,
      "error",
      "election-config-invalid",
      file,
      "",
      "election config must be an object",
    );
    return undefined;
  }
  const electionType = checkElectionDefinition(ctx, file, data.election);
  ctx.electionType = electionType;
  const seatKeys =
    electionType === "parliamentary"
      ? ["listSeats", "allSeats", "thresholdPercent"]
      : [];
  for (const key of seatKeys) {
    if (!isFiniteNumber(data[key]) || (data[key] as number) <= 0) {
      report(
        ctx,
        "error",
        "election-config-invalid",
        file,
        `/${key}`,
        `${key} must be a positive number`,
      );
    }
  }
  if (!DISTRICT_MAPS.includes(String(data.districtMap))) {
    report(
      ctx,
      "error",
      "election-config-invalid",
      file,
      "/districtMap",
      `districtMap must be one of ${DISTRICT_MAPS.join(", ")}`,
    );
  }
  if (!Array.isArray(data.parties) || data.parties.length === 0) {
    report(
      ctx,
      "error",
      "election-config-invalid",
      file,
      "/parties",
      "parties must be a non-empty array",
    );
  } else {
    data.parties.forEach((party, i) => {
      if (!isObject(party) || typeof party.id !== "string") {
        report(
          ctx,
          "error",
          "election-config-invalid",
          file,
          `/parties/${i}`,
          "party must have a string id",
        );
        return;
      }
      if (ctx.parties.has(party.id)) {
        report(
          ctx,
          "error",
          "duplicate-id",
          file,
          `/parties/${i}/id`,
          `duplicate party id "${party.id}"`,
        );
      }
      ctx.parties.add(party.id);
    });
  }
  if (isObject(data.partyListVotes)) {
    for (const [party, votes] of Object.entries(data.partyListVotes)) {
      if (!party.startsWith("_")) {
        checkParty(ctx, file, `/partyListVotes/${party}`, party);
      }
      if (!isFiniteNumber(votes) || votes < 0) {
        report(
          ctx,
          "error",
          "election-config-invalid",
          file,
          `/partyListVotes/${party}`,
          "votes must be a non-negative number",
        );
      }
    }
  }
  const sides = new Map<
    string,
    { candidates: Set<string>; playable?: Set<string> }
  >();
  if (Array.isArray(data.playableSides)) {
    data.playableSides.forEach((side, i) => {
      if (!isObject(side) || typeof side.id !== "string") {
        report(
          ctx,
          "error",
          "election-config-invalid",
          file,
          `/playableSides/${i}`,
          "side must have a string id",
        );
        return;
      }
      if (electionType !== "mayoral") {
        checkParty(ctx, file, `/playableSides/${i}/id`, side.id);
      }
      const candidates = new Set(
        Array.isArray(side.mainCandidates)
          ? side.mainCandidates.filter(isObject).map((c) => String(c.id))
          : [],
      );
      if (electionType === "mayoral") {
        candidates.forEach((id) => {
          if (!ctx.parties.has(id)) {
            report(
              ctx,
              "error",
              "mayoral-candidate-not-on-ballot",
              file,
              `/playableSides/${i}/mainCandidates`,
              `mayoral candidate "${id}" must also be listed in parties`,
            );
          }
        });
      }
      const playable = Array.isArray(side.playableCandidates)
        ? new Set(side.playableCandidates.map(String))
        : undefined;
      playable?.forEach((id) => {
        if (!candidates.has(id)) {
          report(
            ctx,
            "error",
            "unknown-candidate",
            file,
            `/playableSides/${i}/playableCandidates`,
            `"${id}" is not a main candidate of "${side.id}"`,
          );
        }
      });
      sides.set(side.id, { candidates, playable });
      candidates.forEach((id) => ctx.playableCandidates.add(id));
    });
  }
  checkImageFields(ctx, file, data.electionAssets, "/electionAssets");
  return sides;
}

function checkCandidateListData(ctx: Context, file: string, data: unknown) {
  if (!Array.isArray(data) || data.length === 0) {
    report(
      ctx,
      "error",
      "list-data-invalid",
      file,
      "",
      "candidate list data must be a non-empty array",
    );
    return;
  }
  data.forEach((row, i) => {
    if (
      !isObject(row) ||
      !isFiniteNumber(row.megyekod) ||
      !isFiniteNumber(row.oevk)
    ) {
      report(
        ctx,
        "error",
        "list-data-invalid",
        file,
        `/${i}`,
        "row must have numeric megyekod and oevk",
      );
      return;
    }
    const key = districtKey(row.megyekod, row.oevk);
    if (ctx.districts.has(key)) {
      report(
        ctx,
        "error",
        "duplicate-id",
        file,
        `/${i}`,
        `duplicate district ${key}`,
      );
    }
    ctx.districts.add(key);
    if (isObject(row.partok)) {
      for (const [party, votes] of Object.entries(row.partok)) {
        if (votes !== null && (!isFiniteNumber(votes) || votes < 0)) {
          report(
            ctx,
            "error",
            "list-data-invalid",
            file,
            `/${i}/partok/${party}`,
            "votes must be a non-negative number",
          );
        }
      }
    }
  });
}

function checkCustomGroups(ctx: Context, file: string, data: unknown) {
  if (!Array.isArray(data)) {
    report(
      ctx,
      "error",
      "custom-groups-invalid",
      file,
      "",
      "custom groups must be an array",
    );
    return;
  }
  data.forEach((group, i) => {
    if (!isObject(group) || typeof group.id !== "string") {
      report(
        ctx,
        "error",
        "custom-groups-invalid",
        file,
        `/${i}`,
        "group must have a string id",
      );
      return;
    }
    if (ctx.groups.has(group.id)) {
      report(
        ctx,
        "error",
        "duplicate-id",
        file,
        `/${i}/id`,
        `group id "${group.id}" already exists`,
      );
    }
    ctx.groups.add(group.id);
    if (!Array.isArray(group.districts) || group.districts.length === 0) {
      report(
        ctx,
        "error",
        "custom-groups-invalid",
        file,
        `/${i}/districts`,
        "districts must be a non-empty array",
      );
      return;
    }
    group.districts.forEach((d, j) => {
      if (!isObject(d) || !ctx.districts.has(districtKey(d.megyekod, d.oevk))) {
        report(
          ctx,
          "error",
          "unknown-district",
          file,
          `/${i}/districts/${j}`,
          `unknown district ${isObject(d) ? districtKey(d.megyekod, d.oevk) : "?"}`,
        );
      }
    });
  });
}

function checkPlayableSides(
  ctx: Context,
  playableSides: Json,
  sides: ReturnType<typeof checkElectionConfig>,
  electionConfigFile: string,
  allQuestions: Map<string, Set<string>>,
) {
  for (const [partyId, candidates] of Object.entries(playableSides)) {
    const sidePath = `/files/playableSides/${partyId}`;
    const side = sides?.get(partyId);
    if (sides && !side) {
      report(
        ctx,
        "error",
        "unknown-side",
        "manifest.json",
        sidePath,
        `"${partyId}" is not a playable side in ${electionConfigFile}`,
      );
    }
    if (!isObject(candidates)) {
      continue;
    }
    for (const [candidateId, paths] of Object.entries(candidates)) {
      const candidatePath = `${sidePath}/${candidateId}`;
      if (side && !side.candidates.has(candidateId)) {
        report(
          ctx,
          "error",
          "unknown-candidate",
          "manifest.json",
          candidatePath,
          `"${candidateId}" is not a main candidate of "${partyId}"`,
        );
      } else if (side?.playable && !side.playable.has(candidateId)) {
        report(
          ctx,
          "warning",
          "candidate-not-playable",
          "manifest.json",
          candidatePath,
          `"${candidateId}" has content but is not listed in playableCandidates`,
        );
      }
      if (!isObject(paths)) {
        report(
          ctx,
          "error",
          "manifest-invalid",
          "manifest.json",
          candidatePath,
          "candidate entry must be an object",
        );
        continue;
      }
      const read = (key: string) =>
        paths[key] === undefined
          ? undefined
          : readFile(
              ctx,
              paths[key],
              "manifest.json",
              `${candidatePath}/${key}`,
            );

      const questions = checkQuestions(
        ctx,
        String(paths.questions),
        read("questions"),
      );
      questions.forEach(({ answers }, questionId) => {
        const known = allQuestions.get(questionId) ?? new Set<string>();
        answers.forEach((answerId) => known.add(answerId));
        allQuestions.set(questionId, known);
      });
      const answerEffects = read("answerEffect");
      if (answerEffects !== undefined) {
        checkAnswerEffects(
          ctx,
          questions,
          String(paths.answerEffect),
          answerEffects,
        );
      }
      const strategies = read("campaignStrategies");
      if (strategies !== undefined) {
        checkStrategies(
          ctx,
          questions,
          String(paths.campaignStrategies),
          strategies,
        );
      }
      const feedback = read("advisorFeedback");
      if (feedback !== undefined) {
        checkAdvisorFeedback(
          ctx,
          questions,
          String(paths.advisorFeedback),
          feedback,
        );
      }
      for (const key of ["advisorFeedbackAssets", "endResults"]) {
        const data = read(key);
        if (data !== undefined) {
          checkImageFields(ctx, String(paths[key]), data);
        }
      }
    }
  }
}

function checkEventEffects(
  ctx: Context,
  file: string,
  path: string,
  effects: unknown,
) {
  if (!Array.isArray(effects)) {
    checkEffects(ctx, file, path, effects);
    return;
  }
  effects.forEach((effect, i) => {
    const effectPath = `${path}/${i}`;
    if (isObject(effect) && effect.type === "withdraw-candidate") {
      checkWithdrawEffect(ctx, file, effectPath, effect);
    } else {
      checkEffect(ctx, file, effectPath, effect);
    }
  });
}

function checkWithdrawEffect(
  ctx: Context,
  file: string,
  path: string,
  effect: Json,
) {
  const error = (code: string, at: string, message: string) =>
    report(ctx, "error", code, file, at, message);

  if (ctx.electionType !== "mayoral") {
    error(
      "withdraw-not-supported",
      path,
      "withdraw-candidate is only supported in mayoral elections",
    );
  }
  const candidateId = effect.candidateId;
  if (typeof candidateId !== "string" || !ctx.parties.has(candidateId)) {
    error(
      "unknown-candidate",
      `${path}/candidateId`,
      `unknown candidate "${String(candidateId)}"`,
    );
  } else if (ctx.playableCandidates.has(candidateId)) {
    error(
      "withdraw-playable-candidate",
      `${path}/candidateId`,
      `"${candidateId}" is playable; withdrawing the player's own candidate is not supported yet`,
    );
  }
  if (
    effect.endorsedCandidateId !== undefined &&
    (typeof effect.endorsedCandidateId !== "string" ||
      !ctx.parties.has(effect.endorsedCandidateId) ||
      effect.endorsedCandidateId === candidateId)
  ) {
    error(
      "unknown-candidate",
      `${path}/endorsedCandidateId`,
      "endorsedCandidateId must be another candidate in parties",
    );
  }
  if (
    effect.reason !== undefined &&
    !WITHDRAW_REASONS.includes(String(effect.reason))
  ) {
    error(
      "effect-invalid",
      `${path}/reason`,
      `reason must be one of ${WITHDRAW_REASONS.join(", ")}`,
    );
  }
  const redistribution = effect.redistribution;
  if (!isObject(redistribution) || !Object.keys(redistribution).length) {
    error(
      "effect-invalid",
      `${path}/redistribution`,
      "redistribution must be a non-empty object",
    );
    return;
  }
  let total = 0;
  for (const [target, share] of Object.entries(redistribution)) {
    const targetPath = `${path}/redistribution/${target}`;
    if (
      target !== "_abstain" &&
      (!ctx.parties.has(target) || target === candidateId)
    ) {
      error(
        "unknown-candidate",
        targetPath,
        `"${target}" is not another candidate in parties`,
      );
    }
    if (!isFiniteNumber(share) || share < 0 || share > 1) {
      error("effect-invalid", targetPath, "share must be between 0 and 1");
    } else {
      total += share;
    }
  }
  if (Math.abs(total - 1) > 1e-9) {
    error(
      "redistribution-sum",
      `${path}/redistribution`,
      `shares must add up to 1 (got ${total})`,
    );
  }
}

function checkCampaignEvents(
  ctx: Context,
  file: string,
  data: unknown,
  questions: Map<string, Set<string>>,
) {
  if (data === undefined) {
    return;
  }
  if (!Array.isArray(data)) {
    report(ctx, "error", "events-invalid", file, "", "events must be an array");
    return;
  }
  const eventIds = new Set(
    data
      .filter(isObject)
      .map((event) => event.id)
      .filter((id): id is string => typeof id === "string"),
  );
  const seen = new Set<string>();
  const refs = { questions, candidateIds: ctx.parties, eventIds };

  data.forEach((event, index) => {
    const path = `/${index}`;
    if (!isObject(event) || typeof event.id !== "string") {
      report(
        ctx,
        "error",
        "event-invalid",
        file,
        path,
        "event must be an object with a string id",
      );
      return;
    }
    if (seen.has(event.id)) {
      report(
        ctx,
        "error",
        "duplicate-id",
        file,
        `${path}/id`,
        `duplicate event id "${event.id}"`,
      );
    }
    seen.add(event.id);
    if (event.once !== undefined && typeof event.once !== "boolean") {
      report(
        ctx,
        "error",
        "event-invalid",
        file,
        `${path}/once`,
        "once must be a boolean",
      );
    }
    if (event.priority !== undefined && !isFiniteNumber(event.priority)) {
      report(
        ctx,
        "error",
        "event-invalid",
        file,
        `${path}/priority`,
        "priority must be a number",
      );
    }
    if (!Array.isArray(event.conditions) || event.conditions.length === 0) {
      report(
        ctx,
        "error",
        "event-invalid",
        file,
        `${path}/conditions`,
        "conditions must be a non-empty array of branches",
      );
    } else {
      event.conditions.forEach((branch, i) => {
        const branchPath = `${path}/conditions/${i}`;
        if (!isObject(branch)) {
          report(
            ctx,
            "error",
            "event-invalid",
            file,
            branchPath,
            "branch must be an object",
          );
          return;
        }
        validateCondition(branch.if, refs, `${branchPath}/if`).forEach(
          (issue) =>
            report(ctx, "error", issue.code, file, issue.path, issue.message),
        );
        checkEventEffects(ctx, file, `${branchPath}/effects`, branch.effects);
      });
    }
    if (event.announcement !== undefined) {
      const announcement = event.announcement;
      if (
        !isObject(announcement) ||
        typeof announcement.title !== "string" ||
        typeof announcement.body !== "string"
      ) {
        report(
          ctx,
          "error",
          "event-invalid",
          file,
          `${path}/announcement`,
          "announcement must have a string title and body",
        );
      } else {
        checkImageFields(ctx, file, announcement, `${path}/announcement`);
      }
    }
  });
}

export function validateCampaign(
  header: CampaignHeaderInput,
  source: CampaignSource,
): Diagnostic[] {
  const ctx: Context = {
    diagnostics: [],
    source,
    route: header.route,
    parties: new Set(),
    groups: new Set(defaultGroups.map((g) => g.id)),
    districts: new Set(),
    playableCandidates: new Set(),
    eventIds: new Set(),
  };

  for (const banner of ["campaignBanner", "thinCampaignBanner"] as const) {
    if (header[banner]) {
      checkPublicAsset(
        ctx,
        "game_modes.json",
        `/${header.id}/${banner}`,
        `/images/${header.route}/${header[banner]}`,
      );
    }
  }

  const manifest = readFile(
    ctx,
    "manifest.json",
    "game_modes.json",
    `/${header.id}`,
  );
  if (!isObject(manifest)) {
    if (manifest !== undefined) {
      report(
        ctx,
        "error",
        "manifest-invalid",
        "manifest.json",
        "",
        "manifest must be an object",
      );
    }
    return ctx.diagnostics;
  }
  if (!SUPPORTED_SCHEMA_VERSIONS.includes(manifest.schemaVersion as number)) {
    report(
      ctx,
      "error",
      "schema-version-unsupported",
      "manifest.json",
      "/schemaVersion",
      `unsupported schemaVersion ${String(manifest.schemaVersion)}`,
    );
  }
  const files = manifest.files;
  if (!isObject(files)) {
    report(
      ctx,
      "error",
      "manifest-invalid",
      "manifest.json",
      "/files",
      "files must be an object",
    );
    return ctx.diagnostics;
  }

  const electionConfigFile = String(files.electionConfig);
  const sides = checkElectionConfig(
    ctx,
    electionConfigFile,
    readFile(
      ctx,
      files.electionConfig,
      "manifest.json",
      "/files/electionConfig",
    ),
  );
  readFile(
    ctx,
    files.voterEnvironmentConfig,
    "manifest.json",
    "/files/voterEnvironmentConfig",
  );
  checkCandidateListData(
    ctx,
    String(files.candidateListData),
    readFile(
      ctx,
      files.candidateListData,
      "manifest.json",
      "/files/candidateListData",
    ),
  );
  for (const optional of ["partyListData", "customPollsters"] as const) {
    if (files[optional] !== undefined) {
      readFile(ctx, files[optional], "manifest.json", `/files/${optional}`);
    }
  }
  if (files.customGroups !== undefined) {
    checkCustomGroups(
      ctx,
      String(files.customGroups),
      readFile(ctx, files.customGroups, "manifest.json", "/files/customGroups"),
    );
  }

  const eventsData =
    files.campaignEvents === undefined
      ? undefined
      : readFile(
          ctx,
          files.campaignEvents,
          "manifest.json",
          "/files/campaignEvents",
        );
  if (Array.isArray(eventsData)) {
    eventsData.filter(isObject).forEach((event) => {
      if (typeof event.id === "string") {
        ctx.eventIds.add(event.id);
      }
    });
  }

  const allQuestions = new Map<string, Set<string>>();
  if (isObject(files.playableSides)) {
    checkPlayableSides(
      ctx,
      files.playableSides,
      sides,
      electionConfigFile,
      allQuestions,
    );
  }

  if (files.campaignEvents !== undefined) {
    checkCampaignEvents(
      ctx,
      String(files.campaignEvents),
      eventsData,
      allQuestions,
    );
  }

  return ctx.diagnostics;
}

export function formatDiagnostic(campaignId: string, d: Diagnostic) {
  return `${d.severity.toUpperCase()} [${d.code}] ${campaignId}: ${d.file}${d.path ? ` ${d.path}` : ""} - ${d.message}`;
}
