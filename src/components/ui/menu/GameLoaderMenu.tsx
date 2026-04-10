import { type MenuListProps } from "../MenuList";
import { MenuLayout } from "./MenuLayout";
import gameModes from "../../../assets/jsons/game_modes.json";
import { MenuItemId, type MenuItem } from "./menu.types";
import { useTranslateLang } from "../../../logic/useTranslateLang";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { useState, type MouseEvent } from "react";
import classNames from "classnames";
import { Heading } from "../Heading";

export function GameLoaderMenu({
  onClick,
}: {
  onClick?: (item: MenuItem) => void;
}) {
  return (
    <MenuLayout>
      <GameLoaderMenuList
        listItems={gameModes.map((gameMode) => ({
          id: MenuItemId.SideSelector,
          gameId: gameMode.gameId,
          text: gameMode.name,
          icon: "campaign",
          iconSource: "svg",
          description: gameMode.description,
        }))}
        hasBackButton
        onClick={onClick}
      />
    </MenuLayout>
  );
}

export function GameLoaderMenuList({
  listItems,
  onClick,
  hasBackButton = false,
}: MenuListProps) {
  const [openedGameId, setOpenedGameId] = useState<string | undefined>(
    undefined,
  );
  const [selectedCampaign, setSelectedCampaign] = useState<MenuItem | null>(
    null,
  );
  const backButton = useTranslateLang("menuList.button.back");

  const handleOnClick = (item: MenuItem | null) => {
    if (onClick && item) {
      onClick(item);
    }
  };

  const handleGameSelect = (
    item: MenuItem,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
    if (selectedCampaign?.gameId === item.gameId) {
      setSelectedCampaign(null);
      return;
    }
    setSelectedCampaign(item);
  };

  return (
    <div className="size-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <Heading level={3} color="lightBlue" className="mb-6">
          {selectedCampaign ? selectedCampaign.text : "Select a campaign"}
        </Heading>

        <ul className="w-[350px]">
          {listItems.map((item, index) => {
            const isSelected = selectedCampaign?.gameId === item.gameId;
            const isOpen = openedGameId === item.gameId;

            return (
              <li
                key={item.gameId ?? index}
                className={
                  index !== listItems.length - 1 || hasBackButton ? "pb-4" : ""
                }
              >
                <div
                  className={classNames(
                    "border cursor-pointer overflow-hidden rounded-md",
                    {
                      "border-blue-500 bg-slate-100/30": isSelected,
                      "border-slate-50/10 bg-slate-100/10": !isSelected,
                    },
                  )}
                  onClick={(event) => handleGameSelect(item, event)}
                >
                  <div className="flex flex-col gap-2 p-2">
                    <div className="flex items-center gap-2">
                      <div className="max-w-[150px] shrink-0">
                        <img
                          src="https://www.budakalasz.hu/wp-content/uploads/2022/01/BK_Valasztas_BANNERArtboard-3-1.jpg"
                          alt={item.text}
                          className="h-auto w-full rounded-md object-cover"
                        />
                      </div>

                      <Text weight="medium" color="lightBlue">
                        {item.text}
                      </Text>
                    </div>

                    <button
                      type="button"
                      className="cursor-pointer text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenedGameId(isOpen ? undefined : item.gameId);
                      }}
                    >
                      {isOpen ? (
                        <div className="text-center">
                          <Text
                            weight="medium"
                            color="lightBlue"
                            className="w-full pb-2 text-center text-xs"
                          >
                            {item.description}
                          </Text>
                          <Icon name="arrow-up" />
                        </div>
                      ) : (
                        <div className="text-center">
                          <Icon name="arrow-down" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
          <Button
            variant="primary"
            size="large"
            block
            className="mb-1"
            disabled={!selectedCampaign}
            onClick={() => handleOnClick(selectedCampaign)}
          >
            <Button.Text>Next</Button.Text>
          </Button>
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
    </div>
  );
}
