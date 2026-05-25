import { Text } from "../Text";
import markdown from "../../../../brand-assets/svg/logo-wordmark-dark.svg";
import logo from "../../../../brand-assets/svg/logo-mark.svg";
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
  actionDispatch?: ActionDispatch<[action: GameFlowAction]>;
  state?: CampaignState;
  config?: CampaignConfig;
}

export function TopMenuBar({
  activeDialog,
  onOpen,
  actionDispatch,
  state,
  config,
}: MenuBarProps) {
  const [info, setInfo] = useState("turn");
  return (
    <div className="w-full border-b-2 border-blue-400">
      <div className="h-[60px] flex justify-between items-center mx-2.5">
        <div className="flex justify-between items-center gap-2">
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={() => onOpen("gameMenu")}
          >
            <img src={logo} className="mr-1" width="40" height="40" />
            <img src={markdown} className="mr-3" width="200" height="40" />
          </div>
          {actionDispatch && (
            <Button
              variant="tertiary"
              onClick={() =>
                actionDispatch({ type: "CHANGE_VIEW", view: "MapView" })
              }
            >
              <Button.Icon name="map-fill" color="white" size="medium" />
            </Button>
          )}
        </div>
        {state && config && (
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
        )}
        <div className="flex justify-center gap-2">
          <Tooltip content={t("gameMenuBar.save")}>
            <Button variant="tertiary" onClick={() => onOpen("saveGame")}>
              <Button.Icon
                name="file-earmark-arrow-down-fill"
                color={activeDialog === "saveGame" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content={t("gameMenuBar.laod")}>
            <Button variant="tertiary" onClick={() => onOpen("savedGames")}>
              <Button.Icon
                name="file-earmark-arrow-up-fill"
                color={activeDialog === "savedGames" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content={t("gameMenuBar.settings")}>
            <Button variant="tertiary" onClick={() => onOpen("settings")}>
              <Button.Icon
                name="gear-fill"
                color={activeDialog === "settings" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content={t("gameMenuBar.quit")}>
            <Button variant="tertiary" onClick={() => onOpen("exit")}>
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
    <div className="bg-blue-400/10 rounded-md border border-blue-50/10 p-1">
      <Text color="lightBlue" size="lg">{`${currentTurn}/${turns}`}</Text>
    </div>
  );
}
