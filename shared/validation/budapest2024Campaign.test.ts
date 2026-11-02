import { container } from "tsyringe";
import { describe, expect, it } from "vitest";
import { evaluateCondition } from "../domain/ConditionEvaluator";
import { MayoralResultCalculator } from "../domain/MayoralResultCalculator";
import { CandidateWithdrawalTransformer } from "../domain/ResultTransformer/CandidateWithdrawalTransformer";
import {
  CampaignEvent,
  CandidateListData,
  CandidateStatus,
  ConditionContext,
  VoterEnvironmentConfig,
  WithdrawCandidateEffect,
} from "../types";
import {
  always,
  createBudapestCampaign,
  greedy,
  HISTORICAL_ANSWERS,
  readCampaignFile as read,
  seeded,
  strategyAnswers,
  summarize,
  szentkiralyiWithdrew,
  vitezyMargin,
  vitezyWins,
  weakThird,
  withFixedAnswers,
  worst,
} from "./budapest2024Playthrough";

const districts = read<CandidateListData[]>("candidate_list_data.json");
const voterEnvironment = read<VoterEnvironmentConfig>(
  "voter_environment_config.json",
);
const [withdrawal] = read<CampaignEvent[]>("campaign_events.json");

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

    it("only fires after the 26th decision if she is third, clearly behind, and Vitézy can still win", () => {
      expect(evaluateCondition(branch.if, context(26, shares(0.2, 0.24)))).toBe(
        false,
      );
      expect(evaluateCondition(branch.if, context(26, shares(0.2, 0.26)))).toBe(
        true,
      );
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
    const { play, strategies } = createBudapestCampaign();

    it("withdraws her after the 26th decision when Vitézy is a strong second", () => {
      const { state, visited, announcements } = play(greedy);

      expect(visited).toHaveLength(32);
      expect(visited.slice(26, 31)).toEqual([
        "bp2024_vitezy_27_v",
        "bp2024_vitezy_28_v",
        "bp2024_vitezy_29_v",
        "bp2024_vitezy_30_v",
        "bp2024_vitezy_31_v",
      ]);
      expect(announcements[25]).toEqual(["szentkiralyi_alexandra_withdrawal"]);
      expect(szentkiralyiWithdrew(state)).toBe(true);
    });

    it("keeps her in the race when Vitézy stays a weak third", () => {
      const { state, visited, announcements } = play(weakThird);

      expect(visited).toHaveLength(32);
      expect(visited.slice(26, 31)).toEqual([
        "bp2024_vitezy_27_n",
        "bp2024_vitezy_28_n",
        "bp2024_vitezy_29_n",
        "bp2024_vitezy_30_n",
        "bp2024_vitezy_31_n",
      ]);
      expect(announcements[25]).toEqual(["szentkiralyi_alexandra_stays"]);
      expect(szentkiralyiWithdrew(state)).toBe(false);
      expect(vitezyWins(state)).toBe(false);
    });

    it("shows the 17th decision without the LMP alliance after 4C", () => {
      const { visited } = play(always({ bp2024_vitezy_04: "C" }));

      expect(visited).toHaveLength(32);
      expect(visited[16]).toBe("bp2024_vitezy_17_lmp_nelkul");
      expect(visited).not.toContain("bp2024_vitezy_17");
    });

    describe("balance", () => {
      it("is won by the best play and lost by the worst", () => {
        expect(vitezyMargin(play(greedy).state)).toBeGreaterThan(0.03);

        const worstPlay = play(worst);
        expect(vitezyMargin(worstPlay.state)).toBeLessThan(-0.05);
        expect(szentkiralyiWithdrew(worstPlay.state)).toBe(false);
      });

      it("is rarely won by random answers", () => {
        const { wins, withdrawals } = summarize(
          play,
          (run) => seeded(run + 1),
          100,
        );
        expect(wins).toBeGreaterThan(0.05);
        expect(wins).toBeLessThan(0.35);
        expect(withdrawals).toBeGreaterThan(0.3);
        expect(withdrawals).toBeLessThan(0.95);
      });

      it("makes the documented real answers a close race", () => {
        const { wins, margin } = summarize(
          play,
          (run) => withFixedAnswers(HISTORICAL_ANSWERS, run + 1),
          100,
        );
        expect(wins).toBeGreaterThan(0.25);
        expect(wins).toBeLessThan(0.65);
        expect(Math.abs(margin)).toBeLessThan(0.015);
      });

      it.each(strategies.map((s) => [s.label, s] as const))(
        "rewards following the %s strategy",
        (_, strategy) => {
          const { wins } = summarize(
            play,
            (run) => withFixedAnswers(strategyAnswers(strategy), run + 1),
            60,
          );
          expect(wins).toBeGreaterThan(0.25);
          expect(wins).toBeLessThan(0.85);
        },
      );
    });
  });
});
