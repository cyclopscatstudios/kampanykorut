import { useTranslateLang } from "../../logic/useTranslateLang";
import { Button } from "./Button";
import { Text } from "./Text";

export enum MenuItemId {
  NewGame = "newGame",
  ModMaker = "modMaker",
  Settings = "settings",
  CampaignMode = "campaignMode",
  ClassicMode = "classicMode",
  Back = "back",
}

export type MenuItem = {
  id: MenuItemId;
  text: string;
};

interface MenuListProps {
  listItems: MenuItem[];
  onClick?: (item: MenuItem) => void;
  hasBackButton?: boolean;
}

export function MenuList({
  listItems,
  onClick,
  hasBackButton = false,
}: MenuListProps) {
  const backButton = useTranslateLang("menuList.button.back");

  const handleOnClick = (item: MenuItem) => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <div className="px-8 py-12 outline outline-1 outline-emerald-800/60">
      <ul className="w-[450px]">
        {listItems.map((item, index) => (
          <li
            key={index}
            className={
              index !== listItems.length - 1 || hasBackButton ? "pb-4" : ""
            }
          >
            <Button block onClick={() => handleOnClick(item)}>
              <Text color="emerald">{item.text}</Text>
            </Button>
          </li>
        ))}
        {hasBackButton && (
          <li>
            <Button
              block
              onClick={() => onClick?.({ id: MenuItemId.Back, text: "Back" })}
            >
              <Text color="emerald">{backButton}</Text>
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
}
