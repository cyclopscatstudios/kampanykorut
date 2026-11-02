import { writeFileSync } from "node:fs";
import { describe, it } from "vitest";
import {
  createBudapestCampaign,
  greedy,
  HISTORICAL_ANSWERS,
  seeded,
  strategyAnswers,
  summarize,
  weakThird,
  withFixedAnswers,
  worst,
} from "./budapest2024Playthrough";

const runs = Number(process.env.BUDAPEST_SIM_RUNS ?? 300);

describe.skipIf(!process.env.BUDAPEST_SIM)("Budapest 2024 simulation", () => {
  it("prints the balance table", () => {
    const { play, strategies } = createBudapestCampaign();
    const rows = {
      random: summarize(play, (run) => seeded(run + 1), runs),
      historical: summarize(
        play,
        (run) => withFixedAnswers(HISTORICAL_ANSWERS, run + 1),
        runs,
      ),
      ...Object.fromEntries(
        strategies.map((strategy) => [
          strategy.id,
          summarize(
            play,
            (run) => withFixedAnswers(strategyAnswers(strategy), run + 1),
            runs,
          ),
        ]),
      ),
      greedy: summarize(play, () => greedy, 1),
      worst: summarize(play, () => worst, 1),
      weakThird: summarize(play, () => weakThird, 1),
    };

    const percent = (value: number) => `${(value * 100).toFixed(1)}`;
    const lines = [
      "play               withdrew  V wins  V-K pts  after 25 (V / K / Sz)",
      ...Object.entries(rows).map(
        ([name, s]) =>
          `${name.padEnd(18)} ${percent(s.withdrawals).padStart(8)} ${percent(s.wins).padStart(7)} ${percent(s.margin).padStart(8)}  ${percent(s.before.vitezy)} / ${percent(s.before.karacsony)} / ${percent(s.before.szentkiralyi)}`,
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
});
