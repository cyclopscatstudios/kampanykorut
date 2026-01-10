import { useTranslateLang } from "../../../logic/useTranslateLang";
import { MenuList } from "../MenuList";
import { MenuItemId, type MenuItem } from "./menu.types";
import { MenuLayout } from "./MenuLayout";

export function NewGameMenu({
  onClick,
}: {
  onClick?: (item: MenuItem) => void;
}) {
  const classicMode = useTranslateLang("newGameMenu.classicMode");
  const campaignMode = useTranslateLang("newGameMenu.campaignMode");

  return (
    <MenuLayout>
      <MenuList
        listItems={[
          {
            id: MenuItemId.ClassicMode,
            text: classicMode,
            icon: "classic",
            iconSource: "svg",
          },
          {
            id: MenuItemId.CampaignMode,
            text: campaignMode,
            icon: "campaign",
            iconSource: "svg",
          },
        ]}
        onClick={onClick}
        hasBackButton
      />
    </MenuLayout>
  );
}
