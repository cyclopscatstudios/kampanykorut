import { ConfigEngine } from "@logic/application/ConfigEngine";
import { useStateEngine } from "@logic/application/hooks";
import { getRunProperties } from "@logic/infra/posthog/events";
import { track } from "@logic/infra/posthog/track";
import { createLogger } from "@shared/logger";
import { Candidate, PlayableSide } from "@shared/types";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { container } from "tsyringe";
import { useNavigation } from "./navigationHook";

const log = createLogger("useSideSelectorMenu");

function resolveSide(
  playableSides: PlayableSide[],
  partyId: string | null,
): { party: PlayableSide; candidate?: Candidate } | undefined {
  const party = playableSides.find((s) => s.id === partyId);
  if (!party) return undefined;
  const playableCandidates = party.mainCandidates.filter((c) =>
    party.playableCandidates?.includes(c.id),
  );
  return {
    party,
    candidate:
      playableCandidates.length === 1 ? playableCandidates[0] : undefined,
  };
}

export function useSideSelectorMenu(id: string) {
  const campaignConfig = container.resolve(ConfigEngine).getCampaignConfig(id);
  const [searchParams] = useSearchParams();
  const [preset] = useState(() =>
    resolveSide(
      campaignConfig.electionConfig.playableSides,
      searchParams.get("side"),
    ),
  );
  const [selectedParty, setSelectedParty] = useState<PlayableSide | undefined>(
    preset?.party,
  );
  const [selectedCandidate, setSelectedCandidate] = useState<
    Candidate | undefined
  >(preset?.candidate);
  const { saveSession } = useStateEngine();
  const { goBack, goToCampaign } = useNavigation();
  const { sessionId } = useStateEngine();

  const saveSide = (partyId?: string, candidateId?: string) =>
    saveSession("campaignState", { playerSide: { partyId, candidateId } });

  useEffect(() => {
    if (preset) saveSide(preset.party.id, preset.candidate?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  const handlePartyChange = (partyId: string) => {
    const side = resolveSide(
      campaignConfig.electionConfig.playableSides,
      partyId,
    );
    if (!side) {
      log.error("party was not found", { campaignId: id, partyId });
      return;
    }
    setSelectedParty(side.party);
    setSelectedCandidate(side.candidate);
    saveSide(side.party.id, side.candidate?.id);
  };

  const handleCandidateChange = (candidateId: string) => {
    const candidate = selectedParty?.mainCandidates.find(
      (ca) => ca.id === candidateId,
    );
    if (!candidate) {
      log.error("candidate was not found", {
        campaignId: id,
        partyId: selectedParty?.id,
        candidateId,
      });
      return;
    }
    setSelectedCandidate(candidate);
    saveSide(selectedParty?.id, candidateId);
  };

  const startGame = (id: string) => {
    if (!selectedParty || !selectedCandidate) {
      log.warn("Starting game without complete side selection", {
        campaignId: id,
        sessionId,
        partyId: selectedParty?.id,
        candidateId: selectedCandidate?.id,
      });
    }
    log.info("Starting game", {
      campaignId: id,
      sessionId,
      partyId: selectedParty?.id,
      candidateId: selectedCandidate?.id,
    });
    track(
      "campaign_start_clicked",
      getRunProperties(sessionId, id, {
        partyId: selectedParty?.id,
        candidateId: selectedCandidate?.id,
      }),
    );
    goToCampaign(id, sessionId);
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
