import { t } from "i18next";
import { getParliamentaryConfig } from "@/shared/domain";
import {
  CampaignConfig,
  CampaignState,
  FinalResults,
  HistoryItem,
} from "@/shared/types";
import { Text } from "../../../../../../../../shared/ui/Text";
import type { StatisticResult } from "../statistics.utils";
import { SupportChart } from "./Chart";
import { ListOverview } from "./ListOverview";
import { MandateOverview } from "./MandateOverview";
import { MobileRankings } from "./MobileRankings";
import { PercentagesOverview } from "./PercentagesOverview";

export function Overview({
  results,
  config,
  playerSide,
  largestVictories,
  largestDefeats,
  closestDistricts,
  turnHistory,
}: {
  state: CampaignState | null;
  turnHistory: HistoryItem[];
  results: FinalResults;
  config: CampaignConfig;
  playerSide: string;
  largestVictories: StatisticResult[];
  largestDefeats: StatisticResult[];
  closestDistricts: StatisticResult[];
}) {
  const party = results.mandates.find((party) => party.party === playerSide);
  const percentage = results.percentages.partyListResults[playerSide];
  const seatConfig = getParliamentaryConfig(config.electionConfig);

  return (
    <div className="flex flex-col justify-center items-stretch md:items-center min-w-0">
      <div
        className={`${seatConfig ? "grid grid-cols-3" : "flex justify-center"} md:flex gap-2 mb-3`}
      >
        {seatConfig && (
          <>
            <MandateOverview
              all={seatConfig.allSeats - seatConfig.listSeats}
              mandates={party?.constituencySeats ?? 0}
              label={t("endResult.statistics.overview.constituencySeats")}
            />
            <MandateOverview
              all={seatConfig.listSeats}
              mandates={party?.listSeats ?? 0}
              label={t("endResult.statistics.overview.listSeats")}
            />
          </>
        )}
        <PercentagesOverview
          label={t("endResult.statistics.overview.partyListResults")}
          percentage={Number(percentage.toFixed(2)) * 100}
        />
      </div>
      <MobileRankings
        config={config}
        largestVictories={largestVictories}
        largestDefeats={largestDefeats}
        closestDistricts={closestDistricts}
      />
      <div className="hidden md:flex gap-2">
        <ListOverview
          label={t("endResult.statistics.overview.biggestVictories")}
          iconName="check-circle-fill"
          list={largestVictories}
          config={config}
          getParty={(e) => e.playerParty}
          renderValue={(e) => (
            <Text>+{e.percentageDifference.toFixed(1)}%</Text>
          )}
        />
        <ListOverview
          label={t("endResult.statistics.overview.biggestDefeats")}
          iconName="x-circle-fill"
          list={largestDefeats}
          config={config}
          getParty={(e) => e.opponentParty}
          renderValue={(e) => <Text>{e.percentageDifference.toFixed(1)}%</Text>}
        />
        <ListOverview
          label={t("endResult.statistics.overview.closestDistricts")}
          iconName="exclamation-circle-fill"
          list={closestDistricts}
          config={config}
          getParty={(e) => e.winnerParty ?? ""}
          renderValue={(e) => <Text>{e.percentageDifference.toFixed(1)}%</Text>}
        />
      </div>
      <div className="w-full mt-4">
        <SupportChart
          label={t("endResult.statistics.overview.supportTrendLabel")}
          turnHistory={turnHistory}
          config={config}
        />
      </div>
    </div>
  );
}
