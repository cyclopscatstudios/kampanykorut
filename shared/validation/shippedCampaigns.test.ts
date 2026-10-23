import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CampaignHeaderInput,
  CampaignSource,
  formatDiagnostic,
  validateCampaign,
} from "./campaignValidator";

const publicDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../apps/kampanykorut/public",
);

const source: CampaignSource = {
  readCampaignFile(route, relativePath) {
    const file = join(publicDir, "campaigns", route, relativePath);
    if (!existsSync(file)) {
      return { ok: false, reason: "missing" };
    }
    try {
      return { ok: true, data: JSON.parse(readFileSync(file, "utf8")) };
    } catch (error) {
      return {
        ok: false,
        reason: "invalid-json",
        message: (error as Error).message,
      };
    }
  },
  publicFileExists(publicPath) {
    return existsSync(join(publicDir, publicPath));
  },
};

const headers: CampaignHeaderInput[] = JSON.parse(
  readFileSync(join(publicDir, "assets/jsons/game_modes.json"), "utf8"),
);

const acceptedWarnings = [
  "WARNING [strategy-unreachable] 2022_beke_vs_remeny: ellenzeki_osszefogas/marki_zay_peter/2022_campaign_strategies.json /1/rewards/0/minMatches - needs 6 matches but the strategy has only 0 conditions",
];

describe.each(headers)("campaign $id", (header) => {
  const diagnostics = validateCampaign(header, source).map((d) => ({
    ...d,
    text: formatDiagnostic(header.id, d),
  }));

  it("has no validation errors", () => {
    expect(
      diagnostics.filter((d) => d.severity === "error").map((d) => d.text),
    ).toEqual([]);
  });

  it("has no unaccepted warnings", () => {
    expect(
      diagnostics
        .filter((d) => d.severity === "warning")
        .map((d) => d.text)
        .filter((text) => !acceptedWarnings.includes(text)),
    ).toEqual([]);
  });
});
