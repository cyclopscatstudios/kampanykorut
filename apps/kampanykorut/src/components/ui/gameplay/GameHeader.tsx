import { t } from "i18next";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import {
  AGGREGATE_POLLSTER_ID,
  getTotalTurns,
  getUnseenPublicEventIds,
  isStrategicMode,
  PollsterEngine,
} from "@/shared/domain";
import { CampaignConfig, CampaignState, PollingOpnions } from "@/shared/types";
import logo from "../../../../../../brand-assets/svg/logo-mark.svg";
import markdown from "../../../../../../brand-assets/svg/logo-wordmark-dark.svg";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";
import { useNavigation } from "../../../hooks/navigationHook";
import { StateEngine } from "../../../logic/application";
import { Navigation } from "../../../logic/application/navigation/Navigation";
import { PoliticalStatusButton } from "../dashboard/PoliticalStatusButton";
import { Menu, MenuItem, SubMenu } from "../Menu";
import { BugReporterButton } from "./BugReporter/BugReporterButton";
import { CampaignBadge } from "./CampaignBadge";
import { GAME_HEADER_SLOT_ID } from "./gameHeaderSlot";
import type { DialogId } from "./hooks/useDialogState";
import { PollsterOption, PollsterPicker } from "./PollsterPicker";

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
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const pollsterEngine = container.resolve(PollsterEngine);
  const pollsters = pollsterEngine.getPollsters();
  const navigationService = container.resolve(Navigation);
  const endResultsScreen = navigationService.isUrlParamMatch("/end-results");
  const dashboardScreen = navigationService.isUrlParamMatch("/dashboard");
  const { goToPoliticalDashboard } = useNavigation();
  const sessionId = container.resolve(StateEngine).getSessionId();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlot(document.getElementById(GAME_HEADER_SLOT_ID));
  }, []);

  if (!slot) {
    return null;
  }

  const contentProps: HeaderContentProps = {
    activeDialog,
    onOpen,
    state,
    config,
    pollsterData,
    handlePollsterChange,
    pollsters,
    hidePollsters: endResultsScreen || dashboardScreen,
    politicalStatus:
      state && isStrategicMode(config) && !endResultsScreen && !dashboardScreen
        ? {
            hasUnseenEvents:
              getUnseenPublicEventIds(state, config?.campaignEvents).length > 0,
            onOpen: () =>
              goToPoliticalDashboard(state.activeCampaignId, sessionId),
          }
        : undefined,
  };

  return createPortal(
    <header className="w-full border-b-2 border-blue-400 bg-[rgba(15,23,42,0.92)]">
      {isDesktop ? (
        <WideHeader {...contentProps} />
      ) : (
        <NarrowHeader {...contentProps} />
      )}
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
    <Tooltip content={t("gameHeader.turnsTooltip")} position="bottom">
      <div className="h-10 flex items-center bg-blue-400/10 rounded-md border border-blue-50/10 px-3">
        <Text color="lightBlue" size="lg">{`${currentTurn}/${turns}`}</Text>
      </div>
    </Tooltip>
  );
}

interface HeaderContentProps {
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
  pollsters: ReturnType<PollsterEngine["getPollsters"]>;
  hidePollsters: boolean;
  politicalStatus?: {
    hasUnseenEvents: boolean;
    onOpen: () => void;
  };
}

function getPollsterOptions(
  pollsters: ReturnType<PollsterEngine["getPollsters"]>,
): PollsterOption[] {
  return [
    ...pollsters,
    {
      id: AGGREGATE_POLLSTER_ID,
      label: t("gameMenuBar.mapMenu.polls.average"),
    },
  ].sort((a, b) => {
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
  });
}

function NarrowHeader({
  activeDialog,
  onOpen,
  state,
  config,
  pollsterData,
  handlePollsterChange,
  pollsters,
  hidePollsters,
  politicalStatus,
}: HeaderContentProps) {
  return (
    <>
      <div className="mx-2.5 grid h-[60px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <div className="flex items-center">
          <Button
            variant="tertiary"
            iconOnly
            onClick={() => onOpen("gameMenu")}
          >
            <img src={logo} width="26" height="26" alt="Kampánykörút" />
          </Button>
        </div>
        <div>
          {state && config && (
            <TurnBadge
              currentTurn={state.turn}
              turns={getTotalTurns(state, config)}
            />
          )}
        </div>
        <div className="flex items-center justify-end">
          <NarrowMenu activeDialog={activeDialog} onOpen={onOpen} />
        </div>
      </div>
      {state && config && (
        <div className="grid h-11 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-t border-slate-400/12 px-1.5">
          <div className="flex min-w-0 items-center">
            <CampaignBadge
              state={state}
              config={config}
              variant="sheet"
              appearance="inline"
            />
          </div>
          <div>
            {politicalStatus && <PoliticalStatusButton {...politicalStatus} />}
          </div>
          <div className="flex min-w-0 items-center justify-end">
            {!hidePollsters && (
              <PollsterPicker
                options={getPollsterOptions(pollsters)}
                selectedId={pollsterData?.selectedPollsterId}
                onSelect={(id) => handlePollsterChange?.(id, state, config)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NarrowMenu({
  activeDialog,
  onOpen,
}: Pick<HeaderContentProps, "activeDialog" | "onOpen">) {
  return (
    <Menu
      align="right"
      trigger={
        <Button variant="tertiary" iconOnly>
          <Button.Icon name="list" color="white" size="medium" />
        </Button>
      }
    >
      <MenuItem onClick={() => onOpen("saveGame")}>
        <div className="flex items-center gap-2">
          <Icon
            name="file-earmark-arrow-down-fill"
            color={activeDialog === "saveGame" ? "darkBlue" : "blue"}
          />
          {t("gameMenuBar.save")}
        </div>
      </MenuItem>
      <MenuItem onClick={() => onOpen("savedGames")}>
        <div className="flex items-center gap-2">
          <Icon
            name="file-earmark-arrow-up-fill"
            color={activeDialog === "savedGames" ? "darkBlue" : "blue"}
          />
          {t("gameMenuBar.laod")}
        </div>
      </MenuItem>
      <MenuItem onClick={() => onOpen("settings")}>
        <div className="flex items-center gap-2">
          <Icon
            name="gear-fill"
            color={activeDialog === "settings" ? "darkBlue" : "blue"}
          />
          {t("gameMenuBar.settings")}
        </div>
      </MenuItem>
      <MenuItem onClick={() => onOpen("bugReporter")}>
        <div className="flex items-center gap-2">
          <Icon
            name="bug-fill"
            color={activeDialog === "bugReporter" ? "darkBlue" : "blue"}
          />
          {t("bugReporter.title")}
        </div>
      </MenuItem>
      <MenuItem onClick={() => onOpen("exit")}>
        <div className="flex items-center gap-2">
          <Icon
            name="x-square-fill"
            color={activeDialog === "exit" ? "darkBlue" : "blue"}
          />
          {t("gameMenuBar.quit")}
        </div>
      </MenuItem>
    </Menu>
  );
}

function WideHeader({
  activeDialog,
  onOpen,
  state,
  config,
  pollsterData,
  handlePollsterChange,
  pollsters,
  hidePollsters,
  politicalStatus,
}: HeaderContentProps) {
  return (
    <div className="h-[80px] flex justify-between items-center mx-2.5">
      <div className="flex justify-between items-center gap-2">
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => onOpen("gameMenu")}
        >
          <img src={logo} className="mr-1" width="30" height="30" />
          <img src={markdown} className="mr-3" width="200" height="30" />
        </div>
        {!hidePollsters && (
          <Menu
            align="left"
            trigger={
              <Button variant="tertiary">
                <Button.Icon name="map-fill" color="white" size="medium" />
              </Button>
            }
          >
            <SubMenu label={t("gameMenuBar.mapMenu.polls.menuLabel")}>
              {getPollsterOptions(pollsters).map((pollster) => (
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
          <CampaignBadge state={state} config={config} />
        </div>
      </div>
      {state && config && (
        <div className="text-center">
          <TurnBadge
            currentTurn={state.turn}
            turns={getTotalTurns(state, config)}
          />
        </div>
      )}
      <div className="flex items-center justify-center gap-2">
        {politicalStatus && <PoliticalStatusButton {...politicalStatus} />}
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
  );
}
