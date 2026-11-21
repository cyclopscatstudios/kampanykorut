import "reflect-metadata";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { container } from "tsyringe";
import { CampaignEngine } from "../domain/CampaignEngine";
import { CampaignEventEngine } from "../domain/CampaignEventEngine";
import {
  buildCoalitionResult,
  buildCoalitionView,
  getGovernmentOutcome,
  needsCoalitionOffer,
  submitCoalitionOffer,
} from "../domain/Coalition";
import { DistrictGroupEngine } from "../domain/DistrictGroupEngine";
import { EffectApplier } from "../domain/EffectApplier";
import { MandateCalculator } from "../domain/MandateCalculator";
import { MayoralResultCalculator } from "../domain/MayoralResultCalculator";
import {
  autoSelectCompletedFocus,
  buildFocusOverview,
  canSelectFocus,
  selectFocus,
} from "../domain/PoliticalFocus";
import { PollsterEngine } from "../domain/PollsterEngine";
import { ResultModifier } from "../domain/ResultModifier";
import { CandidateWithdrawalTransformer } from "../domain/ResultTransformer/CandidateWithdrawalTransformer";
import { VoterEnvironment } from "../domain/VoterEnvironment";
import type {
  CampaignState,
  Decision,
  GovernmentOutcome,
  HistoryItem,
  RawAnsweEffectProps,
} from "../types";

export const campaignsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../apps/kampanykorut/public/campaigns",
);

export const winningPathsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "winningPaths",
);

export interface Government {
  partners: string[];
  outcome: GovernmentOutcome;
}

export interface WinningLine {
  name: string;
  side: string;
  focuses: string[];
  governments: Government[];
  answers: Record<string, string>;
}

export interface WinningPathsFile {
  campaign: string;
  lines: WinningLine[];
}

export interface LineResult {
  focuses: { id: string; status: string }[];
  governments: Government[];
  seats: Record<string, number>;
  answers: Record<string, string>;
  missingAnswers: string[];
}

const STRONG: GovernmentOutcome[] = ["single-majority", "coalition"];

function partnerSets(ids: string[]): string[][] {
  const sets: string[][] = [];
  const walk = (start: number, current: string[]) => {
    for (let i = start; i < ids.length; i++) {
      const next = [...current, ids[i]];
      sets.push(next);
      walk(i + 1, next);
    }
  };
  walk(0, []);
  return sets;
}

export function loadSide(campaign: string, side: string) {
  const root = join(campaignsDir, campaign);
  const read = (file: string) =>
    JSON.parse(readFileSync(join(root, file), "utf8"));
  const { files } = read("manifest.json");
  const [party, candidate] = side.split("/");
  const sideFiles = files.playableSides[party][candidate];

  const districts = read(files.candidateListData);
  const electionConfig = read(files.electionConfig);
  if (files.regions) electionConfig.election.regions = read(files.regions);
  if (files.issues) electionConfig.issues = read(files.issues);
  const questions = read(sideFiles.questions);
  const answerEffects: RawAnsweEffectProps[] = read(sideFiles.answerEffect);
  const events = sideFiles.campaignEvents
    ? read(sideFiles.campaignEvents)
    : undefined;
  const politicalConfig = sideFiles.politicalConfig
    ? read(sideFiles.politicalConfig)
    : undefined;

  container.resolve(DistrictGroupEngine).configure(districts, []);
  container.resolve(VoterEnvironment).configure({
    ...read(files.voterEnvironmentConfig),
    listData: districts,
  });

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
    politicalConfig?.relations,
    politicalConfig,
  );
  const config = { politicalConfig, electionConfig } as never;

  function play(
    focuses: string[],
    pick: (questionId: string, options: string[]) => string | undefined,
  ): LineResult {
    let state: CampaignState = {
      ...engine.createInitialState(campaign, null, electionConfig, party),
      playerSide: { partyId: party, candidateId: candidate },
    };
    const history: HistoryItem[] = [];
    const missingAnswers: string[] = [];
    const pickFocuses = () => {
      for (const focus of focuses) {
        if (canSelectFocus(state, config, focus)) {
          state = selectFocus(state, config, focus);
        }
      }
    };

    pickFocuses();
    while (!state.isEnded) {
      const question = state.currentQuestion!;
      const options = question.possibleAnswers.map((a) => a.id);
      let answerId = pick(question.id, options);
      if (!answerId || !options.includes(answerId)) {
        missingAnswers.push(question.id);
        answerId = options[0];
      }
      const entry = answerEffects
        .find((e) => e.id === question.id)!
        .answers.find((a) => a.id === answerId)!;
      state = engine.processTurn(
        state,
        {
          questionId: question.id,
          answerId,
          effects: entry.effects,
          conditionalEffects: entry.conditionalEffects,
        } as Decision,
        history,
        { showAdvisorFeedback: false, language: "hu" } as never,
        electionConfig,
        undefined,
        false,
        party,
      );
      history.push({ questionId: question.id, answerId } as HistoryItem);
      state = autoSelectCompletedFocus(state, config, history);
      pickFocuses();
    }

    const governments: Government[] = [];
    const outcome = getGovernmentOutcome(state, config);
    if (outcome === "single-majority") {
      governments.push({ partners: [], outcome });
    } else if (needsCoalitionOffer(state, config)) {
      const ids = buildCoalitionView(state, config)!.partners.map(
        (p) => p.partyId,
      );
      for (const partners of partnerSets(ids)) {
        const result = buildCoalitionResult(
          submitCoalitionOffer(state, config, history, partners),
          config,
        );
        if (
          result &&
          result.responses.every((r) => r.accepted) &&
          STRONG.includes(result.outcome)
        ) {
          governments.push({ partners, outcome: result.outcome });
        }
      }
    }

    return {
      focuses: buildFocusOverview(state, config, history).selected.map((f) => ({
        id: f.id,
        status: f.status,
      })),
      governments,
      seats: Object.fromEntries(
        (state.results?.mandates ?? []).map((m) => [m.party, m.totalSeats]),
      ),
      answers: Object.fromEntries(
        history.map((h) => [h.questionId, h.answerId]),
      ),
      missingAnswers,
    };
  }

  const playLine = (line: Pick<WinningLine, "focuses" | "answers">) =>
    play(line.focuses, (questionId) => line.answers[questionId]);

  return { play, playLine, party };
}

const govKey = (g: Government) => `${g.outcome}:${g.partners.join("+")}`;

export function isWinning(result: LineResult, focuses: string[]): boolean {
  return (
    result.missingAnswers.length === 0 &&
    result.focuses.map((f) => f.id).join("/") === focuses.join("/") &&
    result.focuses.every((f) => f.status === "completed") &&
    result.governments.length > 0
  );
}

export function describeGovernments(governments: Government[]): string[] {
  return governments.map(govKey).sort();
}

export function improveLine(
  side: ReturnType<typeof loadSide>,
  focuses: string[],
  start: Record<string, string>,
  rounds = 6,
): LineResult {
  const score = (r: LineResult) => {
    const completed = r.focuses.filter((f) => f.status === "completed").length;
    const onPath = r.focuses.map((f) => f.id).join("/") === focuses.join("/");
    const best = r.governments.some((g) => g.outcome === "single-majority")
      ? 3
      : r.governments.length > 0
        ? 2
        : 0;
    return (
      (onPath ? 1 : 0) * 1e6 +
      (isWinning(r, focuses) ? 1e5 : 0) +
      completed * 2000 +
      best * 1000 +
      (r.seats[side.party] ?? 0)
    );
  };
  let best = side.play(focuses, (q, options) => start[q] ?? options[0]);
  let bestScore = score(best);
  for (let round = 0; round < rounds; round++) {
    const base = best;
    for (const questionId of Object.keys(base.answers)) {
      for (const answerId of ["A", "B", "C", "D"]) {
        if (answerId === base.answers[questionId]) continue;
        const answers = { ...base.answers, [questionId]: answerId };
        const candidate = side.play(
          focuses,
          (q, options) => answers[q] ?? options[0],
        );
        const candidateScore = score(candidate);
        if (candidateScore > bestScore) {
          best = candidate;
          bestScore = candidateScore;
        }
      }
    }
    if (best === base) break;
  }
  return best;
}
