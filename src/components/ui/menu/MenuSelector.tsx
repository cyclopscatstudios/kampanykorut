import { useState } from "react";
import { MainMenu } from "./MainMenu";
import { NewGameMenu } from "./NewGameMenu";
import type { MenuItem } from "../MenuList";
import { menuLogic, MenuType } from "../../../logic/MenuLogic";

enum NewGameMenuItems {
  ClassicMode = "classicMode",
  CampaignMode = "campaignMode",
}

export type MenuItems = MenuType | NewGameMenuItems;

export function MenuSelector() {
  const [currentMenu, setCurrentMenu] = useState<MenuType>(MenuType.MainMenu);

  const handleMenuChange = (menuItem: MenuItem) => {
    switch (menuItem.id) {
      case "newGame":
        setCurrentMenu(MenuType.NewGameMenu);
        menuLogic.setHistoryItem(MenuType.NewGameMenu);
        return;
      case "back": {
        const prevMenu =
          menuLogic.getHistory()[menuLogic.getHistory().length - 2];
        setCurrentMenu(prevMenu);
        const newHistory = menuLogic.getHistory();
        newHistory.pop();
        if (newHistory) {
          menuLogic.setHistory(newHistory);
        }
        return;
      }
      default:
        setCurrentMenu(MenuType.MainMenu);
        menuLogic.setHistoryItem(MenuType.MainMenu);
    }
  };

  return (
    <>
      {currentMenu === MenuType.MainMenu && (
        <MainMenu onClick={handleMenuChange} />
      )}
      {currentMenu === MenuType.NewGameMenu && (
        <NewGameMenu onClick={handleMenuChange} />
      )}
    </>
  );
}
