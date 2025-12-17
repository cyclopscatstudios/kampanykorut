export enum MenuType {
  MainMenu = "mainMenu",
  NewGameMenu = "newGameMenu",
  ClassicMode = "classicMode",
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

  public goBack() {
    if (this.menuHistory.length > 1) {
      this.menuHistory = this.menuHistory.slice(0, -1);
    }
  }

  public getCurrentMenu() {
    return this.menuHistory[this.menuHistory.length - 1];
  }
}

export const menuLogic = new MenuLogic();
