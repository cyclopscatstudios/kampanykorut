import type { IconSource } from "../../components/ui/Icon";

export type MainMenuType = "newGame" | "modMaker" | "settings";
export type NewGameMenu = "classicMode" | "campaignMode";
export type MenuItems = "mainMenu" | "newGameMenu" | "classicGameMenu";
export type MenuType =
  | MainMenuType
  | NewGameMenu
  | "gameLoaderMenu"
  | "back"
  | "mainMenu"
  | "newGameMenu";

export type MenuItem = {
  id: MenuType;
  text: string;
  icon?: string;
  iconSource?: IconSource;
  description?: string;
  [key: string]: any;
};

export class MenuEngine {
  private menuHistory: MenuType[] = [];

  constructor(currentMenu: MenuType) {
    this.menuHistory = [currentMenu];
    this.chanegMenu = this.chanegMenu.bind(this);
  }

  getCurrentMenu() {
    return this.menuHistory[this.menuHistory.length - 1];
  }

  chanegMenu(menuItem: MenuItem): MenuItems {
    let nextMenu: MenuItems = "mainMenu";

    switch (menuItem.id) {
      case "newGame":
        this.setHistoryItem(menuItem.id);
        nextMenu = "newGameMenu";
        break;

      case "classicMode":
        this.setHistoryItem(menuItem.id);
        nextMenu = "classicGameMenu";
        break;

      case "campaignMode":
        nextMenu = "newGameMenu";
        break;

      case "back":
        this.goBack();
        nextMenu = this.getCurrentMenu() as MenuItems;
        break;

      default:
        nextMenu = "mainMenu";
    }

    return nextMenu;
  }

  goBack() {
    if (this.menuHistory.length > 1) {
      this.menuHistory = this.menuHistory.slice(0, -1);
    }
  }

  private setHistoryItem(item: MenuType) {
    this.menuHistory = [...this.menuHistory, item];
  }
}
