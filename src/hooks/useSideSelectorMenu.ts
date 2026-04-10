import { useState } from "react";
import { useGameConfigEngine } from "../logic/application/hooks/useGameConfigEngine";
import { useAppStateMachine } from "../logic/application/hooks/useAppStateMachine";
import { MenuItemId, type MenuItem } from "../components/ui/menu/menu.types";
import type { PlayerSide } from "../logic/types/campaignEngine.types";

type Party = {
  id: string;
  name: string;
  mainCandidates: {
    id: string;
    label: string;
  }[];
};

export function useSideSelectorMenu(
  gameId: string | undefined,
  onClick: (item: MenuItem) => void,
) {
  const [selectedParty, setSelectedParty] = useState<Party | undefined>();
  const [selectedCandidate, setSelectedCandidate] = useState<
    string | undefined
  >();
  const { gameConfig, updateGameConfig } = useGameConfigEngine();
  const { transition } = useAppStateMachine();

  const handlePartyChange = (partyId: string) => {
    const party = gameConfig?.playableSides.find((s) => s.id === partyId);
    setSelectedParty(party);
    const playerSide: PlayerSide = {
      partyId: partyId,
    };
    updateGameConfig({ playerSide });
    setSelectedCandidate(undefined);
  };

  const handleCandidateChange = (partyId: string, candidateId: string) => {
    setSelectedCandidate(candidateId);
    updateGameConfig({ playerSide: { partyId, candidateId } });
  };

  const goBack = () => {
    transition({ id: MenuItemId.Back, text: "Back" });
  };

  const startGame = () => {
    onClick({
      gameId,
      onTransition: "gameLoader",
      id: MenuItemId.GameLoader,
      text: "Start Game",
    });
  };

  const candidateOptions =
    selectedParty?.mainCandidates.map((c) => ({
      label: c.label,
      value: c.id,
    })) ?? [];

  return {
    gameConfig,
    sides: gameConfig?.playableSides ?? [],
    selectedParty,
    selectedCandidate,
    setSelectedCandidate,
    handlePartyChange,
    handleCandidateChange,
    goBack,
    startGame,
    candidateOptions,
  };
}
