import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { noop } from "@/logic/application";
import {
  CampaignConfig,
  CampaignState,
  CandidateListData,
  Colors,
  CurrentView,
  District,
  DistrictPoligon,
  FinalResults,
  PollingOpnions,
} from "@/shared/types";
import { Icon, Text } from "@/shared/ui";
import { Button } from "@/shared/ui/Button";
import { getPartyColor } from "../color.utils";
import { getWinnerResultByCandidateList } from "../map.utils";
import { getSwingFactorTextColor } from "./BottomBar";
import { getSwingFactorByDistrict, MapCreator } from "./MapCreator";
import { QuestionCard } from "./QuestionCard";
import { VoteCountingScreen } from "./VoteCountingScreen/VoteCountingScreen";

interface GameViewProps {
  currentView: CurrentView;
  state: CampaignState;
  pollsData: PollingOpnions | null;
  config: CampaignConfig;
  answer: string | undefined;
  selectedDistrict: District | null;
  getFinalResults: () => FinalResults | null;
  onAnswer: (id?: string) => void;
  onSetAnswer: (answer: string | undefined) => void;
  onSetView: (view: CurrentView) => void;
  onSetDistrict: (district: District | null) => void;
  onVoteCountingComplete: () => void;
}

export function GameView({
  currentView,
  state,
  pollsData,
  config,
  answer,
  selectedDistrict,
  onAnswer,
  onSetAnswer,
  onSetView,
  onSetDistrict,
  onVoteCountingComplete,
}: GameViewProps) {
  if (currentView === "QuestionView") {
    return (
      <QuestionCard
        id={state.currentQuestion?.id ?? ""}
        question={state.currentQuestion?.question ?? ""}
        possibleAnswers={state.currentQuestion?.possibleAnswers ?? []}
        affects={state.currentQuestion?.affects}
        answer={answer}
        setAnswer={onSetAnswer}
        setCurrentView={onSetView}
        handleOnClick={onAnswer}
        cityName={selectedDistrict?.telepules}
      />
    );
  }

  if (currentView === "VoteCountingView") {
    return (
      <VoteCountingScreen
        onComplete={onVoteCountingComplete}
        totalVotes={config.voterEnvironmentConfig.eligibleVoters}
        processedVotes={state.results?.totals.partyListResults["_total"]}
      />
    );
  }

  const capitalCity = getCapitalCity(config.districts);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? (
    <MapCreator
      setCurrentView={onSetView}
      candidateListData={
        pollsData?.candidateListData ?? state.candidateListData ?? []
      }
      capitalCity={capitalCity}
      districts={config.districts}
      selectedDistrict={selectedDistrict}
      setSelectedDistrict={onSetDistrict}
      electionConfig={config.electionConfig}
    />
  ) : (
    <DistrictList
      config={config}
      state={state}
      onSetDistrict={onSetDistrict}
      onSetView={onSetView}
    />
  );
}

function getCapitalCity(districts: DistrictPoligon[]) {
  return districts.filter((district) => district.maz.startsWith("01"));
}

interface DistrictListProps {
  config: CampaignConfig;
  state: CampaignState;
  onSetDistrict: (district: District | null) => void;
  onSetView: (currentView: CurrentView) => void;
}

// for narrow screens
function DistrictList({
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

  useEffect(() => {
    if (!openCounty) {
      setSelectedDistrict(null);
    }
  }, [openCounty]);

  const uniqueDistricts = [
    ...new Map(
      state.candidateListData?.map((district) => [district.megye, district]),
    ).values(),
  ];

  console.log({ uniqueDistricts });

  return (
    <div className="h-full overflow-y-auto p-2">
      {uniqueDistricts.map((district) => {
        const isOpen = openCounty === district.megye;

        const countyDistricts =
          state.candidateListData?.filter(
            (item) => item.megye === district.megye,
          ) ?? [];

        console.log({ countyDistricts });

        return (
          <div key={district.megye} className="mb-4">
            <button
              type="button"
              className="w-full bg-blue-400/10 rounded-md border border-blue-50/10 p-4 text-left cursor-pointer"
              style={{
                borderLeft: "4px solid blue",
              }}
              onClick={() =>
                setOpenCounty((current) =>
                  current === district.megye ? null : district.megye,
                )
              }
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
                          "bg-blue-50":
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
      {selectedDistrict && openCounty && (
        <div className="absolute bottom-0 left-0 z-10 h-[180px] w-full ">
          <div className="h-full border-t border-blue-50/80 rounded-t-lg bg-[rgba(15,23,42,1)]">
            <div className="flex justify-between p-4">
              <div>
                <Text weight="bold">{selectedDistrict.megye}</Text>
                <Text weight="light">{selectedDistrict.telepules}</Text>
                <Text>{population}</Text>
                <Text color={textColor as Colors}>{swingFactor.label}</Text>
              </div>
              <Button
                variant="underline"
                onClick={() => setSelectedDistrict(null)}
              >
                <Button.Icon name="x-circle-fill" />
              </Button>
            </div>
            <div className="w-full px-4">
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
