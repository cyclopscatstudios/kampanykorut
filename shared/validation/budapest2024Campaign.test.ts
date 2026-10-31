import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { container } from "tsyringe";
import { describe, expect, it } from "vitest";
import { CampaignEngine } from "../domain/CampaignEngine";
import { CampaignEventEngine } from "../domain/CampaignEventEngine";
import { evaluateCondition } from "../domain/ConditionEvaluator";
import { EffectApplier } from "../domain/EffectApplier";
import { MandateCalculator } from "../domain/MandateCalculator";
import { MayoralResultCalculator } from "../domain/MayoralResultCalculator";
import { PollsterEngine } from "../domain/PollsterEngine";
import { ResultModifier } from "../domain/ResultModifier";
import { CandidateWithdrawalTransformer } from "../domain/ResultTransformer/CandidateWithdrawalTransformer";
import {
  CampaignEvent,
  CampaignState,
  CandidateListData,
  CandidateStatus,
  ConditionContext,
  HistoryItem,
  MayoralElectionConfig,
  RawAnsweEffectProps,
  RawQuestion,
  VoterEnvironmentConfig,
  WithdrawCandidateEffect,
} from "../types";

const campaignDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../apps/kampanykorut/public/campaigns/2024_budapest",
);

const read = <T>(file: string): T =>
  JSON.parse(readFileSync(join(campaignDir, file), "utf8"));

const districts = read<CandidateListData[]>("candidate_list_data.json");
const voterEnvironment = read<VoterEnvironmentConfig>(
  "voter_environment_config.json",
);
const events = read<CampaignEvent[]>("campaign_events.json");
const [withdrawal] = events;
const electionConfig = read<MayoralElectionConfig>("election_config.json");
const questions = read<RawQuestion[]>("lmp/vitezy_david/questions.json");
const answerEffects = read<RawAnsweEffectProps[]>(
  "lmp/vitezy_david/answer_effects.json",
);

const context = (
  turn: number,
  szentkiralyiShare: number,
  status: CandidateStatus = "active",
): ConditionContext => ({
  turn,
  answers: [],
  getSupport: (id) => (id === "szentkiralyi_alexandra" ? szentkiralyiShare : 0),
  getCandidateStatus: () => status,
  triggeredEventIds: [],
});

describe("2024 Budapest campaign data", () => {
  const calculator = container.resolve(MayoralResultCalculator);

  it("covers the 23 districts with their eligible voters", () => {
    expect(districts.map((d) => d.oevk)).toEqual(
      Array.from({ length: 23 }, (_, i) => i + 1),
    );
    expect(districts.reduce((sum, d) => sum + d.valasztopolgar, 0)).toBe(
      voterEnvironment.eligibleVoters,
    );
    for (const district of districts) {
      const decided = Object.values(district.partok).reduce<number>(
        (sum, v) => sum + (v ?? 0),
        0,
      );
      expect(decided).toBeLessThan(district.valasztopolgar);
    }
  });

  it("starts from the January Medián poll", () => {
    const result = calculator.calculate(districts);
    const pollTotal = 0.36 + 0.23 + 0.21 + 0.04;

    expect(result.percentages.karacsony_gergely).toBeCloseTo(
      0.36 / pollTotal,
      4,
    );
    expect(result.percentages.vitezy_david).toBeCloseTo(0.23 / pollTotal, 4);
    expect(result.percentages.szentkiralyi_alexandra).toBeCloseTo(
      0.21 / pollTotal,
      4,
    );
    expect(result.percentages.grundtner_andras).toBeCloseTo(
      0.04 / pollTotal,
      4,
    );
    expect(result.outcome).toEqual({
      kind: "winner",
      candidateId: "karacsony_gergely",
    });
  });

  describe("Szentkirályi's withdrawal", () => {
    const [branch] = withdrawal.conditions;

    it("only fires after the 26th decision while her share is below 15%", () => {
      expect(evaluateCondition(branch.if, context(25, 0.1))).toBe(false);
      expect(evaluateCondition(branch.if, context(26, 0.149))).toBe(true);
      expect(evaluateCondition(branch.if, context(27, 0.1))).toBe(false);
      expect(evaluateCondition(branch.if, context(26, 0.15))).toBe(false);
      expect(evaluateCondition(branch.if, context(26, 0.1, "inactive"))).toBe(
        false,
      );
    });

    it("moves her voters mostly to Vitézy without creating votes", () => {
      const effect = branch.effects[0] as WithdrawCandidateEffect;
      const transformer = container.resolve(CandidateWithdrawalTransformer);

      const before = calculator.calculate(districts);
      const after = calculator.calculate(
        transformer.redistribute(
          districts,
          effect.candidateId,
          effect.redistribution,
        ),
      );

      expect(
        Object.values(effect.redistribution).reduce((a, b) => a + b, 0),
      ).toBeCloseTo(1, 10);
      expect(after.votes.szentkiralyi_alexandra ?? 0).toBe(0);
      expect(after.validVotes).toBeLessThan(before.validVotes);
      expect(
        after.votes.vitezy_david - before.votes.vitezy_david,
      ).toBeGreaterThan(0.8 * before.votes.szentkiralyi_alexandra);
    });
  });

  describe("playthrough", () => {
    const settings = { showAdvisorFeedback: false, language: "hu" as const };

    const createEngine = (data: CandidateListData[]) =>
      new CampaignEngine(
        data,
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

    function play(
      data: CandidateListData[],
      pick: (questionId: string) => string = () => "A",
    ) {
      const engine = createEngine(data);
      let state: CampaignState = engine.createInitialState(
        "2024_budapest",
        null,
        electionConfig,
      );
      const history: HistoryItem[] = [];
      const visited: string[] = [];
      const announcements: string[][] = [];

      while (!state.isEnded) {
        const questionId = state.currentQuestion!.id;
        const answerId = pick(questionId);
        const effects =
          answerEffects
            .find((e) => e.id === questionId)
            ?.answers.find((a) => a.id === answerId)?.effects ?? [];
        visited.push(questionId);
        state = engine.processTurn(
          state,
          { questionId, answerId, effects },
          history,
          settings,
          electionConfig,
        );
        history.push({ questionId, answerId } as HistoryItem);
        announcements.push(state.campaignEvents?.pendingAnnouncementIds ?? []);
      }
      return { state, visited, announcements };
    }

    const lowSzentkiralyi = districts.map((d) => ({
      ...d,
      partok: {
        ...d.partok,
        szentkiralyi_alexandra: Math.round(
          (d.partok.szentkiralyi_alexandra ?? 0) * 0.5,
        ),
      },
    }));

    it("keeps her in the race on the N branch with 32 decisions", () => {
      const { state, visited, announcements } = play(districts);

      expect(visited).toHaveLength(32);
      expect(visited.slice(26, 31)).toEqual([
        "bp2024_vitezy_27_n",
        "bp2024_vitezy_28_n",
        "bp2024_vitezy_29_n",
        "bp2024_vitezy_30_n",
        "bp2024_vitezy_31_n",
      ]);
      expect(announcements[25]).toEqual(["szentkiralyi_alexandra_stays"]);
      expect(state.candidates?.szentkiralyi_alexandra?.status).not.toBe(
        "inactive",
      );
    });

    it("withdraws her after the 26th decision on the V branch", () => {
      const { state, visited, announcements } = play(lowSzentkiralyi);

      expect(visited).toHaveLength(32);
      expect(visited.slice(26, 31)).toEqual([
        "bp2024_vitezy_27_v",
        "bp2024_vitezy_28_v",
        "bp2024_vitezy_29_v",
        "bp2024_vitezy_30_v",
        "bp2024_vitezy_31_v",
      ]);
      expect(announcements[25]).toEqual(["szentkiralyi_alexandra_withdrawal"]);
      expect(state.candidates?.szentkiralyi_alexandra?.status).toBe("inactive");
    });

    it("shows the 17th decision without the LMP alliance after 4C", () => {
      const { visited } = play(districts, (id) =>
        id === "bp2024_vitezy_04" ? "C" : "A",
      );

      expect(visited).toHaveLength(32);
      expect(visited[16]).toBe("bp2024_vitezy_17_lmp_nelkul");
      expect(visited).not.toContain("bp2024_vitezy_17");
    });
  });
});
