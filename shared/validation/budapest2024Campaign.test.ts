import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { container } from "tsyringe";
import { describe, expect, it } from "vitest";
import { CampaignEngine } from "../domain/CampaignEngine";
import { CampaignEventEngine } from "../domain/CampaignEventEngine";
import { evaluateCondition } from "../domain/ConditionEvaluator";
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
  CandidateStatus,
  ConditionContext,
  Decision,
  District,
  DistrictGroup,
  HistoryItem,
  MayoralElectionConfig,
  RawAnsweEffectProps,
  RawQuestion,
  Strategy,
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
  standings: Record<string, number>,
  status: CandidateStatus = "active",
): ConditionContext => ({
  turn,
  answers: [],
  getSupport: (id) => standings[id] ?? 0,
  getStandings: () =>
    Object.entries(standings)
      .map(([candidateId, share]) => ({ candidateId, share }))
      .sort((a, b) => b.share - a.share),
  getCandidateStatus: () => status,
  triggeredEventIds: [],
});

const shares = (szentkiralyi: number, vitezy = 0.3) => ({
  karacsony_gergely: 0.4,
  vitezy_david: vitezy,
  szentkiralyi_alexandra: szentkiralyi,
  grundtner_andras: 0.05,
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

    it("only fires after the 26th decision if she is third and clearly behind", () => {
      expect(evaluateCondition(branch.if, context(26, shares(0.25)))).toBe(
        true,
      );
      expect(evaluateCondition(branch.if, context(25, shares(0.25)))).toBe(
        false,
      );
      expect(evaluateCondition(branch.if, context(27, shares(0.25)))).toBe(
        false,
      );
      expect(evaluateCondition(branch.if, context(26, shares(0.28)))).toBe(
        false,
      );
      expect(evaluateCondition(branch.if, context(26, shares(0.32)))).toBe(
        false,
      );
      expect(
        evaluateCondition(branch.if, context(26, shares(0.25), "inactive")),
      ).toBe(false);
    });

    it("moves more than half of her voters to Vitézy without creating votes", () => {
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
      ).toBeGreaterThan(0.5 * before.votes.szentkiralyi_alexandra);
    });
  });

  describe("playthrough", () => {
    const settings = { showAdvisorFeedback: false, language: "hu" as const };
    const strategies = read<Strategy[]>(
      "lmp/vitezy_david/campaign_strategies.json",
    );
    const groups = read<DistrictGroup[]>("custom_groups.json");
    const boostDistrict = { megyekod: 1, oevk: 11 } as District;

    type Pick = (
      questionId: string,
      options: string[],
      preview: (answerId: string) => CampaignState,
    ) => string;

    const createEngine = () => {
      container.resolve(DistrictGroupEngine).configure(districts, groups);
      container
        .resolve(VoterEnvironment)
        .configure({ ...voterEnvironment, listData: districts });
      return new CampaignEngine(
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
    };

    function play(engine: CampaignEngine, pick: Pick) {
      let state = engine.createInitialState(
        "2024_budapest",
        null,
        electionConfig,
      );
      const history: HistoryItem[] = [];
      const visited: string[] = [];
      const announcements: string[][] = [];

      const answer = (
        from: CampaignState,
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
          "vitezy_david",
        );
      };

      while (!state.isEnded) {
        const questionId = state.currentQuestion!.id;
        const options = questions
          .find((q) => q.id === questionId)!
          .possibleAnswers.map((a) => a.id);
        const current = state;
        const answerId = pick(questionId, options, (a) =>
          answer(current, questionId, a),
        );
        visited.push(questionId);
        state = answer(state, questionId, answerId);
        history.push({ questionId, answerId } as HistoryItem);
        announcements.push(state.campaignEvents?.pendingAnnouncementIds ?? []);
      }
      return { state, visited, announcements };
    }

    const margin = (state: CampaignState) => {
      const shares = state.mayoralResult!.percentages;
      const rivals = Object.entries(shares)
        .filter(([id]) => id !== "vitezy_david")
        .map(([, share]) => share);
      return (shares.vitezy_david ?? 0) - Math.max(...rivals);
    };

    const always =
      (answers: Record<string, string>, fallback = "A"): Pick =>
      (questionId, options) => {
        const wanted = answers[questionId] ?? fallback;
        return options.includes(wanted) ? wanted : options[0];
      };

    const greedy: Pick = (_, options, preview) =>
      options.reduce((best, a) =>
        margin(preview(a)) > margin(preview(best)) ? a : best,
      );
    const gapToSzentkiralyi = (state: CampaignState) => {
      const shares = state.mayoralResult!.percentages;
      return (shares.vitezy_david ?? 0) - (shares.szentkiralyi_alexandra ?? 0);
    };
    const worstForBranch: Pick = (_, options, preview) =>
      options.reduce((best, a) =>
        gapToSzentkiralyi(preview(a)) < gapToSzentkiralyi(preview(best))
          ? a
          : best,
      );
    const worst: Pick = (_, options, preview) =>
      options.reduce((best, a) =>
        margin(preview(a)) < margin(preview(best)) ? a : best,
      );

    function seeded(seed: number): Pick {
      let value = seed;
      return (_, options) => {
        value = (value * 1103515245 + 12345) % 2147483648;
        return options[Math.floor((value / 2147483648) * options.length)];
      };
    }

    const strategyPick = (strategy: Strategy, seed: number): Pick => {
      const answers = Object.fromEntries(
        strategy.conditions.map((c) => [c.questionId, c.answerId]),
      );
      const random = seeded(seed);
      return (questionId, options, preview) =>
        answers[questionId] && options.includes(answers[questionId])
          ? answers[questionId]
          : random(questionId, options, preview);
    };

    const winRate = (pick: () => Pick, runs: number) => {
      const engine = createEngine();
      let wins = 0;
      let withdrawals = 0;
      for (let i = 0; i < runs; i++) {
        const { state } = play(engine, pick());
        if (
          state.mayoralResult!.outcome.kind === "winner" &&
          state.mayoralResult!.outcome.candidateId === "vitezy_david"
        ) {
          wins++;
        }
        if (state.candidates?.szentkiralyi_alexandra?.status === "inactive") {
          withdrawals++;
        }
      }
      return { wins: wins / runs, withdrawals: withdrawals / runs };
    };

    it("withdraws her after the 26th decision when Vitézy courts her voters", () => {
      const { state, visited, announcements } = play(
        createEngine(),
        always({}),
      );

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

    it("keeps her in the race when Vitézy stays a weak third", () => {
      const { state, visited, announcements } = play(
        createEngine(),
        worstForBranch,
      );

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

    it("shows the 17th decision without the LMP alliance after 4C", () => {
      const { visited } = play(
        createEngine(),
        always({ bp2024_vitezy_04: "C" }),
      );

      expect(visited).toHaveLength(32);
      expect(visited[16]).toBe("bp2024_vitezy_17_lmp_nelkul");
      expect(visited).not.toContain("bp2024_vitezy_17");
    });

    describe("balance", () => {
      it("is won by the best play and lost by the worst", () => {
        const engine = createEngine();
        expect(margin(play(engine, greedy).state)).toBeGreaterThan(0.03);
        expect(margin(play(engine, worst).state)).toBeLessThan(-0.05);
      });

      it("is rarely won by random answers", () => {
        let seed = 1;
        const { wins, withdrawals } = winRate(() => seeded(seed++), 100);
        expect(wins).toBeGreaterThan(0.05);
        expect(wins).toBeLessThan(0.35);
        expect(withdrawals).toBeGreaterThan(0.5);
        expect(withdrawals).toBeLessThan(0.98);
      });

      it.each(strategies.map((s) => [s.label, s] as const))(
        "rewards following the %s strategy",
        (_, strategy) => {
          let seed = 1;
          const { wins } = winRate(() => strategyPick(strategy, seed++), 60);
          expect(wins).toBeGreaterThan(0.3);
          expect(wins).toBeLessThan(0.85);
        },
      );
    });
  });
});
