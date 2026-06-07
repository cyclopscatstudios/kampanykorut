import { injectable } from "tsyringe";
import { CampaignState, ElectionConfig } from "../types";
import { Pollster } from "../types/pollsters";
import { defaultPollsters as DEFAULT_POLLSTERS } from "./DefaultPollsters";
import { MandateCalculator } from "./MandateCalculator";
import { createLogger } from "@/shared/logger";

const log = createLogger("PollsterEngine");

export const AGGREGATE_POLLSTER_ID = "aggregate";

@injectable()
export class PollsterEngine {
  private pollsters: Pollster[] = [];

  constructor(private mandateCalculator: MandateCalculator) {
    log.debug("pollsterEngine initialized");
  }

  configure(customPollsters?: Pollster[]) {
    if (customPollsters) {
      log.debug("configuring PollsterEngine with custom pollsters", {
        customPollsters,
      });
      this.pollsters = [...DEFAULT_POLLSTERS, ...customPollsters];
    } else {
      this.pollsters = [...DEFAULT_POLLSTERS];
    }
  }

  getPollsters() {
    return this.pollsters;
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

    const partyIds = Object.keys(percentages).filter((k) => k !== "_total");
    const differences: Record<string, number> = {};

    for (const partyId of partyIds) {
      const pollsterDiffs = this.pollsters.map((pollster) => {
        const estimate = this.normalizeResults(
          this.applyMarginErrors(percentages, pollster),
        );
        return (estimate[partyId] ?? 0) - (percentages[partyId] ?? 0);
      });
      differences[partyId] =
        (pollsterDiffs.reduce((acc, d) => acc + d, 0) / pollsterDiffs.length) *
        100;
    }

    return differences;
  }

  getPollsByPollsterId(
    pollsterId: string,
    state: CampaignState,
    electionConfig: ElectionConfig,
  ) {
    if (pollsterId === AGGREGATE_POLLSTER_ID) {
      return this.getPolls(state, electionConfig);
    }
    const actualResults = this.mandateCalculator.calculate(
      state.candidateListData,
      state.partyListData,
      electionConfig,
    );
    const pollster = this.pollsters.find((p) => p.id === pollsterId);
    if (!pollster) {
      log.error("pollster not found for id", { pollsterId });
      return;
    }
    const percentages = actualResults?.percentages;
    if (!percentages) {
      log.error("cannot get polls, missing actual results percentages");
      return;
    }
    const pollEstimate = this.normalizeResults(
      this.applyMarginErrors(percentages, pollster),
    );
    const differences: Record<string, number> = {};
    for (const partyId in pollEstimate) {
      if (partyId === "_total") {
        continue;
      }
      differences[partyId] =
        (pollEstimate[partyId] - (percentages[partyId] ?? 0)) * 100;
    }
    return differences;
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
