import { MenuLayout, MenuList } from "@/shared/ui";
import { MenuItemId } from "@/shared/types";

export function MainMenu() {
  return (
    <div className="size-full flex items-center justify-center">
      <MenuLayout>
        <MenuList
          variant="hero"
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
