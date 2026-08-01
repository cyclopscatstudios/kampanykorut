import { useNavigate } from "react-router-dom";
import { Button, ButtonVariant } from "../Button";
import { Icon } from "../Icon";
import { type MenuItem } from "../../types/menu.types";
import { Text } from "../Text";
import { BootstrapIcon } from "../../types";
import { useTranslateLang } from "../../logic/hooks";

export interface MenuListProps {
  listItems: MenuItem[];
  variant?: ButtonVariant;
  hasBackButton?: boolean;
}

export function MenuList({
  listItems,
  hasBackButton = false,
  variant = "tertiary",
}: MenuListProps) {
  const navigate = useNavigate();
  const backButton = useTranslateLang("menuList.button.back");

  return (
    <div>
      <ul className="w-[300px] mx-2 md:w-[450px]">
        {listItems.map((item, index) => (
          <li
            key={index}
            className={
              index !== listItems.length - 1 || hasBackButton ? "pb-4" : ""
            }
          >
            <Button
              variant={variant}
              size="large"
              block
              onClick={() => navigate(item.path)}
              disabled={item.disabled}
              testId={`menuItem-${item.id}`}
            >
              <Icon
                name={item.icon as BootstrapIcon}
                source={item.iconSource}
              />
              <Text
                weight="medium"
                color={item.disabled ? "gray" : "lightBlue"}
              >
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
              onClick={() => navigate(-1)}
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
