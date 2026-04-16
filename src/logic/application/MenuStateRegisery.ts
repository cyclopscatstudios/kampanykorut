import type { MenuItemType, MenuState, MenuType } from "./MenuStateMachine";

export const MenuStateRegistry: Record<
  Exclude<MenuItemType, "back" | "gameLoader">,
  MenuState & { onTransition: MenuType }
> = {
  mainMenu: {
    screenType: "menuScreen",
    menuType: "mainMenu",
    onTransition: "mainMenu",
  },
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
    onTransition: "settingsMenu",
  },
  modMaker: {
    screenType: "gameScreen",
    menuType: "mainMenu",
    onTransition: "mainMenu",
  },
  about: {
    screenType: "gameScreen",
    menuType: "mainMenu",
    onTransition: "mainMenu",
  },
  loadGame: {
    screenType: "gameScreen",
    menuType: "mainMenu",
    onTransition: "mainMenu",
  },
  sideSelector: {
    screenType: "gameScreen",
    menuType: "gameLoaderMenu",
    onTransition: "sideSelectorMenu",
  },
};

export const gameMenuRegistery = ["mainMenu", "gameMenu", "gameLoaderMenu"];
