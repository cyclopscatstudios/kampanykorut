import { Text } from "../Text";
import logo from "../../../assets/logo_reworked.png";
import { Button } from "../Button";
import { Tooltip } from "../Tooltip";

export interface MenuBarProps {
  isSettingsOpen: boolean;
  isGameMenuOpen: boolean;
  isExitModalOpen: boolean;
  setIsOpenSettings: (val: boolean) => void;
  setIsOpenGameMenu: (val: boolean) => void;
  setIsExitModalOpen: (val: boolean) => void;
}

export function GameMenuBar({
  isSettingsOpen,
  isGameMenuOpen,
  isExitModalOpen,
  setIsOpenGameMenu,
  setIsOpenSettings,
  setIsExitModalOpen,
}: MenuBarProps) {
  return (
    <div className="w-full border-b-2 border-blue-400">
      <div className="flex justify-between items-center mx-5">
        <div className="flex justify-center items-center gap-2">
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={() => setIsOpenGameMenu(true)}
          >
            <img src={logo} className="size-5 mr-3" />
            <Text
              weight="bold"
              color={isGameMenuOpen ? "darkBlue" : "lightBlue"}
              className="text-5xl mt-5 mb-5"
            >
              KAMPÁNYKÖRÚT
            </Text>
          </div>
          <Button variant="transparent">
            <Button.Icon name="map-fill" color="white" size="medium" />
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              MAP
            </Text>
          </Button>
        </div>
        <div className="flex justify-center gap-2">
          <Tooltip content="Save game">
            <Button variant="transparent">
              <Button.Icon
                name="file-earmark-arrow-down-fill"
                color="white"
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content="Load game">
            <Button variant="transparent">
              <Button.Icon
                name="file-earmark-arrow-up-fill"
                color="white"
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content="Settings">
            <Button
              variant="transparent"
              onClick={() => setIsOpenSettings(true)}
            >
              <Button.Icon
                name="gear-fill"
                color={isSettingsOpen ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content="Quit game">
            <Button
              variant="transparent"
              onClick={() => setIsExitModalOpen(true)}
            >
              <Button.Icon
                name="x-square-fill"
                color={isExitModalOpen ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
