import {
  ElectionConfig,
  ElectionType,
  MayoralElectionConfig,
  ParliamentaryElectionConfig,
  PlayerSide,
} from "../types";

export function getElectionType(
  config?: Pick<ElectionConfig, "election">,
): ElectionType {
  return config?.election?.type ?? "parliamentary";
}

export function isMayoralElection(
  config: ElectionConfig,
): config is MayoralElectionConfig {
  return getElectionType(config) === "mayoral";
}

export function getParliamentaryConfig(
  config?: ElectionConfig,
): ParliamentaryElectionConfig | undefined {
  return config && !isMayoralElection(config) ? config : undefined;
}

export function getPlayerVoteKey(
  config: ElectionConfig | undefined,
  playerSide: PlayerSide | undefined,
): string | undefined {
  if (config && isMayoralElection(config)) {
    return playerSide?.candidateId;
  }
  return playerSide?.partyId;
}
