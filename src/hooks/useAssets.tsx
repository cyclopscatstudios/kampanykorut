import { StateEngine, ConfigEngine } from "@/logic/application";
import { container } from "tsyringe";
import { AssetService } from "../logic/application/AssetService";

export function useAssets() {
  const electionConfigEngine = container.resolve(ConfigEngine);
  const campaignStateEngine = container.resolve(StateEngine);
  const campaignState = campaignStateEngine.getCampaignState();
  const gameConfig = electionConfigEngine.getCurrentElectionConfig();
  console.log({ campaignState, gameConfig });
  if (!gameConfig || !campaignState) {
    return {
      portrait: "",
      slogan: "",
      party_logo: "",
    };
  }
  const partyId = campaignState?.playerSide?.partyId;
  const candidateId = campaignState?.playerSide?.candidateId;
  if (!partyId || !candidateId) {
    return {
      portrait: "",
      slogan: "",
      party_logo: "",
    };
  }

  return {
    portrait:
      getAsset(gameConfig.electionAssets?.[partyId]?.portrait?.[candidateId]) ??
      "",
    slogan:
      getAsset(gameConfig.electionAssets?.[partyId]?.slogan?.[candidateId]) ??
      "",
    party_logo:
      getAsset(gameConfig.electionAssets?.[partyId]?.party_logo) ?? "",
  };
}

function getAsset(path?: string) {
  const assetService = container.resolve(AssetService);

  if (!path) {
    return null;
  }

  return assetService.getAssetUrl(path);
}
