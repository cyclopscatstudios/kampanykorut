import { useTranslateLang } from "../../../../../../shared/logic/hooks/useTranslateLang";
import { MenuItemId } from "../../../../../../shared/types/menu.types";
import { MenuList } from "../../../../../../shared/ui/menu/MenuList";
import { MenuLayout } from "./MenuLayout";

export function NewGameMenu() {
  const classicMode = useTranslateLang("newGameMenu.classicMode");
  const campaignMode = useTranslateLang("newGameMenu.campaignMode");

  return (
    <MenuLayout>
      <MenuList
        listItems={[
          {
            id: MenuItemId.ClassicMode,
            text: classicMode,
            path: "classic",
            icon: "classic",
            iconSource: "svg",
          },
          {
            id: MenuItemId.CampaignMode,
            text: campaignMode,
            path: "campaigns",
            icon: "campaign",
            iconSource: "svg",
            disabled: true,
          },
        ]}
        hasBackButton
      />
    </MenuLayout>
  );
}
