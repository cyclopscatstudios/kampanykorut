import { Text } from "../Text";
import logo from "../../../assets/logo_reworked.png";
import { Button } from "../Button";
import { Tooltip } from "../Tooltip";
import type { DialogId } from "./hooks/useDialogState";
import { useState, type ActionDispatch } from "react";
import type { GameFlowAction } from "./hooks/useGameFlow";
import { t } from "i18next";
import type { CampaignState } from "@/logic/domain";
import type { CampaignConfig } from "@/logic/types";

export interface MenuBarProps {
  activeDialog: DialogId;
  onOpen: (id: Exclude<DialogId, null>) => void;
  actionDispatch: ActionDispatch<[action: GameFlowAction]>;
  state: CampaignState;
  config: CampaignConfig;
}

export function GameMenuBar({
  activeDialog,
  onOpen,
  actionDispatch,
  state,
  config,
}: MenuBarProps) {
  const [info, setInfo] = useState("turn");
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
          <Button
            variant="transparent"
            onClick={() =>
              actionDispatch({ type: "CHANGE_VIEW", view: "MapView" })
            }
          >
            <Button.Icon name="map-fill" color="white" size="medium" />
          </Button>
        </div>
        <div onClick={() => setInfo(info === "turn" ? "configName" : "turn")}>
          {info === "turn" ? (
            <TurnBadge
              currentTurn={state.turn}
              turns={config.questions.length}
            />
          ) : (
            <Text size="lg">{config.electionConfig.title}</Text>
          )}
        </div>
        <div className="flex justify-center gap-2">
          <Tooltip content={t("gameMenuBar.save")}>
            <Button variant="transparent" onClick={() => onOpen("saveGame")}>
              <Button.Icon
                name="file-earmark-arrow-down-fill"
                color={activeDialog === "saveGame" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content={t("gameMenuBar.laod")}>
            <Button variant="transparent" onClick={() => onOpen("savedGames")}>
              <Button.Icon
                name="file-earmark-arrow-up-fill"
                color={activeDialog === "savedGames" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content={t("gameMenuBar.settings")}>
            <Button variant="transparent" onClick={() => onOpen("settings")}>
              <Button.Icon
                name="gear-fill"
                color={activeDialog === "settings" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content={t("gameMenuBar.quit")}>
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

function TurnBadge({
  currentTurn,
  turns,
}: {
  currentTurn: number;
  turns: number;
}) {
  return (
    <div className="bg-blue-50 p-1 rounded-full">
      <Text color="darkBlue" size="lg">{`${currentTurn}/${turns}`}</Text>
    </div>
  );
}
