import { describe, expect, it } from "vitest";
import { RawQuestion } from "../types";
import {
  always,
  createBudapestCampaign,
  readCampaignFile as read,
  seeded,
  strategyAnswers,
  summarize,
  SZENTKIRALYI,
  SZENTKIRALYI_SIDE,
  szentkiralyiGreedy,
  szentkiralyiMargin,
  szentkiralyiWins,
  szentkiralyiWithdrew,
  szentkiralyiWorst,
  withFixedAnswers,
} from "./budapest2024Playthrough";

const questions = read<RawQuestion[]>(
  `${SZENTKIRALYI_SIDE.dir}/questions.json`,
);
const words = (text: string) => text.trim().split(/\s+/).length;
const id = (key: string) => `bp2024_szentkiralyi_${key}`;

describe("2024 Budapest campaign, Szentkirályi side", () => {
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
    const { play, strategies } = createBudapestCampaign(SZENTKIRALYI_SIDE);

    it("never withdraws the player's candidate", () => {
      for (const pick of [szentkiralyiGreedy, szentkiralyiWorst]) {
        const { state, visited, announcements } = play(pick);

        expect(visited).toHaveLength(32);
        expect(announcements[25]).toEqual(["szentkiralyi_alexandra_stays"]);
        expect(szentkiralyiWithdrew(state)).toBe(false);
      }
    });

    it("plays the three-way debate only if she accepted it", () => {
      expect(play(always({ [id("21")]: "A" })).visited).toContain(
        id("24_vita"),
      );
      expect(play(always({ [id("21")]: "B" })).visited).toContain(
        id("24_nelkul"),
      );
    });

    describe("balance", () => {
      const sum = (pick: Parameters<typeof summarize>[1], runs: number) =>
        summarize(play, pick, runs, SZENTKIRALYI);

      it("is won by the best play and lost by the worst", () => {
        const best = play(szentkiralyiGreedy).state;
        expect(szentkiralyiWins(best)).toBe(true);
        expect(szentkiralyiMargin(best)).toBeGreaterThan(0.015);
        expect(szentkiralyiMargin(play(szentkiralyiWorst).state)).toBeLessThan(
          -0.1,
        );
      });

      it("is not won with random answers", () => {
        expect(sum((run) => seeded(run + 1), 100).wins).toBeLessThan(0.05);
      });

      it.each(strategies.map((s) => [s.label, s] as const))(
        "gives the %s strategy a real but hard chance",
        (_, strategy) => {
          const { wins } = sum(
            (run) => withFixedAnswers(strategyAnswers(strategy), run + 1),
            60,
          );
          expect(wins).toBeGreaterThan(0.1);
          expect(wins).toBeLessThan(0.5);
        },
      );
    });
  });
});
