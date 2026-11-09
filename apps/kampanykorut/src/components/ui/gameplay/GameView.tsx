import { type ReactNode, useEffect, useMemo } from "react";
import { useMediaQuery } from "usehooks-ts";
import {
  buildSeatCountView,
  getParliamentaryConfig,
  hasCapitalInset,
  isCityDistrictMap,
  isFocusRequired,
  isProportionalElection,
} from "@/shared/domain";
import {
  CampaignConfig,
  CampaignState,
  CurrentView,
  District,
  DistrictPoligon,
  PollingOpnions,
} from "@/shared/types";
import { MapCreator } from "./MapCreator";
import { MobileMapView } from "./MobileMapView";
import { QuestionCard } from "./QuestionCard";
import { SeatCountScreen } from "./VoteCountingScreen/SeatCountScreen";
import { VoteCountingScreen } from "./VoteCountingScreen/VoteCountingScreen";

interface GameViewProps {
  currentView: CurrentView;
  state: CampaignState;
  pollsData: PollingOpnions | null;
  config: CampaignConfig;
  answer: string | undefined;
  selectedDistrict: District | null;
  onAnswer: (id?: string) => void;
  onSetAnswer: (answer: string | undefined) => void;
  onSetView: (view: CurrentView) => void;
  onSetDistrict: (district: District | null) => void;
  onVoteCountingComplete: () => void;
  mapOverlay?: ReactNode;
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
  mapOverlay,
}: GameViewProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const proportional = getParliamentaryConfig(config.electionConfig);
  const seatCountView = useMemo(
    () =>
      isProportionalElection(proportional) && state.results
        ? buildSeatCountView(
            state.results,
            proportional.allSeats,
            proportional.listSeats,
          )
        : undefined,
    [proportional, state.results],
  );

  // The seat count is the reveal of a proportional election, so unlike the
  // generic counting animation it is shown on mobile too.
  const skipVoteCounting =
    currentView === "VoteCountingView" && !isDesktop && !seatCountView;
  useEffect(() => {
    if (skipVoteCounting) {
      onVoteCountingComplete();
    }
  }, [skipVoteCounting]);

  if (skipVoteCounting) {
    return null;
  }

  if (currentView === "VoteCountingView" && seatCountView) {
    return (
      <SeatCountScreen
        view={seatCountView}
        parties={config.electionConfig.parties}
        year={config.electionConfig.year}
        onComplete={onVoteCountingComplete}
      />
    );
  }

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

  if (currentView === "VoteCountingView" && isDesktop) {
    return (
      <VoteCountingScreen
        onComplete={onVoteCountingComplete}
        totalVotes={config.voterEnvironmentConfig.eligibleVoters}
        processedVotes={
          state.mayoralResult?.validVotes ??
          state.results?.totals.partyListResults["_total"]
        }
      />
    );
  }

  const visitBlocked = isFocusRequired(state, config);
  const isCityMap = isCityDistrictMap(config.electionConfig);
  const capitalCity = hasCapitalInset(config.electionConfig)
    ? getCapitalCity(config.districts)
    : [];
  const candidateListData =
    pollsData?.candidateListData ?? state.candidateListData ?? [];
  const percentages = pollsData?.percentages ?? state.results?.percentages;
  const nationalPercentages = isCityMap
    ? percentages?.candidateListResults
    : percentages?.partyListResults;

  return isDesktop ? (
    <MapCreator
      nationalPercentages={nationalPercentages}
      setCurrentView={onSetView}
      candidateListData={candidateListData}
      capitalCity={capitalCity}
      districts={config.districts}
      selectedDistrict={selectedDistrict}
      setSelectedDistrict={onSetDistrict}
      electionConfig={config.electionConfig}
      visitBlocked={visitBlocked}
      mapOverlay={mapOverlay}
    />
  ) : (
    <MobileMapView
      isCityMap={isCityMap}
      districts={config.districts}
      capitalCity={capitalCity}
      candidateListData={candidateListData}
      electionConfig={config.electionConfig}
      nationalPercentages={nationalPercentages}
      selectedDistrict={selectedDistrict}
      onSetDistrict={onSetDistrict}
      onSetView={onSetView}
      visitBlocked={visitBlocked}
      mapOverlay={mapOverlay}
    />
  );
}

function getCapitalCity(districts: DistrictPoligon[]) {
  return districts.filter((district) => district.maz.startsWith("01"));
}
