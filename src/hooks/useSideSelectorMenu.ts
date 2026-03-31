import { useState } from "react";
import { container } from "tsyringe";
import { gameModeRegistry } from "../logic/application/gameModeRegistery";
import { GameConfigEngine } from "../logic/application/GameConfigEngine";
import { StorageEngine } from "../logic/application/StorageEngine";
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
  // TODO: refactor this to a more elegant solution, maybe with a context or something, to avoid this weird state handling
  const [registeredGameId, setRegisteredGameId] = useState<string | undefined>(undefined);

  if (gameId !== registeredGameId) {
    setRegisteredGameId(gameId);

    if (gameId) {
      const config = gameModeRegistry[gameId];

      if (config) {
        const engine = new GameConfigEngine(
          new StorageEngine(),
          config.electionConfig,
        );

        container.registerInstance(GameConfigEngine, engine);
      }
    }
  }

  const [selectedParty, setSelectedParty] = useState<Party | undefined>();
  const [selectedCandidate, setSelectedCandidate] = useState<
    string | undefined
  >();
  const { gameConfig } = useGameConfigEngine();
  const { transition } = useAppStateMachine();

  const handlePartyChange = (partyId: string) => {
    const party = gameConfig.playableSides.find((s) => s.id === partyId);
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
    sides: gameConfig.playableSides,
    selectedParty,
    selectedCandidate,
    setSelectedCandidate,
    handlePartyChange,
    goBack,
    startGame,
    candidateOptions,
  };
}
