import classNames from "classnames";
import { t } from "i18next";
import { useState } from "react";
import {
  CampaignConfig,
  CampaignState,
  CandidateListData,
  Colors,
  CurrentView,
  District,
} from "@/shared/types";
import { Text } from "@/shared/ui";
import { Button } from "@/shared/ui/Button";
import { getPartyColor } from "../color.utils";
import { getWinnerResultByCandidateList } from "../map.utils";
import {
  getSwingFactorByDistrict,
  getSwingFactorTextColor,
} from "./swingFactor.utils";

interface DistrictListProps {
  config: CampaignConfig;
  state: CampaignState;
  onSetDistrict: (district: District | null) => void;
  onSetView: (currentView: CurrentView) => void;
}

// for narrow screens
export function DistrictList({
  config,
  state,
  onSetDistrict,
  onSetView,
}: DistrictListProps) {
  const [openCounty, setOpenCounty] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] =
    useState<CandidateListData | null>(null);

  const population = Math.round((selectedDistrict?.valasztopolgar ?? 0) / 1000);
  const swingFactor = getSwingFactorByDistrict(
    undefined,
    selectedDistrict ?? undefined,
  );
  const textColor = getSwingFactorTextColor(swingFactor?.id);

  const uniqueDistricts = [
    ...new Map(
      state.candidateListData?.map((district) => [district.megye, district]),
    ).values(),
  ];

  function getMostSuccessfulParty(districts: CandidateListData[]) {
    const wins: Record<string, number> = {};

    for (const district of districts) {
      const [winner] = Object.entries(district.partok).reduce(
        (best, current) =>
          (current[1] ?? 0) > (best[1] ?? 0) ? current : best,
      );

      wins[winner] = (wins[winner] ?? 0) + 1;
    }

    const maxWins = Math.max(...Object.values(wins));

    const winners = Object.entries(wins)
      .filter(([, winCount]) => winCount === maxWins)
      .map(([party]) => party);

    return winners.length === 1 ? winners[0]! : "draw";
  }

  const isPanelOpen = Boolean(selectedDistrict && openCounty);

  return (
    <div className="relative h-full">
      <div
        className={classNames("h-full overflow-y-auto p-2", {
          "pb-40": isPanelOpen,
        })}
      >
        {uniqueDistricts.map((district) => {
          const isOpen = openCounty === district.megye;

          const countyDistricts =
            state.candidateListData?.filter(
              (item) => item.megye === district.megye,
            ) ?? [];

          const mostSuccessfulParty = getMostSuccessfulParty(countyDistricts);
          const partyColor =
            config?.electionConfig.parties.find(
              (party) => party.id === mostSuccessfulParty,
            )?.color ?? "";

          return (
            <div key={district.megye} className="mb-4">
              <button
                type="button"
                className="w-full bg-blue-400/10 rounded-md border border-blue-50/10 p-4 text-left cursor-pointer"
                style={{
                  borderLeft: `4px solid ${partyColor}`,
                }}
                onClick={() => {
                  setOpenCounty((current) =>
                    current === district.megye ? null : district.megye,
                  );
                  if (isOpen) {
                    setSelectedDistrict(null);
                  }
                }}
              >
                <div>
                  <Text weight="bold">{district.megye}</Text>
                  <Text weight="light">{countyDistricts.length} kerület</Text>
                </div>
              </button>
              {isOpen && (
                <div className="ml-4 mt-2 space-y-2">
                  {countyDistricts.map((item) => {
                    const winnerResult = getWinnerResultByCandidateList(item);
                    const { winner, diffPercentage } = winnerResult;

                    const partyColor =
                      config?.electionConfig.parties.find(
                        (party) => party.id === winner,
                      )?.color ?? "";
                    const color = getPartyColor(
                      partyColor,
                      diffPercentage,
                      false,
                    );

                    return (
                      <div
                        style={{
                          borderLeft: `4px solid ${color}`,
                        }}
                        key={`${item.megyekod}-${item.oevk}`}
                        className={classNames(
                          "rounded-md border p-3 border-blue-50/10 bg-blue-400/10 cursor-pointer",
                          {
                            "border-blue-500 border-2":
                              selectedDistrict &&
                              selectedDistrict.oevk === item.oevk &&
                              selectedDistrict.megyekod === item.megyekod,
                          },
                        )}
                        onClick={() => {
                          setSelectedDistrict(item);
                          onSetDistrict(item as any);
                        }}
                      >
                        <div>
                          <Text weight="medium">{item.oevk}. OEVK</Text>
                          <Text weight="light">{item.telepules}</Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedDistrict && openCounty && (
        <div className="absolute bottom-0 left-0 z-10 w-full">
          <div className="flex flex-col border-t border-blue-50/80 rounded-t-lg bg-[rgba(15,23,42,1)]">
            <div className="flex justify-between p-4">
              <div className="w-full">
                <Text weight="bold">{selectedDistrict.megye}</Text>
                <Text weight="light">{selectedDistrict.telepules}</Text>
                <div className="flex items-center justify-between">
                  <Text color="gray" weight="medium">
                    {t("bottomBar.population")}
                  </Text>
                  <Text>
                    {population}
                    {t("bottomBar.k")}
                  </Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text color="gray" weight="medium">
                    {t("bottomBar.swingFactor")}
                  </Text>
                  <Text color={textColor as Colors}>{swingFactor.label}</Text>
                </div>
              </div>
              <Button
                variant="underline"
                onClick={() => setSelectedDistrict(null)}
              >
                <Button.Icon name="x-circle-fill" />
              </Button>
            </div>
            <div className="w-full px-4 pb-4">
              <Button onClick={() => onSetView("QuestionView")} block>
                <Button.Text>{t("bottomBar.visitDistrict")}</Button.Text>
                <Button.Icon name="arrow-right" color="white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
