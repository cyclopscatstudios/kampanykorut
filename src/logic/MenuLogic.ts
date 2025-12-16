export enum MenuType {
  MainMenu = "mainMenu",
  NewGameMenu = "newGameMenu",
}

class MenuLogic {
  private menuHistory: MenuType[] = [];

  constructor() {
    this.menuHistory = [MenuType.MainMenu];
  }

  public setHistoryItem(item: MenuType) {
    this.menuHistory = [...this.menuHistory, item];
  }

  public setHistory(items: MenuType[]) {
    this.menuHistory = items;
  }

  public getHistory() {
    return this.menuHistory;
  }
}

export const menuLogic = new MenuLogic();
