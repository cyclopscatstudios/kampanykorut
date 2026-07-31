import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import { AssetService } from "../logic/application/AssetService";

export function useAssets() {
  const electionConfigEngine = container.resolve(ConfigEngine);
  const campaignStateEngine = container.resolve(StateEngine);
  const campaignState = campaignStateEngine.getCampaignState();
  const gameConfig = electionConfigEngine.getCurrentElectionConfig();

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

  const candidate = gameConfig.electionAssets
    .find((asset) => asset.id === partyId)
    ?.candidateAssets.find((ca) => ca.id === candidateId);

  return {
    portrait: getAsset(candidate?.portrait) ?? "",
    slogan: getAsset(candidate?.slogan) ?? "",
    party_logo:
      getAsset(
        gameConfig.electionAssets.find((asset) => asset.id === partyId)
          ?.party_logo,
      ) ?? "",
  };
}

function getAsset(path?: string) {
  const assetService = container.resolve(AssetService);

  if (!path) {
    return null;
  }

  return assetService.getAssetUrl(path);
}
