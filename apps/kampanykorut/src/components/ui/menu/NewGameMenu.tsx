import { t } from "i18next";
import { useTranslateLang } from "../../../../../../shared/logic/hooks/useTranslateLang";
import { MenuItemId } from "../../../../../../shared/types/menu.types";
import { MenuLayout } from "../../../../../../shared/ui/menu/MenuLayout";
import { MenuList } from "../../../../../../shared/ui/menu/MenuList";

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
            tooltip: t("newGameMenu.comingSoon"),
          },
        ]}
        hasBackButton
      />
    </MenuLayout>
  );
}
