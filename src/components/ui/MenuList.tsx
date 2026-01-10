import { useTranslateLang } from "../../logic/useTranslateLang";
import { Button } from "./Button";
import { Icon, type BootstrapIcon } from "./Icon";
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
              <Icon name={item.icon as BootstrapIcon} source={item.iconSource} />
              <Text weight="medium" color="lightBlue">
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
