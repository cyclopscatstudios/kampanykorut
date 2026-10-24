import { type LoaderFunctionArgs, redirect } from "react-router";
import { container } from "tsyringe";
import {
  ConfigEngine,
  loadCampaignConfig,
  StateEngine,
} from "../../logic/application";

export async function makerPreviewLoader({ params }: LoaderFunctionArgs) {
  const previewId = params.previewId;
  if (!previewId || !/^[0-9a-f-]{36}$/.test(previewId))
    throw new Error("Érvénytelen előnézeti azonosító.");
  const campaignId = `preview-${previewId}`;
  const config = await loadCampaignConfig(campaignId);
  container.resolve(ConfigEngine).configure(config, campaignId, true);
  const election = config.electionConfig;
  const side = election.playableSides[0];
  const candidateId =
    side?.playableCandidates?.[0] ?? side?.mainCandidates[0]?.id;
  if (!side || !candidateId)
    throw new Error("Az előnézetnek nincs játszható jelöltje.");
  const state = container.resolve(StateEngine);
  state.updateCampaignState({
    activeCampaignId: campaignId,
    playerSide: { partyId: side.id, candidateId },
  });
  return redirect(`/game/${campaignId}?sessionId=${state.getSessionId()}`);
}
