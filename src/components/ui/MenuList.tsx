import { useTranslateLang } from "../../logic/useTranslateLang";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { MenuItemId, type MenuItem } from "./menu/menu.types";
import { Text } from "./Text";

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
    <div>
      <ul className="w-[450px]">
        {listItems.map((item, index) => (
          <li
            key={index}
            className={
              index !== listItems.length - 1 || hasBackButton ? "pb-4" : ""
            }
          >
            <Button
              variant="tertiary"
              size="large"
              block
              onClick={() => handleOnClick(item)}
            >
              <Icon name={item.icon as any} source={item.iconSource} />
              <Text weight="medium" color="emerald-light">
                {item.text}
              </Text>
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
              <Text weight="medium" color="emerald-light">
                {backButton}
              </Text>
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
}