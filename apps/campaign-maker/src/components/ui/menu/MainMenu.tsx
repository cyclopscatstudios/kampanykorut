import { MenuLayout, MenuList } from "@/shared/ui";
import { MenuItemId } from "../../../../../../src/components/ui/menu/menu.types";

export function MainMenu() {
    return (
        <div className="relative w-full h-full">
            <MenuLayout>
                <MenuList 
                    listItems={[
                        {
                            id: MenuItemId.CampaignMaker,
                            text: "Campaign maker",
                            path: "campaign-maker",
                        }
                    ]}
                />
            </MenuLayout>
            
        </div>
    )
}