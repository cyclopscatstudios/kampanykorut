import { useState } from "react";
import { useGameConfigEngine } from "../logic/application/hooks/useGameConfigEngine";
import type {
  ElectionConfig,
  PlayerSide,
} from "../logic/types/campaignEngine.types";
import { useNavigation } from "./navigationHook";
import { useStateEngine } from "../logic/application/hooks";

type Party = {
  id: string;
  name: string;
  mainCandidates: {
    id: string;
    label: string;
  }[];
};

export function useSideSelectorMenu(electionConfig: ElectionConfig) {
  const [selectedParty, setSelectedParty] = useState<Party | undefined>();
  const [selectedCandidate, setSelectedCandidate] = useState<
    string | undefined
  >();
  const { updateCampaignState } = useGameConfigEngine();
  const { goBack, goToCampaign } = useNavigation();
  const { sessionId } = useStateEngine();

  const handlePartyChange = (partyId: string) => {
    const party = electionConfig.playableSides.find((s) => s.id === partyId);
    setSelectedParty(party);
    const playerSide: PlayerSide = {
      partyId: partyId,
    };
    updateCampaignState({ playerSide });
    setSelectedCandidate(undefined);
  };

  const handleCandidateChange = (partyId: string, candidateId: string) => {
    setSelectedCandidate(candidateId);
    updateCampaignState({ playerSide: { partyId, candidateId } });
  };

  const startGame = (id: string) => {
    goToCampaign(id, sessionId);
  };

  const candidateOptions =
    selectedParty?.mainCandidates.map((c) => ({
      label: c.label,
      value: c.id,
    })) ?? [];

  return {
    gameConfig: electionConfig,
    sides: electionConfig?.playableSides ?? [],
    selectedParty,
    selectedCandidate,
    setSelectedCandidate,
    handlePartyChange,
    handleCandidateChange,
    startGame,
    candidateOptions,
    goBack,
  };
}
