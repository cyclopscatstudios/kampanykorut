import { useState } from "react";
import { MainMenu } from "./MainMenu";
import { NewGameMenu } from "./NewGameMenu";
import { menuLogic, MenuType } from "../../../logic/MenuLogic";
import type { ScreenType } from "../../../App";
import type { MenuItem } from "./menu.types";

enum NewGameMenuItems {
  ClassicMode = "classicMode",
  CampaignMode = "campaignMode",
}

export type MenuItems = MenuType | NewGameMenuItems;

export function MenuSelector({
  setCurrentScreen,
}: {
  setCurrentScreen: (screen: ScreenType) => void;
}) {
  const [currentMenu, setCurrentMenu] = useState<MenuType>(MenuType.MainMenu);

  const handleMenuChange = (menuItem: MenuItem) => {
    switch (menuItem.id) {
      case "newGame":
        return setMenuType(MenuType.NewGameMenu);
      case "classicMode": {
        setCurrentScreen("MapCreator");
        return setMenuType(MenuType.ClassicMode);
      }
      case "back": {
        const prevMenu =
          menuLogic.getHistory()[menuLogic.getHistory().length - 2];
        setCurrentMenu(prevMenu);
        menuLogic.goBack();
        return;
      }
      default:
        setMenuType(MenuType.MainMenu);
    }
  };

  const setMenuType = (menuType: MenuType) => {
    setCurrentMenu(menuType);
    menuLogic.setHistoryItem(menuType);
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
