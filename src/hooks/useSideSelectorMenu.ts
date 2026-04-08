import { useState } from "react";
import { useGameConfigEngine } from "../logic/application/hooks/useGameConfigEngine";
import { useAppStateMachine } from "../logic/application/hooks/useAppStateMachine";
import { MenuItemId, type MenuItem } from "../components/ui/menu/menu.types";

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
  const { gameConfig } = useGameConfigEngine();
  const { transition } = useAppStateMachine();

  const handlePartyChange = (partyId: string) => {
    const party = gameConfig?.playableSides.find((s) => s.id === partyId);
    setSelectedParty(party);
    setSelectedCandidate(undefined);
  };

  const goBack = () => {
    transition({ id: MenuItemId.Back, text: "Back" });
  };

  const startGame = () => {
    onClick({
      gameId,
      onTransition: "gameLoader",
      id: MenuItemId.GameLoader,
      text: "2022 OGYV",
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
    goBack,
    startGame,
    candidateOptions,
  };
}
