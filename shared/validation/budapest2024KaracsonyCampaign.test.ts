import { describe, expect, it } from "vitest";
import { RawQuestion } from "../types";
import {
  createBudapestCampaign,
  KARACSONY,
  KARACSONY_HISTORICAL_ANSWERS,
  KARACSONY_SIDE,
  karacsonyGreedy,
  karacsonyMargin,
  karacsonyWins,
  karacsonyWorst,
  keepThreeWay,
  readCampaignFile as read,
  seeded,
  splitPlan,
  strategyAnswers,
  summarize,
  szentkiralyiWithdrew,
  withFixedAnswers,
} from "./budapest2024Playthrough";

const questions = read<RawQuestion[]>(`${KARACSONY_SIDE.dir}/questions.json`);
const words = (text: string) => text.trim().split(/\s+/).length;

describe("2024 Budapest campaign, Karácsony side", () => {
  it("keeps every decision short enough to read on a phone", () => {
    for (const q of questions) {
      const answers = q.possibleAnswers.map((a) => words(a.label));
      expect(words(q.question), q.id).toBeLessThanOrEqual(55);
      expect(Math.max(...answers), q.id).toBeLessThanOrEqual(25);
      expect(
        words(q.question) + answers.reduce((a, b) => a + b, 0),
        q.id,
      ).toBeLessThanOrEqual(120);
    }
  });

  describe("playthrough", () => {
    const { play, strategies } = createBudapestCampaign(KARACSONY_SIDE);
    const branch = (suffix: string) =>
      [27, 28, 29, 30, 31].map((n) => `bp2024_karacsony_${n}_${suffix}`);

    it("keeps Szentkirályi in the race and wins by keeping his rivals level", () => {
      const { state, visited, announcements } = play(karacsonyGreedy);

      expect(visited).toHaveLength(32);
      expect(visited.slice(26, 31)).toEqual(branch("n"));
      expect(announcements[25]).toEqual(["szentkiralyi_alexandra_stays"]);
      expect(szentkiralyiWithdrew(state)).toBe(false);
      expect(karacsonyWins(state)).toBe(true);
    });

    it("loses the three-way race if Szentkirályi is allowed to pull away", () => {
      const { state, visited, announcements } = play(keepThreeWay);

      expect(visited.slice(26, 31)).toEqual(branch("n"));
      expect(szentkiralyiWithdrew(state)).toBe(false);
      expect(announcements.flat()).toContain(
        "karacsony_consolidation_szentkiralyi_announcement",
      );
      expect(karacsonyWins(state)).toBe(false);
    });

    it("lets her withdraw when Vitézy becomes the strong second", () => {
      const { state, visited, announcements } = play(karacsonyWorst);

      expect(visited).toHaveLength(32);
      expect(visited.slice(26, 31)).toEqual(branch("v"));
      expect(announcements[25]).toEqual(["szentkiralyi_alexandra_withdrawal"]);
      expect(szentkiralyiWithdrew(state)).toBe(true);
    });

    describe("balance", () => {
      const sum = (pick: Parameters<typeof summarize>[1], runs: number) =>
        summarize(play, pick, runs, KARACSONY);

      it("is won by the best play and lost by the worst", () => {
        expect(karacsonyMargin(play(karacsonyGreedy).state)).toBeGreaterThan(
          0.04,
        );
        expect(karacsonyMargin(play(karacsonyWorst).state)).toBeLessThan(-0.05);
      });

      it("is not an easy win with random answers", () => {
        const { wins, withdrawals } = sum((run) => seeded(run + 1), 100);
        expect(wins).toBeGreaterThan(0.05);
        expect(wins).toBeLessThan(0.35);
        expect(withdrawals).toBeGreaterThan(0.6);
        expect(withdrawals).toBeLessThan(0.95);
      });

      it("makes the documented real answers a close race after the withdrawal", () => {
        const { wins, margin, withdrawals } = sum(
          (run) => withFixedAnswers(KARACSONY_HISTORICAL_ANSWERS, run + 1),
          100,
        );
        expect(withdrawals).toBeGreaterThan(0.9);
        expect(wins).toBeGreaterThan(0.25);
        expect(wins).toBeLessThan(0.65);
        expect(Math.abs(margin)).toBeLessThan(0.015);
      });

      it("rewards splitting the opposition", () => {
        const { wins, withdrawals } = sum((run) => splitPlan(run + 1), 60);
        expect(withdrawals).toBeLessThan(0.1);
        expect(wins).toBeGreaterThan(0.85);
      });

      it.each(strategies.map((s) => [s.label, s] as const))(
        "rewards following the %s strategy",
        (_, strategy) => {
          const { wins } = sum(
            (run) => withFixedAnswers(strategyAnswers(strategy), run + 1),
            60,
          );
          expect(wins).toBeGreaterThan(0.3);
          expect(wins).toBeLessThan(0.8);
        },
      );
    });
  });
});
