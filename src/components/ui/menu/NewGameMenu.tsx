import { useTranslateLang } from "../../../logic/application/hooks/useTranslateLang";
import { MenuList } from "@/shared/ui";
import { MenuItemId } from "./menu.types";
import { MenuLayout } from "../../../../shared/ui/menu/MenuLayout";

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
