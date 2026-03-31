import { type MenuListProps } from "../MenuList";
import { MenuLayout } from "./MenuLayout";
import gameModes from "../../../assets/jsons/game_modes.json";
import { MenuItemId, type MenuItem } from "./menu.types";
import { useTranslateLang } from "../../../logic/useTranslateLang";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { useState } from "react";

export function GameLoaderMenu({
  onClick,
}: {
  onClick?: (item: MenuItem) => void;
}) {
  return (
    <MenuLayout>
      <GameLoaderMenuList
        listItems={gameModes.map((gameMode) => ({
          id: MenuItemId.SideSelector,
          gameId: gameMode.gameId,
          text: gameMode.name,
          icon: "campaign",
          iconSource: "svg",
          description: gameMode.description,
        }))}
        hasBackButton
        onClick={onClick}
      />
    </MenuLayout>
  );
}

export function GameLoaderMenuList({
  listItems,
  onClick,
  hasBackButton = false,
}: MenuListProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const backButton = useTranslateLang("menuList.button.back");

  const handleOnClick = (item: MenuItem) => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="cursor-pointer">
      <ul className="w-[350px]">
        {listItems.map((item, index) => (
          <li
            key={index}
            className={
              index !== listItems.length - 1 || hasBackButton ? "pb-4" : ""
            }
          >
            <div className="bg-slate-100/10 border border-slate-50/10">
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2 items-center">
                  <div className="max-w-[150px]">
                    <img src="https://www.budakalasz.hu/wp-content/uploads/2022/01/BK_Valasztas_BANNERArtboard-3-1.jpg" />
                  </div>
                  <Text weight="medium" color="lightBlue">
                    {item.text}
                  </Text>
                </div>
                {isMenuOpen && (
                  <Text
                    weight="medium"
                    color="lightBlue"
                    className="text-xs text-center w-full"
                  >
                    {item.description}
                  </Text>
                )}
              </div>
            </div>
            <Button
              variant="transparent"
              size="small"
              block
              onClick={() => handleOnClick(item)}
            >
              <Button.Text>Play</Button.Text>
            </Button>
          </li>
        ))}
        {hasBackButton && (
          <li>
            <Button
              variant="tertiary"
              size="large"
              block
              onClick={() => onClick?.({ id: MenuItemId.Back, text: "Back" })}
            >
              <Icon name="backspace-fill" />
              <Text weight="medium" color="lightBlue">
                {backButton}
              </Text>
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
}
