import { MenuLayout, MenuList } from "@/shared/ui";
import { MenuItemId } from "@/shared/types";
import { useTranslateLang } from "@/shared/logic/hooks";

export function MainMenu() {
  const newCampaignLabel = useTranslateLang("mainMenu.newCampaign");

  return (
    <div className="size-full flex items-center justify-center">
      <MenuLayout>
        <MenuList
          variant="primary"
          listItems={[
            {
              id: MenuItemId.NewCampaign,
              text: newCampaignLabel,
              path: "new-campaign",
              icon: "play-circle-fill",
            },
          ]}
        />
      </MenuLayout>
    </div>
  );
}
