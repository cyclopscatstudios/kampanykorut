import { ListOverview } from "./ListOverview";
import { MandateOverview } from "./MandateOverview";
import { PercentagesOverview } from "./PercentagesOverview";
import type { StatisticResult } from "../statistics.utils";
import { Text } from "../../../Text";
import { t } from "i18next";
import { SupportChart } from "./Chart";
import type { HistoryItem } from "../../../../../logic/application/StateHandler";
import { CampaignConfig, CampaignState, FinalResults } from "@/shared/types";

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
  const percentage = results.percentages[playerSide];

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex gap-2 mb-2">
        <MandateOverview
          all={config.electionConfig.allSeats - config.electionConfig.listSeats}
          mandates={party?.constituencySeats ?? 0}
          label={t("endResult.statistics.overview.constituencySeats")}
        />
        <MandateOverview
          all={config.electionConfig.listSeats}
          mandates={party?.listSeats ?? 0}
          label={t("endResult.statistics.overview.listSeats")}
        />
        <PercentagesOverview
          label={t("endResult.statistics.overview.partyListResults")}
          percentage={Number(percentage.toFixed(2)) * 100}
        />
      </div>
      <div className="flex gap-2">
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
