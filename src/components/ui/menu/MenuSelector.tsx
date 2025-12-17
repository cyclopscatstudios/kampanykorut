import { useState } from "react";
import { MainMenu } from "./MainMenu";
import { NewGameMenu } from "./NewGameMenu";
import type { MenuItem } from "../MenuList";
import { menuLogic, MenuType } from "../../../logic/MenuLogic";
import { eventEmitter } from "../../../logic/EventEmitter";

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
        return setMenuType(MenuType.NewGameMenu);
      case "classicMode": {
        eventEmitter.emit("backgroundColor", "bg-white");
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
