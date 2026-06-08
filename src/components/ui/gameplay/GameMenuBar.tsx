import { t } from "i18next";
import { type ActionDispatch, useState } from "react";
import { container } from "tsyringe";
import logo from "../../../../brand-assets/svg/logo-mark.svg";
import markdown from "../../../../brand-assets/svg/logo-wordmark-dark.svg";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Menu, MenuItem, SubMenu } from "../Menu";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";
import type { DialogId } from "./hooks/useDialogState";
import type { GameFlowAction, GameFlowState } from "./hooks/useGameFlow";
import { AGGREGATE_POLLSTER_ID, PollsterEngine } from "@/shared/domain";
import { CampaignConfig, CampaignState, PollingOpnions } from "@/shared/types";

export interface MenuBarProps {
  activeDialog: DialogId;
  onOpen: (id: Exclude<DialogId, null>) => void;
  actionDispatch?: ActionDispatch<[action: GameFlowAction]>;
  state?: CampaignState;
  config?: CampaignConfig;
  pollsterData?: PollingOpnions | null;
  handlePollsterChange?: (
    id: string,
    state?: CampaignState,
    config?: CampaignConfig,
  ) => void;
  flow: GameFlowState;
}

export function TopMenuBar({
  activeDialog,
  onOpen,
  actionDispatch,
  pollsterData,
  handlePollsterChange,
  state,
  config,
  flow,
}: MenuBarProps) {
  const [info, setInfo] = useState("turn");
  const pollsterEngine = container.resolve(PollsterEngine);
  const pollsters = pollsterEngine.getPollsters();
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
          {flow.currentView === "MapView" && flow.visitingDistrict && (
            <Button
              variant="tertiary"
              onClick={() =>
                actionDispatch?.({ type: "CHANGE_VIEW", view: "QuestionView" })
              }
            >
              <Button.Icon name="geo-alt-fill" color="white" size="medium" />
            </Button>
          )}
          <Menu
            align="left"
            trigger={
              <Button variant="tertiary">
                <Button.Icon name="map-fill" color="white" size="medium" />
              </Button>
            }
          >
            <SubMenu label={t("gameMenuBar.mapMenu.polls.menuLabel")}>
              {[
                ...pollsters,
                {
                  id: AGGREGATE_POLLSTER_ID,
                  label: t("gameMenuBar.mapMenu.polls.average"),
                },
              ].map((pollster) => (
                <MenuItem
                  key={pollster.id}
                  onClick={() =>
                    handlePollsterChange?.(pollster.id, state, config)
                  }
                >
                  <div className="flex justify-between items-center px-2">
                    {pollster.label}
                    {pollsterData?.selectedPollsterId === pollster.id && (
                      <Icon name="check-lg" color="darkBlue" />
                    )}
                  </div>
                </MenuItem>
              ))}
            </SubMenu>
          </Menu>
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
