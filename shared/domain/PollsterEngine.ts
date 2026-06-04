import { injectable } from "tsyringe";
import { CampaignState, ElectionConfig } from "../types";
import { Pollster } from "../types/pollsters";
import { defaultPollsters as DEFAULT_POLLSTERS } from "./DefaultPollsters";
import { MandateCalculator } from "./MandateCalculator";
import { createLogger } from "@/shared/logger";

const log = createLogger("PollsterEngine");

@injectable()
export class PollsterEngine {
  private pollsters: Pollster[] = [];

  constructor(private mandateCalculator: MandateCalculator) {
    log.debug("PollsterEngine initialized");
  }

  configure(customPollsters?: Pollster[]) {
    if (customPollsters) {
      log.debug("Configuring PollsterEngine with custom pollsters", {
        customPollsters,
      });
      this.pollsters = [...DEFAULT_POLLSTERS, ...customPollsters];
    } else {
      this.pollsters = [...DEFAULT_POLLSTERS];
    }
  }

  getPolls(state: CampaignState, electionConfig: ElectionConfig) {
    const actualResults = this.mandateCalculator.calculate(
      state.candidateListData,
      state.partyListData,
      electionConfig,
    );

    const percentages = actualResults?.percentages;

    if (!percentages) {
      log.error("cannot get polls, missing actual results percentages");
      return;
    }

    const allResults = this.pollsters.map((pollster) =>
      this.applyMarginErrors(percentages, pollster),
    );

    const partyIds = Object.keys(percentages).filter((k) => k !== "_total");
    const averaged: Record<string, number> = {};

    for (const partyId of partyIds) {
      const sum = allResults.reduce((acc, r) => acc + (r[partyId] ?? 0), 0);
      averaged[partyId] = sum / allResults.length;
    }

    return this.normalizeResults(averaged);
  }

  getPollsByPollsterId(
    pollsterId: string,
    state: CampaignState,
    electionConfig: ElectionConfig,
  ) {
    const actualResults = this.mandateCalculator.calculate(
      state.candidateListData,
      state.partyListData,
      electionConfig,
    );
    const pollster = this.pollsters.find((p) => p.id === pollsterId);
    if (!pollster) {
      log.error("Pollster not found for id", { pollsterId });
      return;
    }
    const percentages = actualResults?.percentages;
    if (!percentages) {
      log.error("cannot get polls, missing actual results percentages");
      return;
    }
    return this.normalizeResults(this.applyMarginErrors(percentages, pollster));
  }

  private normalizeResults(
    results: Record<string, number>,
  ): Record<string, number> {
    const normalized = { ...results };
    const total = Object.values(normalized).reduce((sum, v) => sum + v, 0);
    if (total > 0) {
      for (const partyId in normalized) {
        normalized[partyId] /= total;
      }
    }
    normalized._total = Object.entries(normalized)
      .filter(([key]) => key !== "_total")
      .reduce((sum, [, v]) => sum + v, 0);
    return normalized;
  }

  private getBiasResults(pollster: Pollster) {
    return pollster.bias?.find((b) => b.type === "result")?.partyBias ?? {};
  }

  private applyMarginErrors(
    percentages: Record<string, number>,
    pollster: Pollster,
  ) {
    const bias = this.getBiasResults(pollster);
    const globalError =
      this.getRandomMargin(
        -pollster.errorMargin.max,
        pollster.errorMargin.max,
      ) / 100;
    const results: Record<string, number> = {};

    for (const partyId in percentages) {
      if (partyId === "_total") {
        continue;
      }

      const actual = percentages[partyId];
      const biasPoints = (bias[partyId] ?? 0) / 100;

      const localNoise =
        this.getRandomMargin(
          -pollster.errorMargin.max / 4,
          pollster.errorMargin.max / 4,
        ) / 100;

      let value = actual;

      value += biasPoints;
      value *= 1 + globalError;
      value *= 1 + localNoise;

      results[partyId] = Math.max(0, value);
    }

    return results;
  }

  private getRandomMargin(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
}
