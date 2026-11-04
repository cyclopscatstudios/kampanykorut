import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { container } from "tsyringe";
import { CampaignEngine } from "../domain/CampaignEngine";
import { CampaignEventEngine } from "../domain/CampaignEventEngine";
import { DistrictGroupEngine } from "../domain/DistrictGroupEngine";
import { EffectApplier } from "../domain/EffectApplier";
import { MandateCalculator } from "../domain/MandateCalculator";
import { MayoralResultCalculator } from "../domain/MayoralResultCalculator";
import { PollsterEngine } from "../domain/PollsterEngine";
import { ResultModifier } from "../domain/ResultModifier";
import { CandidateWithdrawalTransformer } from "../domain/ResultTransformer/CandidateWithdrawalTransformer";
import { VoterEnvironment } from "../domain/VoterEnvironment";
import {
  CampaignEvent,
  CampaignState,
  CandidateListData,
  Decision,
  District,
  DistrictGroup,
  HistoryItem,
  MayoralElectionConfig,
  RawAnsweEffectProps,
  RawQuestion,
  Strategy,
  VoterEnvironmentConfig,
} from "../types";

const campaignDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../apps/kampanykorut/public/campaigns/2024_budapest",
);

export const readCampaignFile = <T>(file: string): T =>
  JSON.parse(readFileSync(join(campaignDir, file), "utf8"));

export const VITEZY = "vitezy_david";
export const KARACSONY = "karacsony_gergely";
export const SZENTKIRALYI = "szentkiralyi_alexandra";

const settings = { showAdvisorFeedback: false, language: "hu" as const };
const boostDistrict = { megyekod: 1, oevk: 11 } as District;

export type Pick = (
  questionId: string,
  options: string[],
  preview: (answerId: string) => CampaignState,
) => string;

export interface Playthrough {
  state: CampaignState;
  visited: string[];
  answers: string[];
  announcements: string[][];
  beforeDecision: CampaignState;
}

export interface BudapestSide {
  dir: string;
  candidate: string;
}

export const VITEZY_SIDE: BudapestSide = {
  dir: "lmp/vitezy_david",
  candidate: "vitezy_david",
};

export const KARACSONY_SIDE: BudapestSide = {
  dir: "dk_mszp_parbeszed/karacsony_gergely",
  candidate: "karacsony_gergely",
};

export function createBudapestCampaign(side: BudapestSide = VITEZY_SIDE) {
  const districts = readCampaignFile<CandidateListData[]>(
    "candidate_list_data.json",
  );
  const voterEnvironment = readCampaignFile<VoterEnvironmentConfig>(
    "voter_environment_config.json",
  );
  const electionConfig = readCampaignFile<MayoralElectionConfig>(
    "election_config.json",
  );
  const questions = readCampaignFile<RawQuestion[]>(
    `${side.dir}/questions.json`,
  );
  const answerEffects = readCampaignFile<RawAnsweEffectProps[]>(
    `${side.dir}/answer_effects.json`,
  );
  const strategies = readCampaignFile<Strategy[]>(
    `${side.dir}/campaign_strategies.json`,
  );
  const events = readCampaignFile<CampaignEvent[]>("campaign_events.json");
  const groups = readCampaignFile<DistrictGroup[]>("custom_groups.json");

  container.resolve(DistrictGroupEngine).configure(districts, groups);
  container
    .resolve(VoterEnvironment)
    .configure({ ...voterEnvironment, listData: districts });

  const engine = new CampaignEngine(
    districts,
    questions,
    answerEffects,
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    container.resolve(PollsterEngine),
    container.resolve(MayoralResultCalculator),
    container.resolve(CampaignEventEngine),
    container.resolve(CandidateWithdrawalTransformer),
    undefined,
    undefined,
    events,
  );

  const answer = (
    from: CampaignState,
    history: HistoryItem[],
    questionId: string,
    answerId: string,
  ) => {
    const entry = answerEffects
      .find((e) => e.id === questionId)!
      .answers.find((a) => a.id === answerId)!;
    return engine.processTurn(
      from,
      {
        questionId,
        answerId,
        effects: entry.effects,
        conditionalEffects: entry.conditionalEffects,
        selectedDistrict: boostDistrict,
      } as Decision,
      history,
      settings,
      electionConfig,
      strategies,
      true,
      side.candidate,
    );
  };

  function play(pick: Pick): Playthrough {
    let state = engine.createInitialState(
      "2024_budapest",
      null,
      electionConfig,
    );
    const history: HistoryItem[] = [];
    const visited: string[] = [];
    const answers: string[] = [];
    const announcements: string[][] = [];
    let beforeDecision = state;

    while (!state.isEnded) {
      const questionId = state.currentQuestion!.id;
      const options = questions
        .find((q) => q.id === questionId)!
        .possibleAnswers.map((a) => a.id);
      const current = state;
      const answerId = pick(questionId, options, (a) =>
        answer(current, history, questionId, a),
      );
      visited.push(questionId);
      answers.push(answerId);
      state = answer(state, history, questionId, answerId);
      history.push({ questionId, answerId } as HistoryItem);
      announcements.push(state.campaignEvents?.pendingAnnouncementIds ?? []);
      if (visited.length === 25) {
        beforeDecision = state;
      }
    }
    return { state, visited, answers, announcements, beforeDecision };
  }

  return { play, strategies };
}

export const shares = (state: CampaignState) =>
  state.mayoralResult!.percentages;

export const marginOf = (candidate: string) => (state: CampaignState) => {
  const current = shares(state);
  const rivals = Object.entries(current)
    .filter(([id]) => id !== candidate)
    .map(([, share]) => share);
  return (current[candidate] ?? 0) - Math.max(...rivals);
};

export const winsOf = (candidate: string) => (state: CampaignState) =>
  state.mayoralResult!.outcome.kind === "winner" &&
  state.mayoralResult!.outcome.candidateId === candidate;

export const vitezyMargin = marginOf(VITEZY);
export const vitezyWins = winsOf(VITEZY);
export const karacsonyMargin = marginOf(KARACSONY);
export const karacsonyWins = winsOf(KARACSONY);

export const szentkiralyiWithdrew = (state: CampaignState) =>
  state.candidates?.[SZENTKIRALYI]?.status === "inactive";

const best =
  (score: (state: CampaignState) => number, sign: 1 | -1): Pick =>
  (_, options, preview) =>
    options.reduce((chosen, a) =>
      sign * score(preview(a)) > sign * score(preview(chosen)) ? a : chosen,
    );

export const greedy = best(vitezyMargin, 1);
export const karacsonyGreedy = best(karacsonyMargin, 1);
export const karacsonyWorst = best(karacsonyMargin, -1);
// Karácsony keeps the three-way race alive: Szentkirályi ahead of Vitézy.
export const keepThreeWay = best(
  (state) => (shares(state)[SZENTKIRALYI] ?? 0) - (shares(state)[VITEZY] ?? 0),
  1,
);
export const worst = best(vitezyMargin, -1);
export const weakThird = best(
  (state) => (shares(state)[VITEZY] ?? 0) - (shares(state)[SZENTKIRALYI] ?? 0),
  -1,
);

export const always =
  (answers: Record<string, string>, fallback = "A"): Pick =>
  (questionId, options) => {
    const wanted = answers[questionId] ?? fallback;
    return options.includes(wanted) ? wanted : options[0];
  };

export function seeded(seed: number): Pick {
  let value = seed;
  return (_, options) => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return options[Math.floor((value / 2147483648) * options.length)];
  };
}

export const withFixedAnswers = (
  answers: Record<string, string>,
  seed: number,
): Pick => {
  const random = seeded(seed);
  return (questionId, options, preview) =>
    answers[questionId] && options.includes(answers[questionId])
      ? answers[questionId]
      : random(questionId, options, preview);
};

export const strategyAnswers = (strategy: Strategy) =>
  Object.fromEntries(
    strategy.conditions.map((c) => [c.questionId, c.answerId]),
  );

export const HISTORICAL_ANSWERS = Object.fromEntries(
  Object.entries({
    "04": "A",
    "06": "A",
    "09": "A",
    "11": "A",
    "12": "A",
    "13": "A",
    "15": "A",
    "16": "A",
    "18": "A",
    "19": "A",
    "21": "A",
    "22": "A",
    "23": "A",
    "24": "A",
    "25": "A",
    "27_v": "A",
    "28_v": "A",
    "29_v": "D",
  }).map(([key, answerId]) => [`bp2024_vitezy_${key}`, answerId]),
);

export const KARACSONY_HISTORICAL_ANSWERS = Object.fromEntries(
  Object.entries({
    "01": "A",
    "02": "A",
    "03": "A",
    "04": "A",
    "05": "B",
    "06": "B",
    "07": "A",
    "08": "A",
    "09": "A",
    "10": "A",
    "11": "A",
    "13": "A",
    "15": "B",
    "19": "A",
    "21": "A",
    "23": "A",
    "25": "A",
    "27_v": "A",
    "28_v": "A",
    "29_v": "A",
  }).map(([key, answerId]) => [`bp2024_karacsony_${key}`, answerId]),
);

export interface Summary {
  runs: number;
  withdrawals: number;
  wins: number;
  margin: number;
  before: { vitezy: number; karacsony: number; szentkiralyi: number };
}

export function summarize(
  play: (pick: Pick) => Playthrough,
  pick: (run: number) => Pick,
  runs: number,
  candidate: string = VITEZY,
): Summary {
  const rival = candidate === VITEZY ? KARACSONY : VITEZY;
  const wins = winsOf(candidate);
  const results = Array.from({ length: runs }, (_, run) => play(pick(run)));
  const mean = (f: (p: Playthrough) => number) =>
    results.reduce((sum, p) => sum + f(p), 0) / runs;
  const before = (id: string) => mean((p) => shares(p.beforeDecision)[id] ?? 0);
  return {
    runs,
    withdrawals: mean((p) => (szentkiralyiWithdrew(p.state) ? 1 : 0)),
    wins: mean((p) => (wins(p.state) ? 1 : 0)),
    margin: mean(
      (p) => (shares(p.state)[candidate] ?? 0) - (shares(p.state)[rival] ?? 0),
    ),
    before: {
      vitezy: before(VITEZY),
      karacsony: before(KARACSONY),
      szentkiralyi: before(SZENTKIRALYI),
    },
  };
}
