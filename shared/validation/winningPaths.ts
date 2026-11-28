import "reflect-metadata";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CampaignEngine } from "@shared/domain/CampaignEngine";
import { CampaignEventEngine } from "@shared/domain/CampaignEventEngine";
import {
  buildCoalitionResult,
  buildCoalitionView,
  getGovernmentOutcome,
  needsCoalitionOffer,
  submitCoalitionOffer,
} from "@shared/domain/Coalition";
import { DistrictGroupEngine } from "@shared/domain/DistrictGroupEngine";
import { EffectApplier } from "@shared/domain/EffectApplier";
import { getPlayerVoteKey } from "@shared/domain/ElectionType";
import { getMajorityThresholds } from "@shared/domain/Majority";
import { MandateCalculator } from "@shared/domain/MandateCalculator";
import { MayoralResultCalculator } from "@shared/domain/MayoralResultCalculator";
import {
  autoSelectCompletedFocus,
  buildFocusOverview,
  canSelectFocus,
  selectFocus,
} from "@shared/domain/PoliticalFocus";
import { PollsterEngine } from "@shared/domain/PollsterEngine";
import { ResultModifier } from "@shared/domain/ResultModifier";
import { CandidateWithdrawalTransformer } from "@shared/domain/ResultTransformer/CandidateWithdrawalTransformer";
import { VoterEnvironment } from "@shared/domain/VoterEnvironment";
import type {
  CampaignState,
  Decision,
  GovernmentOutcome,
  HistoryItem,
  RawAnsweEffectProps,
  Strategy,
} from "@shared/types";
import { container } from "tsyringe";

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
  strategy?: string;
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
  strategyMatches: Record<string, number>;
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

function campaignFiles(campaign: string, side: string) {
  const root = join(campaignsDir, campaign);
  const read = (file: string) =>
    JSON.parse(readFileSync(join(root, file), "utf8"));
  const { files } = read("manifest.json");
  const [party, candidate] = side.split("/");
  return {
    read,
    files,
    party,
    candidate,
    sideFiles: files.playableSides[party][candidate],
  };
}

export function loadSide(campaign: string, side: string) {
  const { read, files, party, candidate, sideFiles } = campaignFiles(
    campaign,
    side,
  );

  const districts = read(files.candidateListData);
  const electionConfig = read(files.electionConfig);
  if (files.regions) electionConfig.election.regions = read(files.regions);
  if (files.issues) electionConfig.issues = read(files.issues);
  const questions = read(sideFiles.questions);
  const answerEffects: RawAnsweEffectProps[] = read(sideFiles.answerEffect);
  const eventsFile = sideFiles.campaignEvents ?? files.campaignEvents;
  const events = eventsFile ? read(eventsFile) : undefined;
  const strategies: Strategy[] | undefined = sideFiles.campaignStrategies
    ? read(sideFiles.campaignStrategies)
    : undefined;
  const groups = files.customGroups ? read(files.customGroups) : [];
  const politicalConfig = sideFiles.politicalConfig
    ? read(sideFiles.politicalConfig)
    : undefined;

  container.resolve(DistrictGroupEngine).configure(districts, groups);
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
  const playerSide = { partyId: party, candidateId: candidate };
  const playerKey = getPlayerVoteKey(electionConfig, playerSide) ?? party;

  function play(
    focuses: string[],
    pick: (questionId: string, options: string[]) => string | undefined,
  ): LineResult {
    let state: CampaignState = {
      ...engine.createInitialState(campaign, null, electionConfig, party),
      playerSide,
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
        strategies,
        false,
        playerKey,
      );
      history.push({ questionId: question.id, answerId } as HistoryItem);
      state = autoSelectCompletedFocus(state, config, history);
      pickFocuses();
    }

    const governments: Government[] = [];
    const mayoral = state.mayoralResult;
    const outcome = mayoral
      ? getMayoralOutcome(state)
      : (getGovernmentOutcome(state, config) ?? getClassicOutcome(state));
    if (outcome === "single-majority") {
      governments.push({ partners: [], outcome });
    } else if (!mayoral && needsCoalitionOffer(state, config)) {
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
      seats: mayoral
        ? Object.fromEntries(
            Object.entries(mayoral.percentages).map(([id, share]) => [
              id,
              Math.round(share * 1000),
            ]),
          )
        : Object.fromEntries(
            (state.results?.mandates ?? []).map((m) => [m.party, m.totalSeats]),
          ),
      strategyMatches: Object.fromEntries(
        (strategies ?? []).map((strategy) => [
          strategy.id,
          strategy.conditions.filter((c) =>
            history.some(
              (h) => h.questionId === c.questionId && h.answerId === c.answerId,
            ),
          ).length,
        ]),
      ),
      answers: Object.fromEntries(
        history.map((h) => [h.questionId, h.answerId]),
      ),
      missingAnswers,
    };
  }

  function getMayoralOutcome(state: CampaignState) {
    const outcome = state.mayoralResult?.outcome;
    return outcome?.kind === "winner" && outcome.candidateId === playerKey
      ? ("single-majority" as const)
      : undefined;
  }

  function getClassicOutcome(state: CampaignState) {
    const seats =
      state.results?.mandates.find((m) => m.party === party)?.totalSeats ?? 0;
    const allSeats = electionConfig.allSeats as number;
    return seats >= getMajorityThresholds(allSeats).simple
      ? ("single-majority" as const)
      : undefined;
  }

  const playLine = (line: Pick<WinningLine, "focuses" | "answers">) =>
    play(line.focuses, (questionId) => line.answers[questionId]);

  const strategyTarget = (id?: string) =>
    Math.max(
      0,
      ...(strategies?.find((s) => s.id === id)?.rewards ?? []).map(
        (r) => r.minMatches,
      ),
    );

  return { play, playLine, party: playerKey, strategyTarget };
}

const govKey = (g: Government) => `${g.outcome}:${g.partners.join("+")}`;

export function isWinning(
  result: LineResult,
  focuses: string[],
  strategy?: { id: string; target: number },
): boolean {
  return (
    result.missingAnswers.length === 0 &&
    (!strategy ||
      (result.strategyMatches[strategy.id] ?? 0) >= strategy.target) &&
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
  strategyId?: string,
): LineResult {
  const strategy = strategyId
    ? { id: strategyId, target: side.strategyTarget(strategyId) }
    : undefined;
  const score = (r: LineResult) => {
    const matches = strategy
      ? Math.min(r.strategyMatches[strategy.id] ?? 0, strategy.target)
      : 0;
    const completed = r.focuses.filter((f) => f.status === "completed").length;
    const onPath = r.focuses.map((f) => f.id).join("/") === focuses.join("/");
    const best = r.governments.some((g) => g.outcome === "single-majority")
      ? 3
      : r.governments.length > 0
        ? 2
        : 0;
    return (
      (onPath ? 1 : 0) * 1e6 +
      (isWinning(r, focuses, strategy) ? 1e5 : 0) +
      matches * 5000 +
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

export function renderWinningPaths(fixture: WinningPathsFile): string {
  const out: string[] = [];
  const sides = [...new Set(fixture.lines.map((l) => l.side))];
  const first = campaignFiles(fixture.campaign, sides[0]);
  const electionConfig = first.read(first.files.electionConfig);
  const parties = new Map<
    string,
    { name: string; shortName?: string; leader?: string }
  >(electionConfig.parties.map((p: { id: string }) => [p.id, p]));
  const candidateLabel = (sideId: string) => {
    const [partyId, candidateId] = sideId.split("/");
    return (
      electionConfig.playableSides
        ?.find((s: { id: string }) => s.id === partyId)
        ?.mainCandidates?.find((c: { id: string }) => c.id === candidateId)
        ?.label ?? sideId
    );
  };
  const partyName = (id: string) =>
    parties.get(id)?.shortName ?? parties.get(id)?.name ?? id;

  const strategic = sides.some(
    (side) => campaignFiles(fixture.campaign, side).sideFiles.politicalConfig,
  );
  const mayoral = electionConfig.election?.type === "mayoral";
  out.push(
    `# ${electionConfig.title ?? fixture.campaign}: győztes utak`,
    "",
    (strategic
      ? "Minden fókuszúthoz egy válaszsor, amellyel mind a 4 fókusz teljesül, és létrejön a kormány. "
      : mayoral
        ? "Minden kampánystratégiához egy válaszsor, amellyel a stratégia teljes jutalma teljesül, és a jelölt megnyeri a választást. "
        : "Minden útvonalhoz egy válaszsor, amellyel a párt önálló többséget szerez. ") +
      "A `winningPaths.test.ts` ezeket játssza végig. Hangolás után: `UPDATE_WINNING_PATHS=1 yarn test winningPaths`.",
  );

  for (const sideId of sides) {
    const { read, sideFiles, party } = campaignFiles(fixture.campaign, sideId);
    const questions = new Map<string, string>(
      read(sideFiles.questions).map((q: { id: string; title: string }) => [
        q.id,
        q.title,
      ]),
    );
    const focuses = new Map<string, string>(
      (sideFiles.politicalConfig
        ? read(sideFiles.politicalConfig).focuses
        : []
      ).map((f: { id: string; title: string }) => [f.id, f.title]),
    );
    const strategies = new Map<string, string>(
      (sideFiles.campaignStrategies
        ? read(sideFiles.campaignStrategies)
        : []
      ).map((s: { id: string; label: string }) => [s.id, s.label]),
    );
    const sideLabel = mayoral
      ? (electionConfig.playableSides?.find(
          (s: { id: string }) => s.id === party,
        )?.label ?? party)
      : partyName(party);
    out.push(
      "",
      `## ${sideLabel}: ${parties.get(party)?.leader ?? candidateLabel(sideId)}`,
    );

    const groups = new Map<string, WinningLine[]>();
    for (const line of fixture.lines.filter((l) => l.side === sideId)) {
      const key = Object.keys(line.answers).join(",");
      groups.set(key, [...(groups.get(key) ?? []), line]);
    }
    for (const [key, lines] of groups) {
      const order = key.split(",");
      out.push(
        "",
        order.map((q, i) => `${i + 1}. ${questions.get(q) ?? q}`).join(" · "),
        "",
        "| Út | Partner | Válaszok |",
        "| --- | --- | --- |",
      );
      for (const line of lines) {
        const path = line.focuses.length
          ? line.focuses.map((f) => focuses.get(f) ?? f).join(" → ")
          : line.strategy
            ? (strategies.get(line.strategy) ?? line.name)
            : line.name;
        const government = line.governments
          .map((g) =>
            g.partners.length
              ? g.partners
                  .map((id) => parties.get(id)?.leader ?? partyName(id))
                  .join(" + ")
              : mayoral
                ? "győzelem"
                : "önálló többség",
          )
          .join(" vagy ");
        const answers = order
          .map((q) => line.answers[q])
          .join("")
          .replace(/(.{5})(?=.)/g, "$1 ");
        out.push(`| ${path} | ${government} | \`${answers}\` |`);
      }
    }
  }
  return `${out.join("\n")}\n`;
}
