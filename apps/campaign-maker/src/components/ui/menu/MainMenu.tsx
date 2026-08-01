import { MenuLayout } from "../../../../../kampanykorut/src/components/ui/menu/MenuLayout";
import { MenuList } from "../../../../../kampanykorut/src/components/ui/MenuList";
import { MenuItemId } from "../../../../../kampanykorut/src/components/ui/menu/menu.types";

export function MainMenu() {
  return (
    <div className="relative w-full h-full">
      <MenuLayout>
        <MenuList
          variant="primary"
          listItems={[
            {
              id: MenuItemId.NewCampaign,
              text: "New Campaign",
              path: "new-campaign",
              icon: "play-circle-fill",
            },
          ]}
        />
      </MenuLayout>
    </div>
  );
}
