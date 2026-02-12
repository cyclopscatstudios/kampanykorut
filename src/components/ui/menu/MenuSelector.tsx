import { useState } from "react";
import { MainMenu } from "./MainMenu";
import { NewGameMenu } from "./NewGameMenu";
import { menuLogic, MenuType } from "../../../logic/MenuLogic";
import type { ScreenType } from "../../../App";
import type { MenuItem } from "./menu.types";
import { GameLoaderMenu } from "./GameLoaderMenu";

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
  const [currentMenu, setCurrentMenu] = useState<MenuType>(MenuType.MainMenu);

  const handleMenuChange = (menuItem: MenuItem) => {
    console.log({ menuItem });
    switch (menuItem.id) {
      case "newGame":
        return setMenuType(MenuType.NewGameMenu);
      case "classicMode": {
        return setMenuType(MenuType.ClassicMode);
      }
      case "gameLoader":
        setActiveGameId(menuItem.gameId);
        setCurrentScreen("MapCreator");
        break;
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
      {currentMenu === MenuType.ClassicMode && (
        <GameLoaderMenu onClick={handleMenuChange} />
      )}
    </>
  );
}
