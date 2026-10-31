import { useState } from "react";
import { useLoaderData } from "react-router";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import { createLogger } from "@/shared/logger/logger";
import { FinalResults } from "@/shared/types";
import { useTranslate } from "../../../../../../../shared/logic/hooks/useTranslateLang";
import { Button } from "../../../../../../../shared/ui/Button";
import { useNavigation } from "../../../../hooks/navigationHook";
import { StateEngine } from "../../../../logic/application/StateEngine";
import { GameChrome } from "../GameChrome";
import {
  ConfirmCampaignSelectorModal,
  ConfirmRestartModal,
} from "../GameDialog";
import { ElectionMap } from "./ElectionMap";
import { MayoralDistrictTable } from "./MayoralDistricts";
import { MayoralSummaryPage } from "./MayoralSummaryPage";
import { Statistics } from "./Statistics/Statistics";
import { SummaryPage } from "./SummaryPage";
import { TurnHistory } from "./TurnHistory";

const log = createLogger("FinalResultScreen");

const screens = [
  {
    id: "summaryPage",
    label: "endResult.menuBar.summary",
    icon: "trophy-fill",
  },
  {
    id: "electionMap",
    label: "endResult.menuBar.electionMap",
    icon: "map-fill",
  },
  {
    id: "statistics",
    label: "endResult.menuBar.statistics",
    icon: "bar-chart-fill",
  },
  { id: "history", label: "endResult.menuBar.history", icon: "clock-history" },
] as const;

const mayoralScreens = [
  screens[0],
  screens[1],
  {
    id: "districts",
    label: "endResult.menuBar.districts",
    icon: "list-ol",
  },
  screens[3],
] as const;

type ActiveScreen =
  | (typeof screens)[number]["id"]
  | (typeof mayoralScreens)[number]["id"];

export function FinalResultScreen() {
  const { results, config } = useLoaderData();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("summaryPage");
  const [confirmAction, setConfirmAction] = useState<
    "restart" | "campaignSelector" | null
  >(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const stateEngine = container.resolve(StateEngine);
  const history = stateEngine.getHistory();
  const t = useTranslate();
  const { goToCampaignSelector } = useNavigation();
  const state = stateEngine.getCampaignState();
  const mayoralResult = results.mayoralResult;
  const visibleScreens = mayoralResult ? mayoralScreens : screens;
  const summary = mayoralResult ? (
    <MayoralSummaryPage mayoralResult={mayoralResult} config={config} />
  ) : (
    <SummaryPage results={results} />
  );

  // check the result of `_other`, which aggregates party-list votes cast for minor/other parties
  // `_other` is not an actual party and should not be displayed in the UI
  inspectResults(results);

  return (
    <GameChrome config={config} state={state ?? undefined}>
      {confirmAction === "restart" && (
        <ConfirmRestartModal
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => stateEngine.clearGameState("restart")}
        />
      )}
      {confirmAction === "campaignSelector" && (
        <ConfirmCampaignSelectorModal
          onCancel={() => setConfirmAction(null)}
          onConfirm={goToCampaignSelector}
        />
      )}
      <div className="m-2 flex flex-col flex-1 min-h-0 md:flex-none">
        <div className="bg-[#0f172a] p-3 md:p-5 rounded-xl border border-slate-200/65 flex flex-col flex-1 min-h-0 md:flex-none">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            {isDesktop && (
              <div className="flex gap-2">
                {visibleScreens.map((screen) => {
                  return (
                    <Button
                      key={screen.id}
                      variant="tab"
                      selected={activeScreen === screen.id}
                      onClick={() => setActiveScreen(screen.id)}
                    >
                      <Button.Icon name={screen.icon} />
                      <Button.Text>{t(screen.label)}</Button.Text>
                    </Button>
                  );
                })}
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="tertiary"
                onClick={() => setConfirmAction("campaignSelector")}
              >
                <Button.Text>
                  {t("endResult.actions.otherCampaign")}
                </Button.Text>
              </Button>
              <Button onClick={() => setConfirmAction("restart")}>
                <Button.Icon name="arrow-counterclockwise" />
                <Button.Text>{t("endResult.actions.replay")}</Button.Text>
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 md:flex-none md:h-[620px] w-full md:w-[1100px] mb-3 overflow-y-auto md:overflow-y-visible">
            {!isDesktop && summary}
            {isDesktop && activeScreen === "statistics" && (
              <Statistics results={results} config={config} />
            )}
            {isDesktop && activeScreen === "districts" && mayoralResult && (
              <MayoralDistrictTable
                mayoralResult={mayoralResult}
                config={config}
              />
            )}
            {isDesktop && activeScreen === "summaryPage" && summary}
            {isDesktop && activeScreen === "electionMap" && (
              <ElectionMap config={config} mayoralResult={mayoralResult} />
            )}
            {isDesktop && activeScreen === "history" && (
              <TurnHistory
                history={history}
                config={config}
                playerSideId={state?.playerSide?.partyId}
                playerCandidateId={state?.playerSide?.candidateId}
              />
            )}
          </div>
        </div>
      </div>
    </GameChrome>
  );
}

function inspectResults(results: FinalResults) {
  const otherPercentage = results.percentages.partyListResults["_other"];
  const otherVoteCount = results.totals.partyListResults["_other"];
  if (otherPercentage > 0.01) {
    log.warn(
      "the _other vote share is greater than 1%. This is not necessarily an error, but check the campaign configuration if this was not intended.",
      {
        otherPercentage,
        otherVoteCount,
      },
    );
  }
}
