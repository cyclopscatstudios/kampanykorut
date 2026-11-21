import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { format } from "prettier";
import { describe, expect, it } from "vitest";
import {
  describeGovernments,
  improveLine,
  isWinning,
  loadSide,
  renderWinningPaths,
  winningPathsDir,
  type WinningPathsFile,
} from "./winningPaths";

const update = Boolean(process.env.UPDATE_WINNING_PATHS);

const files = readdirSync(winningPathsDir)
  .filter((f) => f.endsWith(".json"))
  .map((name) => ({ name, file: join(winningPathsDir, name) }));

describe.each(files)("winning paths $name", ({ file }) => {
  const fixture: WinningPathsFile = JSON.parse(readFileSync(file, "utf8"));
  const summary = file.replace(/\.json$/, ".md");

  const renderSummary = () =>
    format(renderWinningPaths(fixture), { parser: "markdown" });

  it.skipIf(update)("matches its summary", async () => {
    expect(readFileSync(summary, "utf8")).toBe(await renderSummary());
  });
  const sides = [...new Set(fixture.lines.map((l) => l.side))];

  describe.each(sides)("%s", (sideId) => {
    const lines = fixture.lines.filter((l) => l.side === sideId);

    it.skipIf(update).each(lines)(
      "$name",
      (line) => {
        const side = loadSide(fixture.campaign, sideId);
        const result = side.playLine(line);

        expect(result.missingAnswers).toEqual([]);
        expect(result.focuses).toEqual(
          line.focuses.map((id) => ({ id, status: "completed" })),
        );
        expect(describeGovernments(result.governments)).toEqual(
          describeGovernments(line.governments),
        );
      },
      60000,
    );

    it.runIf(update)(
      "refreshes the fixture",
      async () => {
        const side = loadSide(fixture.campaign, sideId);
        const lost: string[] = [];
        for (const line of lines) {
          const current = side.playLine(line);
          const result = isWinning(current, line.focuses)
            ? current
            : improveLine(side, line.focuses, line.answers);
          if (!isWinning(result, line.focuses)) {
            lost.push(line.name);
            continue;
          }
          line.answers = result.answers;
          line.governments = result.governments;
        }
        writeFileSync(
          file,
          await format(JSON.stringify(fixture), { parser: "json" }),
        );
        writeFileSync(summary, await renderSummary());
        expect(lost).toEqual([]);
      },
      3600000,
    );
  });
});
