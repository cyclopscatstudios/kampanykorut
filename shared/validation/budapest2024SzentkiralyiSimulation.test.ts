import { writeFileSync } from "node:fs";
import { describe, it } from "vitest";
import {
  createBudapestCampaign,
  seeded,
  strategyAnswers,
  summarize,
  SZENTKIRALYI,
  SZENTKIRALYI_SIDE,
  szentkiralyiGreedy,
  szentkiralyiWorst,
  withFixedAnswers,
} from "./budapest2024Playthrough";

const runs = Number(process.env.BUDAPEST_SIM_RUNS ?? 300);

describe.skipIf(!process.env.BUDAPEST_SIM)(
  "Budapest 2024 simulation, Szentkirályi side",
  () => {
    it("prints the balance table", () => {
      const { play, strategies } = createBudapestCampaign(SZENTKIRALYI_SIDE);
      const sum = (pick: Parameters<typeof summarize>[1], n = runs) =>
        summarize(play, pick, n, SZENTKIRALYI);
      const rows = {
        random: sum((run) => seeded(run + 1)),
        ...Object.fromEntries(
          strategies.map((strategy) => [
            strategy.id,
            sum((run) => withFixedAnswers(strategyAnswers(strategy), run + 1)),
          ]),
        ),
        greedy: sum(() => szentkiralyiGreedy, 1),
        worst: sum(() => szentkiralyiWorst, 1),
      };

      const percent = (value: number) => `${(value * 100).toFixed(1)}`;
      const lines = [
        "play               Sz wins  Sz-V pts  after 25 (V / K / Sz)",
        ...Object.entries(rows).map(
          ([name, s]) =>
            `${name.padEnd(18)} ${percent(s.wins).padStart(7)} ${percent(s.margin).padStart(9)}  ${percent(s.before.vitezy)} / ${percent(s.before.karacsony)} / ${percent(s.before.szentkiralyi)}`,
        ),
      ];
      process.stdout.write(`\n${lines.join("\n")}\n`);
      if (process.env.BUDAPEST_SIM_OUT) {
        writeFileSync(
          process.env.BUDAPEST_SIM_OUT,
          JSON.stringify(rows, null, 2),
        );
      }
    }, 600000);
  },
);
