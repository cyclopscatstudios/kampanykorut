import { MainMenu } from "./MainMenu";
import { NewGameMenu } from "./NewGameMenu";
import type { MenuItem } from "./menu.types";
import { GameLoaderMenu } from "./GameLoaderMenu";
import { useAppStateMachine, type MenuType } from "@/logic/application";
import { SideSelectorMenu } from "./SideSelectorMenu";
import { SettingsMenu } from "./SettingsMenu";

enum NewGameMenuItems {
  ClassicMode = "classicMode",
  CampaignMode = "campaignMode",
}

export type MenuItems = MenuType | NewGameMenuItems;

export function MenuSelector() {
  const { state, transition } = useAppStateMachine();

  console.log({ state });

  const handleOnClick = (to: MenuItem) => {
    transition(to);
  };

  return (
    <>
      {state.menuType === "mainMenu" && <MainMenu onClick={handleOnClick} />}
      {state.menuType === "gameMenu" && <NewGameMenu onClick={handleOnClick} />}
      {state.menuType === "settingsMenu" && <SettingsMenu />}
      {state.menuType === "gameModeMenu" && (
        <GameLoaderMenu onClick={handleOnClick} />
      )}
      {state.menuType === "sideSelectorMenu" && (
        <SideSelectorMenu onClick={handleOnClick} />
      )}
    </>
  );
}
