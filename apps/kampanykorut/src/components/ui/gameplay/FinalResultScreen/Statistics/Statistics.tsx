import { t } from "i18next";
import { useState } from "react";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import { CampaignConfig, FinalResults } from "@/shared/types";
import { Button } from "../../../../../../../../shared/ui/Button";
import {
  getClosestDistricts,
  getLargestDefeats,
  getLargestVictories,
} from "../statistics.utils";
import { Achievements } from "./Achievements";
import { DistrictDetails } from "./DistrictDetails";
import { Overview } from "./Overview";
import { TurnoutDetails } from "./TurnoutDetails";

type StatisticsTab =
  | "overview"
  | "district-details"
  | "turnout-details"
  | "achievements";

export function Statistics({
  results,
  config,
}: {
  config: CampaignConfig;
  results: FinalResults;
}) {
  const stateEngine = container.resolve(StateEngine);
  const configEngine = container.resolve(ConfigEngine);
  const state = stateEngine.getCampaignState();
  const turnHistory = stateEngine.getTurnHistory();
  const history = stateEngine.getHistory();
  const [currentTab, setCurrentTab] = useState<StatisticsTab>("overview");
  const playerSide = state?.playerSide?.partyId ?? "";
  const strategies =
    state && history
      ? (configEngine.getCampaignStrategies(state, config, history) ?? [])
      : [];
  const completedStrategies = strategies.filter((s) => s.isCompleted).length;

  const largestVictories = getLargestVictories(
    state?.candidateListData ?? [],
    playerSide,
  );

  const largestDefeats = getLargestDefeats(
    state?.candidateListData ?? [],
    playerSide,
  );

  const closestDistricts = getClosestDistricts(
    state?.candidateListData ?? [],
    playerSide,
  );

  return (
    <div>
      <StatisticsButtonBar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        achievementCount={strategies.length}
        completedAchievementCount={completedStrategies}
      />
      {currentTab === "overview" && (
        <Overview
          largestDefeats={largestDefeats}
          largestVictories={largestVictories}
          closestDistricts={closestDistricts}
          state={state}
          turnHistory={turnHistory}
          results={results}
          config={config}
          playerSide={playerSide}
        />
      )}
      {currentTab === "district-details" && (
        <DistrictDetails state={state} results={results} config={config} />
      )}
      {currentTab === "turnout-details" && (
        <TurnoutDetails state={state} config={config} />
      )}
      {currentTab === "achievements" && (
        <Achievements state={state} config={config} />
      )}
    </div>
  );
}

interface StatisticsButtonBarProps {
  currentTab: StatisticsTab;
  setCurrentTab: (tab: StatisticsTab) => void;
  achievementCount: number;
  completedAchievementCount: number;
}

function StatisticsButtonBar({
  currentTab,
  setCurrentTab,
  achievementCount,
  completedAchievementCount,
}: StatisticsButtonBarProps) {
  return (
    <div className="flex gap-6 mb-4">
      <Button
        selected={currentTab === "overview"}
        variant="subtab"
        onClick={() => setCurrentTab("overview")}
      >
        <Button.Text>{t("endResult.statistics.menuBar.overview")}</Button.Text>
      </Button>
      <Button
        selected={currentTab === "district-details"}
        variant="subtab"
        onClick={() => setCurrentTab("district-details")}
      >
        <Button.Text>
          {t("endResult.statistics.menuBar.districtDetails")}
        </Button.Text>
      </Button>
      <Button
        selected={currentTab === "turnout-details"}
        variant="subtab"
        onClick={() => setCurrentTab("turnout-details")}
      >
        <Button.Text>
          {t("endResult.statistics.menuBar.turnoutDetails")}
        </Button.Text>
      </Button>
      <Button
        selected={currentTab === "achievements"}
        variant="subtab"
        onClick={() => setCurrentTab("achievements")}
      >
        <Button.Text>{t("endResult.menuBar.achivements")}</Button.Text>
        {achievementCount > 0 && (
          <span className="ml-1.5 text-xs font-semibold text-slate-400">
            {completedAchievementCount}/{achievementCount}
          </span>
        )}
      </Button>
    </div>
  );
}
