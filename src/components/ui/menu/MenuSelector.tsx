import { MainMenu } from "./MainMenu";
import { NewGameMenu } from "./NewGameMenu";
import type { ScreenType } from "../../../App";
import type { MenuItem } from "./menu.types";
import { GameLoaderMenu } from "./GameLoaderMenu";
import { useAppStateMachine } from "../../../logic/application/hooks/useAppStateMachine";
import type { MenuType } from "../../../logic/application/AppStateMachine";

enum NewGameMenuItems {
  ClassicMode = "classicMode",
  CampaignMode = "campaignMode",
}

export type MenuItems = MenuType | NewGameMenuItems;

export function MenuSelector({
  setCurrentScreen,
  setActiveGameId,
}: {
  setCurrentScreen: (screen: ScreenType) => void;
  setActiveGameId: (gameId?: string) => void;
}) {
  const { state, transition } = useAppStateMachine();

  const handleOnClick = (to: MenuItem) => {
    transition(to);
    if (to.id === "gameLoader") {
      setCurrentScreen("MapCreator");
      setActiveGameId(to.gameId);
    }
  };

  return (
    <>
      {state.menuType === "mainMenu" && <MainMenu onClick={handleOnClick} />}
      {state.menuType === "gameMenu" && <NewGameMenu onClick={handleOnClick} />}
      {state.menuType === "gameModeMenu" && (
        <GameLoaderMenu onClick={handleOnClick} />
      )}
    </>
  );
}
