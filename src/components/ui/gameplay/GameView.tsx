import type { CurrentView } from "./MainGameScreen";
import { MapCreator } from "./MapCreator";
import { QuestionCard } from "./QuestionCard";
import {
  CampaignState,
  District,
  DistrictPoligon,
  FinalResults,
} from "@/shared/types";

type GameViewConfig = {
  capitalCity: DistrictPoligon[];
  districts: DistrictPoligon[];
};

interface GameViewProps {
  currentView: CurrentView;
  state: CampaignState;
  config: GameViewConfig;
  answer: string | undefined;
  selectedDistrict: District | null;
  getFinalResults: () => FinalResults;
  onAnswer: (id?: string) => void;
  onSetAnswer: (answer: string | undefined) => void;
  onSetView: (view: CurrentView) => void;
  onSetDistrict: (district: District | null) => void;
}

export function GameView({
  currentView,
  state,
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
    <MapCreator
      setCurrentView={onSetView}
      candidateListData={state.candidateListData ?? []}
      capitalCity={config.capitalCity}
      districts={config.districts}
      selectedDistrict={selectedDistrict}
      setSelectedDistrict={onSetDistrict}
    />
  );
}
