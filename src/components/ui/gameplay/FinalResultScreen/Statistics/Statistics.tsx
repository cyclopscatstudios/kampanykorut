import { StateEngine } from "@/logic/application";
import { container } from "tsyringe";
import {
  getClosestDistricts,
  getLargestDefeats,
  getLargestVictories,
} from "../statistics.utils";
import { useState } from "react";
import { Overview } from "./Overview";
import { Button } from "../../../Button";
import { DistrictDetails } from "./DistrictDetails";
import { t } from "i18next";
import { CampaignConfig, FinalResults } from "@/shared/types";

type StatisticsTab = "overview" | "district-details";

export function Statistics({
  results,
  config,
}: {
  config: CampaignConfig;
  results: FinalResults;
}) {
  const stateEngine = container.resolve(StateEngine);
  const state = stateEngine.getCampaignState();
  const turnHistory = stateEngine.getTurnHistory();
  const [currentTab, setCurrentTab] = useState<StatisticsTab>("overview");
  const playerSide = state?.playerSide?.partyId ?? "";

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
    </div>
  );
}

interface StatisticsButtonBarProps {
  currentTab: StatisticsTab;
  setCurrentTab: (tab: StatisticsTab) => void;
}

function StatisticsButtonBar({
  currentTab,
  setCurrentTab,
}: StatisticsButtonBarProps) {
  return (
    <div className="flex gap-2 mb-4 justify-end">
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
    </div>
  );
}
