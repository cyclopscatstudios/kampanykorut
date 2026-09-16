import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import {
  CampaignConfig,
  CampaignState,
  CurrentView,
  District,
  DistrictPoligon,
  FinalResults,
  PollingOpnions,
} from "@/shared/types";
import { DistrictList } from "./DistrictList";
import { MapCreator } from "./MapCreator";
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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const skipVoteCounting = currentView === "VoteCountingView" && !isDesktop;
  useEffect(() => {
    if (skipVoteCounting) {
      onVoteCountingComplete();
    }
  }, [skipVoteCounting]);

  if (skipVoteCounting) {
    return null;
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
        processedVotes={state.results?.totals.partyListResults["_total"]}
      />
    );
  }

  const capitalCity = getCapitalCity(config.districts);

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
