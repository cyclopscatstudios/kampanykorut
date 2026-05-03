import { Text } from "../Text";
import logo from "../../../assets/logo_reworked.png";
import { Button } from "../Button";
import { Tooltip } from "../Tooltip";
import type { DialogId } from "./hooks/useDialogState";
import type { ActionDispatch } from "react";
import type { GameFlowAction } from "./hooks/useGameFlow";

export interface MenuBarProps {
  activeDialog: DialogId;
  onOpen: (id: Exclude<DialogId, null>) => void;
  actionDispatch: ActionDispatch<[action: GameFlowAction]>
}

export function GameMenuBar({ activeDialog, onOpen, actionDispatch }: MenuBarProps) {
  return (
    <div className="w-full border-b-2 border-blue-400">
      <div className="flex justify-between items-center mx-5">
        <div className="flex justify-center items-center gap-2">
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={() => onOpen("gameMenu")}
          >
            <img src={logo} className="size-5 mr-3" />
            <Text
              weight="bold"
              color={activeDialog === "gameMenu" ? "darkBlue" : "lightBlue"}
              className="text-5xl mt-5 mb-5"
            >
              KAMPÁNYKÖRÚT
            </Text>
          </div>
          <Button variant="transparent" onClick={() => actionDispatch({ type: "CHANGE_VIEW", view: "MapView" })}>
            <Button.Icon name="map-fill" color="white" size="medium" />
          </Button>
        </div>
        <div className="flex justify-center gap-2">
          <Tooltip content="Save game">
            <Button variant="transparent" onClick={() => onOpen("saveGame")}>
              <Button.Icon
                name="file-earmark-arrow-down-fill"
                color={activeDialog === "saveGame" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content="Load game">
            <Button variant="transparent" onClick={() => onOpen("savedGames")}>
              <Button.Icon
                name="file-earmark-arrow-up-fill"
                color={activeDialog === "savedGames" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content="Settings">
            <Button variant="transparent" onClick={() => onOpen("settings")}>
              <Button.Icon
                name="gear-fill"
                color={activeDialog === "settings" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content="Quit game">
            <Button variant="transparent" onClick={() => onOpen("exit")}>
              <Button.Icon
                name="x-square-fill"
                color={activeDialog === "exit" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
