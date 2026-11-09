import { evaluateCondition } from "../domain/ConditionEvaluator";
import { defaultGroups } from "../domain/DefaultGroups";
import { getQuestionCondition } from "../domain/QuestionEligibility";
import {
  CandidateStatus,
  Condition,
  GAME_MODES,
  GameMode,
  GOVERNMENT_OUTCOMES,
  GovernmentOutcome,
  RawQuestion,
  RELATION_TONES,
  RelationTone,
} from "../types";
import { ConditionReferences, validateCondition } from "./conditionValidator";

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

const DISTRICT_MAPS = ["2011", "2024", "budapest-districts", "1945"];

const ELECTION_TYPES = ["parliamentary", "mayoral", "proportional"];

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
  regionMegyekods?: Set<number>;
  playableCandidates: Set<string>;
  eventIds: Set<string>;
  focusIds: Set<string>;
  relationIds: Set<string>;
  dormantParties: Set<string>;
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
    focusIds: ctx.focusIds,
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
      getStandings: () => undefined,
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
  if (election.type !== "mayoral" && election.resultRule !== undefined) {
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

interface RegionsFile {
  file: string;
  data: unknown;
}

function checkProportionalRegions(
  ctx: Context,
  file: string,
  data: Json,
  regionsFile: RegionsFile | undefined,
) {
  const election = data.election as Json;
  if (election.regions !== undefined) {
    report(
      ctx,
      "error",
      "election-config-invalid",
      file,
      "/election/regions",
      "regions belong in their own file (manifest files.regions)",
    );
  }
  if (!regionsFile) {
    report(
      ctx,
      "error",
      "election-config-invalid",
      "manifest.json",
      "/files/regions",
      "a proportional election needs a regions file",
    );
    return;
  }
  const regions = regionsFile.data;
  const error = (path: string, message: string) =>
    report(
      ctx,
      "error",
      "election-config-invalid",
      regionsFile.file,
      path,
      message,
    );
  if (!Array.isArray(regions) || regions.length === 0) {
    error("", "regions must be a non-empty array");
    return;
  }
  const ids = new Set<string>();
  const counties = new Set<number>();
  let regionSeats = 0;
  regions.forEach((region, i) => {
    const path = `/${i}`;
    if (!isObject(region)) {
      error(path, "region must be an object");
      return;
    }
    if (typeof region.id !== "string" || typeof region.name !== "string") {
      error(path, "region needs a string id and name");
    } else if (ids.has(region.id)) {
      report(
        ctx,
        "error",
        "duplicate-id",
        regionsFile.file,
        `${path}/id`,
        `duplicate region id "${region.id}"`,
      );
    } else {
      ids.add(region.id);
    }
    if (!Number.isInteger(region.seats) || (region.seats as number) <= 0) {
      error(`${path}/seats`, "seats must be a positive integer");
    } else {
      regionSeats += region.seats as number;
    }
    if (!Array.isArray(region.megyekods) || region.megyekods.length === 0) {
      error(`${path}/megyekods`, "megyekods must be a non-empty array");
      return;
    }
    region.megyekods.forEach((code, j) => {
      if (!Number.isInteger(code)) {
        error(`${path}/megyekods/${j}`, "megyekod must be an integer");
      } else if (counties.has(code as number)) {
        error(
          `${path}/megyekods/${j}`,
          `megyekod ${String(code)} belongs to more than one region`,
        );
      } else {
        counties.add(code as number);
      }
    });
  });
  ctx.regionMegyekods = counties;
  if (
    isFiniteNumber(data.listSeats) &&
    isFiniteNumber(data.allSeats) &&
    regionSeats + data.listSeats !== data.allSeats
  ) {
    report(
      ctx,
      "error",
      "election-config-invalid",
      file,
      "/allSeats",
      `allSeats (${data.allSeats}) must equal the region seats (${regionSeats}) plus listSeats (${data.listSeats})`,
    );
  }
}

function checkRegionCoverage(ctx: Context, file: string, data: unknown) {
  if (!ctx.regionMegyekods || !Array.isArray(data)) {
    return;
  }
  const missing = new Set<number>();
  data.filter(isObject).forEach((row) => {
    if (
      Number.isInteger(row.megyekod) &&
      !ctx.regionMegyekods?.has(row.megyekod as number)
    ) {
      missing.add(row.megyekod as number);
    }
  });
  if (missing.size > 0) {
    report(
      ctx,
      "error",
      "region-missing",
      file,
      "",
      `megyekod ${[...missing].sort((a, b) => a - b).join(", ")} is not in any region, so its votes would be lost`,
    );
  }
}

function checkElectionConfig(
  ctx: Context,
  file: string,
  data: unknown,
  regionsFile?: RegionsFile,
) {
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
    electionType === "parliamentary" || electionType === "proportional"
      ? ["listSeats", "allSeats", "thresholdPercent"]
      : [];
  for (const key of seatKeys) {
    const zeroAllowed =
      key === "thresholdPercent" && electionType === "proportional";
    const value = data[key];
    if (!isFiniteNumber(value) || value < 0 || (value === 0 && !zeroAllowed)) {
      report(
        ctx,
        "error",
        "election-config-invalid",
        file,
        `/${key}`,
        zeroAllowed
          ? `${key} must be zero or a positive number`
          : `${key} must be a positive number`,
      );
    }
  }
  if (electionType === "proportional") {
    checkProportionalRegions(ctx, file, data, regionsFile);
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
      if (party.dormant !== undefined && typeof party.dormant !== "boolean") {
        report(
          ctx,
          "error",
          "election-config-invalid",
          file,
          `/parties/${i}/dormant`,
          "dormant must be a boolean",
        );
      } else if (party.dormant) {
        ctx.dormantParties.add(party.id);
      }
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
  checkBaseResults(ctx, file, data.baseResults, sides);
  checkIntro(ctx, file, data.intro);
  return sides;
}

function checkIntro(ctx: Context, file: string, intro: unknown) {
  if (intro === undefined) {
    return;
  }
  const valid =
    isObject(intro) &&
    typeof intro.text === "string" &&
    intro.text.trim() !== "" &&
    ["title", "subtitle"].every(
      (key) => intro[key] === undefined || typeof intro[key] === "string",
    );
  if (!valid) {
    report(
      ctx,
      "error",
      "election-config-invalid",
      file,
      "/intro",
      "intro needs a non-empty string text; title and subtitle must be strings",
    );
  }
}

// baseResults is keyed by the player's side, then by party; a flat party map
// is silently ignored by the engine, so it is rejected here.
function checkBaseResults(
  ctx: Context,
  file: string,
  baseResults: unknown,
  sides: Map<string, unknown>,
) {
  if (baseResults === undefined) {
    return;
  }
  if (!isObject(baseResults)) {
    report(
      ctx,
      "error",
      "base-results-invalid",
      file,
      "/baseResults",
      "baseResults must be an object of side -> party -> number",
    );
    return;
  }
  for (const [side, swings] of Object.entries(baseResults)) {
    const path = `/baseResults/${side}`;
    if (!sides.has(side)) {
      report(
        ctx,
        "error",
        "base-results-invalid",
        file,
        path,
        `"${side}" is not a playable side`,
      );
    }
    if (!isObject(swings)) {
      report(
        ctx,
        "error",
        "base-results-invalid",
        file,
        path,
        "must be an object of party -> number",
      );
      continue;
    }
    for (const [party, value] of Object.entries(swings)) {
      if (!party.startsWith("_")) {
        checkParty(ctx, file, `${path}/${party}`, party);
      }
      if (!isFiniteNumber(value)) {
        report(
          ctx,
          "error",
          "base-results-invalid",
          file,
          `${path}/${party}`,
          "value must be a finite number",
        );
      }
    }
  }
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
  guard?: unknown,
) {
  if (!Array.isArray(effects)) {
    checkEffects(ctx, file, path, effects);
    return;
  }
  effects.forEach((effect, i) => {
    const effectPath = `${path}/${i}`;
    if (isObject(effect) && effect.type === "withdraw-candidate") {
      checkWithdrawEffect(ctx, file, effectPath, effect, guard);
    } else if (isObject(effect) && effect.type === "split-party") {
      checkSplitEffect(ctx, file, effectPath, effect);
    } else if (isObject(effect) && effect.type === "set-relation") {
      if (
        typeof effect.relationId !== "string" ||
        !ctx.relationIds.has(effect.relationId)
      ) {
        report(
          ctx,
          "error",
          "unknown-relation",
          file,
          `${effectPath}/relationId`,
          `unknown relation "${String(effect.relationId)}"`,
        );
      }
      checkRelationStanding(ctx, file, effectPath, effect);
    } else {
      checkEffect(ctx, file, effectPath, effect);
    }
  });
}

function checkSplitEffect(
  ctx: Context,
  file: string,
  path: string,
  effect: Json,
) {
  const error = (code: string, at: string, message: string) =>
    report(ctx, "error", code, file, at, message);

  const partyId = effect.partyId;
  if (typeof partyId !== "string" || !ctx.dormantParties.has(partyId)) {
    error(
      "split-party-invalid",
      `${path}/partyId`,
      `partyId must be a dormant party in parties (got "${String(partyId)}")`,
    );
  }
  const checkShares = (shares: unknown, at: string) => {
    if (!isObject(shares) || !Object.keys(shares).length) {
      error("effect-invalid", at, "shares must be a non-empty object");
      return;
    }
    for (const [source, share] of Object.entries(shares)) {
      if (
        !ctx.parties.has(source) ||
        source === partyId ||
        ctx.dormantParties.has(source)
      ) {
        error(
          "unknown-candidate",
          `${at}/${source}`,
          `"${source}" is not another active party in parties`,
        );
      }
      if (!isFiniteNumber(share) || share < 0 || share > 1) {
        error(
          "effect-invalid",
          `${at}/${source}`,
          "share must be between 0 and 1",
        );
      }
    }
  };
  checkShares(effect.from, `${path}/from`);
  if (effect.fromByMegye !== undefined) {
    if (!isObject(effect.fromByMegye)) {
      error(
        "effect-invalid",
        `${path}/fromByMegye`,
        "fromByMegye must be an object",
      );
      return;
    }
    for (const [megyekod, shares] of Object.entries(effect.fromByMegye)) {
      if (!/^\d+$/.test(megyekod)) {
        error(
          "effect-invalid",
          `${path}/fromByMegye/${megyekod}`,
          "fromByMegye keys must be megyekod numbers",
        );
      }
      checkShares(shares, `${path}/fromByMegye/${megyekod}`);
    }
  }
}

function excludesPlayer(condition: unknown, candidateId: string): boolean {
  if (!isObject(condition)) {
    return false;
  }
  if (Array.isArray(condition.and)) {
    return condition.and.some((child) => excludesPlayer(child, candidateId));
  }
  const negated = condition.not;
  return (
    isObject(negated) &&
    negated.type === "player-candidate" &&
    negated.candidateId === candidateId
  );
}

function checkWithdrawEffect(
  ctx: Context,
  file: string,
  path: string,
  effect: Json,
  guard?: unknown,
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
  } else if (
    ctx.playableCandidates.has(candidateId) &&
    !excludesPlayer(guard, candidateId)
  ) {
    error(
      "withdraw-playable-candidate",
      `${path}/candidateId`,
      `"${candidateId}" is playable; the branch must exclude the player's own candidate with { "not": { "type": "player-candidate", "candidateId": "${candidateId}" } }`,
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
  const refs = {
    questions,
    candidateIds: ctx.parties,
    eventIds,
    focusIds: ctx.focusIds,
  };

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
        checkEventEffects(
          ctx,
          file,
          `${branchPath}/effects`,
          branch.effects,
          branch.if,
        );
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

function checkFocusSelection(ctx: Context, file: string, data: unknown) {
  if (data === undefined) {
    return;
  }
  const invalid = (path: string, message: string) =>
    report(
      ctx,
      "error",
      "political-config-invalid",
      file,
      `/focusSelection${path}`,
      message,
    );
  if (!isObject(data)) {
    invalid("", "focusSelection must be an object");
    return;
  }
  for (const key of ["availableFromTurn", "requiredBeforeTurn"] as const) {
    const value = data[key];
    if (
      value !== undefined &&
      (!Number.isInteger(value) || (value as number) < 1)
    ) {
      invalid(`/${key}`, `${key} must be a turn number from 1`);
    }
  }
  if (
    Number.isInteger(data.availableFromTurn) &&
    Number.isInteger(data.requiredBeforeTurn) &&
    (data.requiredBeforeTurn as number) < (data.availableFromTurn as number)
  ) {
    invalid(
      "/requiredBeforeTurn",
      "a focus cannot be required before it can be chosen",
    );
  }
}

function checkPoliticalConfig(
  ctx: Context,
  file: string,
  data: unknown,
  questions: Map<string, Set<string>>,
) {
  if (data === undefined) {
    return;
  }
  if (!isObject(data)) {
    report(
      ctx,
      "error",
      "political-config-invalid",
      file,
      "",
      "political config must be an object",
    );
    return;
  }
  if (!GAME_MODES.includes(data.gameMode as GameMode)) {
    report(
      ctx,
      "error",
      "game-mode-invalid",
      file,
      "/gameMode",
      `gameMode must be one of ${GAME_MODES.join(", ")}`,
    );
  }
  checkRelations(ctx, file, data);
  checkFocusSelection(ctx, file, data.focusSelection);
  if (
    data.focusLockEventId !== undefined &&
    !ctx.eventIds.has(String(data.focusLockEventId))
  ) {
    report(
      ctx,
      "error",
      "unknown-event",
      file,
      "/focusLockEventId",
      `unknown event "${String(data.focusLockEventId)}"`,
    );
  }
  const refs = {
    questions,
    candidateIds: ctx.parties,
    eventIds: ctx.eventIds,
    focusIds: ctx.focusIds,
  };
  checkCoalition(ctx, file, data, refs);
  checkEpilogues(ctx, file, data, refs);
  if (data.focuses === undefined) {
    return;
  }
  if (!Array.isArray(data.focuses)) {
    report(
      ctx,
      "error",
      "focus-invalid",
      file,
      "/focuses",
      "focuses must be an array",
    );
    return;
  }
  const seen = new Set<string>();
  data.focuses.forEach((focus, index) => {
    const path = `/focuses/${index}`;
    if (!isObject(focus)) {
      report(
        ctx,
        "error",
        "focus-invalid",
        file,
        path,
        "focus must be an object",
      );
      return;
    }
    for (const key of ["id", "title", "summary", "description"] as const) {
      if (typeof focus[key] !== "string" || !focus[key]) {
        report(
          ctx,
          "error",
          "focus-invalid",
          file,
          `${path}/${key}`,
          `${key} must be a non-empty string`,
        );
      }
    }
    if (typeof focus.id === "string") {
      if (seen.has(focus.id)) {
        report(
          ctx,
          "error",
          "focus-duplicate",
          file,
          `${path}/id`,
          `duplicate focus id "${focus.id}"`,
        );
      }
      seen.add(focus.id);
    }
    if (
      focus.excludes !== undefined &&
      (!Array.isArray(focus.excludes) ||
        focus.excludes.some(
          (id) => typeof id !== "string" || !ctx.focusIds.has(id),
        ))
    ) {
      report(
        ctx,
        "error",
        "focus-invalid",
        file,
        `${path}/excludes`,
        "excludes must list known focus ids",
      );
    }
    for (const key of ["completeWhen", "failWhen"] as const) {
      if (focus[key] !== undefined) {
        validateCondition(focus[key], refs, `${path}/${key}`).forEach((issue) =>
          report(ctx, "error", issue.code, file, issue.path, issue.message),
        );
      }
    }
  });
}

type ConditionRefs = ConditionReferences;

function checkNewspaper(
  ctx: Context,
  file: string,
  data: unknown,
  strategic: boolean,
  questions: Map<string, Set<string>>,
) {
  if (data === undefined) {
    return;
  }
  const invalid = (path: string, message: string) =>
    report(ctx, "error", "newspaper-invalid", file, path, message);
  if (!isObject(data)) {
    invalid("", "newspaper must be an object");
    return;
  }
  if (!strategic) {
    report(
      ctx,
      "warning",
      "newspaper-unused",
      file,
      "",
      "the newspaper only shows in strategic mode",
    );
  }
  if (data.cadence !== undefined) {
    const cadence = data.cadence;
    if (
      !isObject(cadence) ||
      !Number.isInteger(cadence.minTurns) ||
      !Number.isInteger(cadence.maxTurns) ||
      (cadence.minTurns as number) < 1 ||
      (cadence.maxTurns as number) < (cadence.minTurns as number)
    ) {
      invalid(
        "/cadence",
        "cadence needs whole minTurns >= 1 and maxTurns >= minTurns",
      );
    }
  }
  const paperIds = new Set<string>();
  if (!Array.isArray(data.papers) || data.papers.length === 0) {
    invalid("/papers", "papers must be a non-empty array");
  } else {
    data.papers.forEach((paper, index) => {
      const path = `/papers/${index}`;
      if (!isObject(paper)) {
        invalid(path, "paper must be an object");
        return;
      }
      for (const key of ["id", "name"] as const) {
        if (typeof paper[key] !== "string" || !paper[key]) {
          invalid(`${path}/${key}`, `${key} must be a non-empty string`);
        }
      }
      if (typeof paper.id === "string") {
        if (paperIds.has(paper.id)) {
          invalid(`${path}/id`, `duplicate paper id "${paper.id}"`);
        }
        paperIds.add(paper.id);
      }
      if (paper.logo !== undefined) {
        checkPublicAsset(ctx, file, `${path}/logo`, paper.logo);
      }
    });
  }
  if (!Array.isArray(data.items)) {
    invalid("/items", "items must be an array");
    return;
  }
  const refs = {
    questions,
    candidateIds: ctx.parties,
    eventIds: ctx.eventIds,
    focusIds: ctx.focusIds,
  };
  const itemIds = new Set<string>();
  data.items.forEach((item, index) => {
    const path = `/items/${index}`;
    if (!isObject(item)) {
      invalid(path, "item must be an object");
      return;
    }
    for (const key of ["id", "headline", "lead"] as const) {
      if (typeof item[key] !== "string" || !item[key]) {
        invalid(`${path}/${key}`, `${key} must be a non-empty string`);
      }
    }
    if (typeof item.id === "string") {
      if (itemIds.has(item.id)) {
        invalid(`${path}/id`, `duplicate item id "${item.id}"`);
      }
      itemIds.add(item.id);
    }
    if (item.paper !== undefined && !paperIds.has(String(item.paper))) {
      invalid(`${path}/paper`, `unknown paper "${String(item.paper)}"`);
    }
    if (item.image !== undefined) {
      checkPublicAsset(ctx, file, `${path}/image`, item.image);
    }
    if (
      item.weight !== undefined &&
      (typeof item.weight !== "number" || item.weight < 0)
    ) {
      invalid(`${path}/weight`, "weight must be a number >= 0");
    }
    if (item.priority !== undefined && item.priority !== "pinned") {
      invalid(`${path}/priority`, 'priority must be "pinned"');
    }
    checkConditionField(ctx, file, item.when, refs, `${path}/when`);
  });
}

function checkConditionField(
  ctx: Context,
  file: string,
  condition: unknown,
  refs: ConditionRefs,
  path: string,
) {
  if (condition !== undefined) {
    validateCondition(condition, refs, path).forEach((issue) =>
      report(ctx, "error", issue.code, file, issue.path, issue.message),
    );
  }
}

function checkCoalition(
  ctx: Context,
  file: string,
  data: Record<string, unknown>,
  refs: ConditionRefs,
) {
  if (data.coalition === undefined) {
    return;
  }
  const partners = isObject(data.coalition)
    ? data.coalition.partners
    : undefined;
  if (!Array.isArray(partners)) {
    report(
      ctx,
      "error",
      "coalition-invalid",
      file,
      "/coalition",
      "coalition needs a partners array",
    );
    return;
  }
  const seen = new Set<string>();
  partners.forEach((partner, index) => {
    const path = `/coalition/partners/${index}`;
    if (
      !isObject(partner) ||
      typeof partner.acceptReason !== "string" ||
      typeof partner.rejectReason !== "string"
    ) {
      report(
        ctx,
        "error",
        "coalition-invalid",
        file,
        path,
        "coalition partner needs a partyId, acceptReason and rejectReason",
      );
      return;
    }
    const partyId = String(partner.partyId);
    if (!ctx.parties.has(partyId)) {
      report(
        ctx,
        "error",
        "unknown-party",
        file,
        `${path}/partyId`,
        `unknown party "${partyId}"`,
      );
    } else if (seen.has(partyId)) {
      report(
        ctx,
        "error",
        "coalition-duplicate",
        file,
        `${path}/partyId`,
        `duplicate coalition partner "${partyId}"`,
      );
    }
    seen.add(partyId);
    checkConditionField(
      ctx,
      file,
      partner.acceptWhen,
      refs,
      `${path}/acceptWhen`,
    );
  });
}

function checkEpilogues(
  ctx: Context,
  file: string,
  data: Record<string, unknown>,
  refs: ConditionRefs,
) {
  if (data.epilogues === undefined) {
    return;
  }
  if (!Array.isArray(data.epilogues)) {
    report(
      ctx,
      "error",
      "epilogue-invalid",
      file,
      "/epilogues",
      "epilogues must be an array",
    );
    return;
  }
  const seen = new Set<string>();
  data.epilogues.forEach((epilogue, index) => {
    const path = `/epilogues/${index}`;
    if (
      !isObject(epilogue) ||
      typeof epilogue.id !== "string" ||
      typeof epilogue.title !== "string" ||
      typeof epilogue.body !== "string"
    ) {
      report(
        ctx,
        "error",
        "epilogue-invalid",
        file,
        path,
        "epilogue needs a string id, title and body",
      );
      return;
    }
    if (seen.has(epilogue.id)) {
      report(
        ctx,
        "error",
        "epilogue-duplicate",
        file,
        `${path}/id`,
        `duplicate epilogue id "${epilogue.id}"`,
      );
    }
    seen.add(epilogue.id);
    if (
      epilogue.outcomes !== undefined &&
      (!Array.isArray(epilogue.outcomes) ||
        epilogue.outcomes.some(
          (o) => !GOVERNMENT_OUTCOMES.includes(o as GovernmentOutcome),
        ))
    ) {
      report(
        ctx,
        "error",
        "epilogue-invalid",
        file,
        `${path}/outcomes`,
        `outcomes must be a list of ${GOVERNMENT_OUTCOMES.join(", ")}`,
      );
    }
    checkConditionField(ctx, file, epilogue.when, refs, `${path}/when`);
  });
}

function collectPoliticalIds(ctx: Context, data: unknown) {
  if (!isObject(data)) {
    return;
  }
  const collect = (items: unknown, ids: Set<string>) => {
    if (Array.isArray(items)) {
      items.filter(isObject).forEach((item) => {
        if (typeof item.id === "string") {
          ids.add(item.id);
        }
      });
    }
  };
  collect(data.focuses, ctx.focusIds);
  collect(data.relations, ctx.relationIds);
}

function checkRelationStanding(
  ctx: Context,
  file: string,
  path: string,
  standing: Json,
) {
  if (!RELATION_TONES.includes(standing.tone as RelationTone)) {
    report(
      ctx,
      "error",
      "relation-invalid",
      file,
      `${path}/tone`,
      `tone must be one of ${RELATION_TONES.join(", ")}`,
    );
  }
  for (const key of ["label", "description"] as const) {
    if (typeof standing[key] !== "string" || !standing[key]) {
      report(
        ctx,
        "error",
        "relation-invalid",
        file,
        `${path}/${key}`,
        `${key} must be a non-empty string`,
      );
    }
  }
}

function checkRelations(ctx: Context, file: string, data: Json) {
  const groupIds = new Set<string>();
  if (data.relationGroups !== undefined) {
    if (!Array.isArray(data.relationGroups)) {
      report(
        ctx,
        "error",
        "relation-invalid",
        file,
        "/relationGroups",
        "relationGroups must be an array",
      );
    } else {
      data.relationGroups.forEach((group, index) => {
        if (
          !isObject(group) ||
          typeof group.id !== "string" ||
          typeof group.title !== "string" ||
          !group.title
        ) {
          report(
            ctx,
            "error",
            "relation-invalid",
            file,
            `/relationGroups/${index}`,
            "relation group needs a string id and title",
          );
          return;
        }
        groupIds.add(group.id);
      });
    }
  }
  if (data.relations === undefined) {
    return;
  }
  if (!Array.isArray(data.relations)) {
    report(
      ctx,
      "error",
      "relation-invalid",
      file,
      "/relations",
      "relations must be an array",
    );
    return;
  }
  const seen = new Set<string>();
  data.relations.forEach((relation, index) => {
    const path = `/relations/${index}`;
    if (!isObject(relation)) {
      report(
        ctx,
        "error",
        "relation-invalid",
        file,
        path,
        "relation must be an object",
      );
      return;
    }
    if (typeof relation.id !== "string" || typeof relation.name !== "string") {
      report(
        ctx,
        "error",
        "relation-invalid",
        file,
        path,
        "relation needs a string id and name",
      );
    } else if (seen.has(relation.id)) {
      report(
        ctx,
        "error",
        "relation-duplicate",
        file,
        `${path}/id`,
        `duplicate relation id "${relation.id}"`,
      );
    }
    if (typeof relation.id === "string") {
      seen.add(relation.id);
    }
    if (
      typeof relation.groupId !== "string" ||
      !groupIds.has(relation.groupId)
    ) {
      report(
        ctx,
        "error",
        "unknown-relation-group",
        file,
        `${path}/groupId`,
        `unknown relation group "${String(relation.groupId)}"`,
      );
    }
    checkRelationStanding(ctx, file, path, relation);
  });
}

function readSidePoliticalConfigs(ctx: Context, playableSides: unknown) {
  if (!isObject(playableSides)) {
    return [];
  }
  return Object.entries(playableSides).flatMap(([partyId, candidates]) =>
    isObject(candidates)
      ? Object.entries(candidates).flatMap(([candidateId, paths]) =>
          isObject(paths) && paths.politicalConfig !== undefined
            ? [
                {
                  file: String(paths.politicalConfig),
                  data: readFile(
                    ctx,
                    paths.politicalConfig,
                    "manifest.json",
                    `/files/playableSides/${partyId}/${candidateId}/politicalConfig`,
                  ),
                },
              ]
            : [],
        )
      : [],
  );
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
    focusIds: new Set(),
    relationIds: new Set(),
    dormantParties: new Set(),
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
  const regionsFile =
    files.regions === undefined
      ? undefined
      : {
          file: String(files.regions),
          data: readFile(ctx, files.regions, "manifest.json", "/files/regions"),
        };
  const sides = checkElectionConfig(
    ctx,
    electionConfigFile,
    readFile(
      ctx,
      files.electionConfig,
      "manifest.json",
      "/files/electionConfig",
    ),
    regionsFile,
  );
  readFile(
    ctx,
    files.voterEnvironmentConfig,
    "manifest.json",
    "/files/voterEnvironmentConfig",
  );
  const candidateListData = readFile(
    ctx,
    files.candidateListData,
    "manifest.json",
    "/files/candidateListData",
  );
  checkCandidateListData(
    ctx,
    String(files.candidateListData),
    candidateListData,
  );
  checkRegionCoverage(ctx, String(files.candidateListData), candidateListData);
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

  const politicalData =
    files.politicalConfig === undefined
      ? undefined
      : readFile(
          ctx,
          files.politicalConfig,
          "manifest.json",
          "/files/politicalConfig",
        );
  const politicalFiles: { file: string; data: unknown }[] = [
    { file: String(files.politicalConfig), data: politicalData },
    ...readSidePoliticalConfigs(ctx, files.playableSides),
  ];
  politicalFiles.forEach(({ data }) => collectPoliticalIds(ctx, data));

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

  politicalFiles.forEach(({ file, data }) =>
    checkPoliticalConfig(ctx, file, data, allQuestions),
  );

  if (files.newspaper !== undefined) {
    checkNewspaper(
      ctx,
      String(files.newspaper),
      readFile(ctx, files.newspaper, "manifest.json", "/files/newspaper"),
      politicalFiles.some(
        ({ data }) => isObject(data) && data.gameMode === "strategic",
      ),
      allQuestions,
    );
  }

  return ctx.diagnostics;
}

export function formatDiagnostic(campaignId: string, d: Diagnostic) {
  return `${d.severity.toUpperCase()} [${d.code}] ${campaignId}: ${d.file}${d.path ? ` ${d.path}` : ""} - ${d.message}`;
}
