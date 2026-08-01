import { singleton } from "tsyringe";
import {
  CampaignConfig,
  CampaignState,
  ElectionConfig,
  StrategyReward,
} from "@/shared/types";
import { createLogger } from "@/shared/logger/logger";
import { Emitter } from "./Emitter";
import { HistoryItem, StateHandler } from "./StateHandler";
import { StorageEngine } from "./StorageEngine";

const log = createLogger("ConfigEngine");

@singleton()
export class ConfigEngine extends Emitter<CampaignConfig> {
  private configured = false;

  constructor(
    private storage: StorageEngine,
    private stateHandler: StateHandler,
  ) {
    log.debug("ElectionConfigEngine initialized");
    super();
    this.storage.setItem = this.storage.setItem.bind(this);
  }

  configure(
    campaignConfig: CampaignConfig | null,
    id?: string,
    forced = false,
  ): void {
    if (this.configured && !forced) {
      log.debug("ConfigEngine is already configured, skipping reconfiguration");
      return;
    }
    log.debug("Configuring game with campaign config", { campaignConfig });
    this.setCampaignConfig(campaignConfig, id);
  }

  getCurrentElectionConfig() {
    const electionConfig =
      this.stateHandler.get("campaignConfig")?.electionConfig;
    if (electionConfig) {
      return electionConfig;
    }
    const sessionId = this.storage.getItem("currentSessionId", "localStorage");
    const state = this.storage.getItem(
      "campaignState",
      "localStorage",
      sessionId ?? "",
    );
    const parsedState: CampaignState | null = state ? JSON.parse(state) : null;
    if (!parsedState?.activeCampaignId) {
      log.error("no saved campaign id was found");
      return;
    }
    const storedConfig = this.storage.getItem(
      "campaignConfig",
      "localStorage",
      parsedState.activeCampaignId,
    );
    return storedConfig ? (JSON.parse(storedConfig) as ElectionConfig) : null;
  }

  getCampaignConfig(id?: string): CampaignConfig {
    const inMemory = this.stateHandler.get("campaignConfig");
    if (inMemory) {
      return inMemory;
    }
    const campaignId = id ?? this.getActiveCampaignId() ?? "";
    const stored = this.storage.getItem(
      "campaignConfig",
      "localStorage",
      campaignId,
    );
    return (stored ? JSON.parse(stored) : null) as CampaignConfig;
  }

  getCampaignStrategies(
    state: CampaignState,
    config: CampaignConfig,
    history: HistoryItem[],
  ) {
    const sideStrategies =
      state.playerSide?.partyId && state.playerSide?.candidateId
        ? config.playableSides?.[state.playerSide.partyId]?.[
            state.playerSide.candidateId
          ]?.campaignStrategies
        : undefined;
    const strategies = sideStrategies?.filter(
      (s) =>
        s.target.party === state.playerSide?.partyId &&
        s.target.candidate === state.playerSide?.candidateId,
    );
    return strategies?.map((strategy) => {
      const matchCount = strategy.conditions.filter((condition) =>
        history.some(
          (h) =>
            h.questionId === condition.questionId &&
            h.answerId === condition.answerId,
        ),
      ).length;
      const reward = strategy.rewards
        .filter((r) => matchCount >= r.minMatches)
        .reduce<
          StrategyReward | undefined
        >((best, current) => (!best || current.minMatches > best.minMatches ? current : best), undefined);
      return {
        ...strategy,
        isCompleted: !!reward,
      };
    });
  }

  private getActiveCampaignId() {
    const sessionId = this.storage.getItem("currentSessionId", "localStorage");
    const state = this.storage.getItem(
      "campaignState",
      "localStorage",
      sessionId ?? "",
    );
    const parsedState: CampaignState = state ? JSON.parse(state) : null;
    if (!parsedState) {
      log.error("state was not found");
      return;
    }
    return parsedState.activeCampaignId;
  }

  private setCampaignConfig(config: CampaignConfig | null, id?: string) {
    this.stateHandler.set("campaignConfig", config);
    if (!id) {
      log.debug("Clearing campaign config");
      return this.storage.clearItem("campaignConfig", "localStorage");
    }
    const value = JSON.stringify(config);
    this.storage.setItem("campaignConfig", value, "localStorage", id);
    this.configured = true;
  }
}
