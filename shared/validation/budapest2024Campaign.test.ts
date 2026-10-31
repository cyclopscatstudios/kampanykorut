import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
const [withdrawal] = read<CampaignEvent[]>("campaign_events.json");

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

    it("only fires from turn 25 to 32 while her share is below 15%", () => {
      expect(evaluateCondition(branch.if, context(24, 0.1))).toBe(false);
      expect(evaluateCondition(branch.if, context(25, 0.1))).toBe(true);
      expect(evaluateCondition(branch.if, context(32, 0.149))).toBe(true);
      expect(evaluateCondition(branch.if, context(33, 0.1))).toBe(false);
      expect(evaluateCondition(branch.if, context(28, 0.15))).toBe(false);
      expect(evaluateCondition(branch.if, context(28, 0.1, "inactive"))).toBe(
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
});
