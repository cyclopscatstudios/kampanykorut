import { StateEngine } from "@logic/application";
import type { CampaignHeader } from "@logic/application/hooks/useGetCampaigns";
import { loadCampaignConfig } from "@logic/application/loadCampaignConfig";
import { getRunProperties } from "@logic/infra/posthog/events";
import { track } from "@logic/infra/posthog/track";
import type { CampaignState } from "@shared/types";
import { useEffect, useRef } from "react";
import { container } from "tsyringe";
import { useNavigation } from "./navigationHook";
import { pickRandomCampaign, pickRandomSide } from "./randomStart";

export function useQuickStart(campaigns: CampaignHeader[]) {
  const { goToCampaign, goToCampaignSelector } = useNavigation();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return async () => {
    const campaignId = pickRandomCampaign(campaigns);
    const config = campaignId
      ? await loadCampaignConfig(campaignId).catch(() => undefined)
      : undefined;
    if (!mounted.current) return;
    const side =
      config && pickRandomSide(config.electionConfig.playableSides ?? []);
    if (!campaignId || !side) {
      goToCampaignSelector();
      return;
    }
    const stateEngine = container.resolve(StateEngine);
    stateEngine.startNewSession();
    stateEngine.saveState("campaignState", {
      activeCampaignId: campaignId,
      playerSide: side,
    } as CampaignState);
    const sessionId = stateEngine.getSessionId();
    track(
      "campaign_start_clicked",
      getRunProperties(sessionId, campaignId, side),
    );
    goToCampaign(campaignId, sessionId);
  };
}
