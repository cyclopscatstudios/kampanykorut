import classNames from "classnames";
import { t } from "i18next";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { container } from "tsyringe";
import { AGGREGATE_POLLSTER_ID, PollsterEngine } from "@/shared/domain";
import {
  CampaignConfig,
  CampaignState,
  PollingOpnions,
  RawParty,
} from "@/shared/types";
import logo from "../../../../../../brand-assets/svg/logo-mark.svg";
import markdown from "../../../../../../brand-assets/svg/logo-wordmark-dark.svg";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { Navigation } from "../../../logic/application/navigation/Navigation";
import { Menu, MenuItem, SubMenu } from "../Menu";
import { Tooltip } from "../Tooltip";
import { BugReporterButton } from "./BugReporter/BugReporterButton";
import { GAME_HEADER_SLOT_ID } from "./gameHeaderSlot";
import type { DialogId } from "./hooks/useDialogState";

export interface GameHeaderProps {
  activeDialog: DialogId;
  onOpen: (id: Exclude<DialogId, null>) => void;
  state?: CampaignState;
  config?: CampaignConfig;
  pollsterData?: PollingOpnions | null;
  handlePollsterChange?: (
    id: string,
    state?: CampaignState,
    config?: CampaignConfig,
  ) => void;
}

export function GameHeader({
  activeDialog,
  onOpen,
  pollsterData,
  handlePollsterChange,
  state,
  config,
}: GameHeaderProps) {
  const [info, setInfo] = useState("turn");
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const pollsterEngine = container.resolve(PollsterEngine);
  const pollsters = pollsterEngine.getPollsters();
  const navigationService = container.resolve(Navigation);
  const endResultsScreen = navigationService.isUrlParamMatch("/end-results");
  const { title, parties, year } = { ...config?.electionConfig };
  const currentParty = parties?.find(
    (party) => party.id === state?.playerSide?.partyId,
  );

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlot(document.getElementById(GAME_HEADER_SLOT_ID));
  }, []);

  if (!slot) {
    return null;
  }

  return createPortal(
    <header className="w-full border-b-2 border-blue-400 bg-[rgba(15,23,42,0.92)]">
      <div className="h-[80px] flex justify-between items-center mx-2.5">
        <div className="flex justify-between items-center gap-2">
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={() => onOpen("gameMenu")}
          >
            <img src={logo} className="mr-1" width="30" height="30" />
            <img src={markdown} className="mr-3" width="200" height="30" />
          </div>
          {!endResultsScreen && (
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
                ]
                  .sort((a, b) => {
                    if (a.id === AGGREGATE_POLLSTER_ID) {
                      return -1;
                    }
                    if (b.id === AGGREGATE_POLLSTER_ID) {
                      return 1;
                    }
                    if (!a.label || !b.label) {
                      return 0;
                    }
                    return a.label.localeCompare(b.label);
                  })
                  .map((pollster) => (
                    <MenuItem
                      key={pollster.id}
                      onClick={() =>
                        handlePollsterChange?.(pollster.id, state, config)
                      }
                    >
                      <div className="flex justify-between items-center px-2 gap-2">
                        <div className="flex items-center gap-2">
                          <PollsterIcon id={pollster.id} />
                          {pollster.label}
                        </div>
                        {pollsterData?.selectedPollsterId === pollster.id && (
                          <Icon name="check-lg" color="darkBlue" />
                        )}
                      </div>
                    </MenuItem>
                  ))}
              </SubMenu>
            </Menu>
          )}
          <div className="ml-5">
            <CampaignBadge party={currentParty} title={title} year={year} />
          </div>
        </div>
        {state && config && (
          <div
            onClick={() => setInfo(info === "turn" ? "configName" : "turn")}
            className="text-center"
          >
            {info === "turn" ? (
              <TurnBadge
                currentTurn={state.turn}
                turns={
                  config.playableSides?.[state.playerSide?.partyId ?? ""]?.[
                    state.playerSide?.candidateId ?? ""
                  ]?.questions?.length ?? 0
                }
              />
            ) : (
              <Text size="lg">{config.electionConfig.title}</Text>
            )}
          </div>
        )}
        <div className="flex justify-center gap-2">
          <Tooltip content={t("gameMenuBar.save")} position="bottom">
            <Button variant="tertiary" onClick={() => onOpen("saveGame")}>
              <Button.Icon
                name="file-earmark-arrow-down-fill"
                color={activeDialog === "saveGame" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content={t("gameMenuBar.laod")} position="bottom">
            <Button variant="tertiary" onClick={() => onOpen("savedGames")}>
              <Button.Icon
                name="file-earmark-arrow-up-fill"
                color={activeDialog === "savedGames" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <Tooltip content={t("gameMenuBar.settings")} position="bottom">
            <Button variant="tertiary" onClick={() => onOpen("settings")}>
              <Button.Icon
                name="gear-fill"
                color={activeDialog === "settings" ? "darkBlue" : "white"}
                size="medium"
              />
            </Button>
          </Tooltip>
          <BugReporterButton
            onChange={() => onOpen("bugReporter")}
            variant="top"
            iconColor={activeDialog === "bugReporter" ? "darkBlue" : "white"}
          />
          <Tooltip content={t("gameMenuBar.quit")} position="bottom">
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
    </header>,
    slot,
  );
}

function PollsterIcon({ id }: { id: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    if (id === AGGREGATE_POLLSTER_ID) {
      return (
        <Icon
          name="reception-3"
          className="size-5 rounded-full object-cover"
          color="red"
        />
      );
    }
    return <div className="size-5 rounded-full bg-blue-400/20" />;
  }

  return (
    <img
      src={`/images/shared/pollsters/${id}.png`}
      alt=""
      className="size-5 rounded-full object-cover"
      onError={() => setFailed(true)}
    />
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

function CampaignBadge({
  party,
  title,
  year,
}: {
  party?: RawParty;
  title?: string;
  year?: string;
}) {
  const tooltipContent = `${year}: ${title} - ${party?.name}`;
  return (
    <Tooltip content={tooltipContent} position="bottom">
      <div className="h-[40px] flex items-center justify-center bg-blue-900/50 p-2 rounded-full border border-blue-50/25">
        <div className="h-[40px] flex items-center justify-center">
          <div
            className={classNames("size-[25px] rounded-full mr-1.5")}
            style={{ backgroundColor: party?.color }}
          />
          <div className="mx-1">
            <Text size="xs" weight="bold">
              {year}
            </Text>
            <Text size="xs" weight="light">
              {title}
            </Text>
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
