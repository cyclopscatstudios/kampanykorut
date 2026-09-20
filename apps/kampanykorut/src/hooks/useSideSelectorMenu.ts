import { useState } from "react";
import { container } from "tsyringe";
import { createLogger } from "@/shared/logger";
import { Candidate, PlayableSide } from "@/shared/types";
import { ConfigEngine } from "../logic/application/ConfigEngine";
import { useStateEngine } from "../logic/application/hooks";
import { AnalyticsEvent, track } from "../logic/infra/posthog/track";
import { useNavigation } from "./navigationHook";

const log = createLogger("useSideSelectorMenu");

export function useSideSelectorMenu(id: string) {
  const [selectedParty, setSelectedParty] = useState<
    PlayableSide | undefined
  >();
  const [selectedCandidate, setSelectedCandidate] = useState<
    Candidate | undefined
  >();
  const { saveSession } = useStateEngine();
  const { goBack, goToCampaign } = useNavigation();
  const { sessionId } = useStateEngine();
  const campaignConfig = container.resolve(ConfigEngine).getCampaignConfig(id);

  const handlePartyChange = (partyId: string) => {
    const party = campaignConfig.electionConfig.playableSides.find(
      (s) => s.id === partyId,
    );
    if (!party) {
      log.error("party was not found");
      return;
    }
    setSelectedParty(party);
    saveSession("campaignState", { playerSide: { partyId: party?.id } });
    setSelectedCandidate(undefined);
  };

  const handleCandidateChange = (candidateId: string) => {
    const candidate = selectedParty?.mainCandidates.find(
      (ca) => ca.id === candidateId,
    );
    if (!candidate) {
      log.error("candidate was not found");
      return;
    }
    setSelectedCandidate(candidate);
    saveSession("campaignState", {
      playerSide: { partyId: selectedParty?.id, candidateId },
    });
  };

  const startGame = (id: string) => {
    goToCampaign(id, sessionId);
    track(AnalyticsEvent.CAMPAIGN_STARTED, {
      campaignId: id,
      sessionId,
      partyId: selectedParty?.id,
      candidateId: selectedCandidate?.id,
    });
  };

  const candidateOptions =
    selectedParty?.mainCandidates
      .filter((c) => selectedParty.playableCandidates?.includes(c.id))
      .map((c) => ({
        label: c.label,
        value: c.id,
      })) ?? [];

  const playableSides =
    campaignConfig.electionConfig.playableSides.map((side) => ({
      label: side.label,
      value: side.id,
    })) ?? [];

  const partyAssets = campaignConfig.electionConfig.electionAssets.find(
    (asset) => asset.id === selectedParty?.id,
  );

  const assets = {
    partyAssets,
    candidateAsset: partyAssets?.candidateAssets.find(
      (asset) => asset.id === selectedCandidate?.id,
    ),
  };

  return {
    campaignConfig,
    playableSides,
    candidateOptions,
    selectedParty,
    selectedCandidate,
    assets,
    setSelectedCandidate,
    handlePartyChange,
    handleCandidateChange,
    startGame,
    goBack,
  };
}
