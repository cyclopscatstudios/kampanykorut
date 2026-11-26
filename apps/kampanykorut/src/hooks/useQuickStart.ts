import { StateEngine } from "@logic/application";
import { getRunProperties } from "@logic/infra/posthog/events";
import { track } from "@logic/infra/posthog/track";
import type { CampaignState } from "@shared/types";
import { container } from "tsyringe";
import { useNavigation } from "./navigationHook";

export const QUICK_START = {
  campaignId: "2026_tavaszi_szel",
  partyId: "tisza",
  candidateId: "magyar_peter",
} as const;

export function useQuickStart() {
  const { goToCampaign } = useNavigation();

  return () => {
    const { campaignId, partyId, candidateId } = QUICK_START;
    const stateEngine = container.resolve(StateEngine);
    stateEngine.startNewSession();
    stateEngine.saveState("campaignState", {
      activeCampaignId: campaignId,
      playerSide: { partyId, candidateId },
    } as CampaignState);
    const sessionId = stateEngine.getSessionId();
    track(
      "campaign_start_clicked",
      getRunProperties(sessionId, campaignId, { partyId, candidateId }),
    );
    goToCampaign(campaignId, sessionId);
  };
}
