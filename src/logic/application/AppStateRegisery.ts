import type { MenuItemType, MenuState, MenuType } from "./AppStateMachine";

export const AppStateRegistry: Record<
  Exclude<MenuItemType, "back" | "gameLoader">,
  MenuState & { onTransition: MenuType }
> = {
  newGame: {
    screenType: "menuScreen",
    menuType: "mainMenu",
    onTransition: "gameMenu",
  },
  classicMode: {
    screenType: "menuScreen",
    menuType: "gameMenu",
    onTransition: "gameModeMenu",
  },
  campaignMode: {
    screenType: "menuScreen",
    menuType: "gameMenu",
    onTransition: "mainMenu",
  },
  settings: {
    screenType: "menuScreen",
    menuType: "mainMenu",
    onTransition: "mainMenu",
  },
  modMaker: {
    screenType: "gameScreen",
    menuType: "mainMenu",
    onTransition: "mainMenu",
  },
};

export const gameMenuRegistery = ["mainMenu", "gameMenu", "gameLoaderMenu"];
