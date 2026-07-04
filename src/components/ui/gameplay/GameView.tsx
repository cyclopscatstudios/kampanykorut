import {
  CampaignState,
  CurrentView,
  District,
  DistrictPoligon,
  FinalResults,
  PollingOpnions,
} from "@/shared/types";
import { MapCreator } from "./MapCreator";
import { QuestionCard } from "./QuestionCard";
import { VoteCountingScreen } from "./VoteCountingScreen/VoteCountingScreen";

type GameViewConfig = {
  capitalCity: DistrictPoligon[];
  districts: DistrictPoligon[];
};

interface GameViewProps {
  currentView: CurrentView;
  state: CampaignState;
  pollsData: PollingOpnions | null;
  config: GameViewConfig;
  answer: string | undefined;
  selectedDistrict: District | null;
  getFinalResults: () => FinalResults | null;
  onAnswer: (id?: string) => void;
  onSetAnswer: (answer: string | undefined) => void;
  onSetView: (view: CurrentView) => void;
  onSetDistrict: (district: District | null) => void;
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

  return (
    /*<VoteCountingScreen
      processedVotes={3286541}
      totalVotes={5263035}
      onComplete={() => {}} // 3mp után hívódik
    />*/
    <MapCreator
      setCurrentView={onSetView}
      candidateListData={
        pollsData?.candidateListData ?? state.candidateListData ?? []
      }
      capitalCity={config.capitalCity}
      districts={config.districts}
      selectedDistrict={selectedDistrict}
      setSelectedDistrict={onSetDistrict}
    />
  );
}
