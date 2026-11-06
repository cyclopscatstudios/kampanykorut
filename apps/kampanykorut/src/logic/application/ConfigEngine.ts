import { singleton } from "tsyringe";
import { createLogger } from "@/shared/logger/logger";
import { StorageEngine } from "@/shared/logic/application/StorageEngine";
import {
  CampaignConfig,
  CampaignState,
  DistrictMapType,
  DistrictPoligon,
  ElectionConfig,
  HistoryItem,
  StrategyReward,
} from "@/shared/types";
import { Emitter } from "./Emitter";
import { fetchJSON } from "./fetchJSON";
import type { SessionKey } from "./SessionKey";
import { StateHandler } from "./StateHandler";

const log = createLogger("ConfigEngine");

@singleton()
export class ConfigEngine extends Emitter<CampaignConfig> {
  private configured = false;

  constructor(
    private storage: StorageEngine<SessionKey>,
    private stateHandler: StateHandler,
  ) {
    log.debug("ElectionConfigEngine initialized");
    super();
    this.removeLegacyCachedConfigs();
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

  getCurrentElectionConfig(): ElectionConfig | undefined {
    const electionConfig =
      this.stateHandler.get("campaignConfig")?.electionConfig;
    if (!electionConfig) {
      log.debug("no campaign config is loaded");
    }
    return electionConfig;
  }

  getCampaignConfig(id?: string): CampaignConfig {
    const config = this.stateHandler.get("campaignConfig");
    if (!config) {
      log.error("no campaign config is loaded", { id });
    }
    return config as CampaignConfig;
  }

  getDistrictMapByType(
    districtMapType: DistrictMapType,
  ): Promise<DistrictPoligon[]> {
    const districtMapName = this.getDistrictMapNameByType(districtMapType);
    return fetchJSON<DistrictPoligon[]>("districtMap", districtMapName);
  }

  private getDistrictMapNameByType(districtMapType: DistrictMapType): string {
    switch (districtMapType) {
      case "2011":
        return "oevk_2011";
      case "2024":
        return "oevk_2024";
      case "budapest-districts":
        return "budapest_districts";
      default:
        log.error("Unknown district map type", { districtMapType });
        return "oevk_2011";
    }
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

  private setCampaignConfig(config: CampaignConfig | null, id?: string) {
    this.stateHandler.set("campaignConfig", config);
    if (!id) {
      log.debug("Clearing campaign config");
      return;
    }
    this.configured = true;
  }

  /**
   * Older versions cached the full (multi-MB) campaign config in localStorage
   * under `campaignConfig-<campaignId>`, which filled up the quota and made
   * saving the campaign state fail. The cache was never read back without a
   * fresh config being loaded first, so it is safe to drop.
   */
  private removeLegacyCachedConfigs() {
    try {
      const removed = this.storage.clearItemsWithPrefix("campaignConfig");
      if (removed.length) {
        log.debug("Removed legacy cached campaign configs", { removed });
      }
    } catch (error) {
      log.error("failed to remove legacy cached campaign configs", error);
    }
  }
}
