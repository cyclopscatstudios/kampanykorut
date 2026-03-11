import { useState } from "react";
import { MapCreator } from "./MapCreator";
import questions from "../../../assets/jsons/2022/2022_questions.json";
import { QuestionCard } from "./QuestionCard";
import { useElectionState } from "../../../logic/application/hooks/useElectionState";
import { Button } from "../Button";
import { FinalResultScreen } from "./FinalResultScreen/EndResultScreen";
import type { DistrictResult } from "../map.utils";

export type CurrentView = "MapView" | "QuestionView" | "FinalScreen";

export function MainGameScreen({ gameId }: { gameId: string }) {
  const [currentView, setCurrentView] = useState<CurrentView>("MapView");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState<string | undefined>();
  const { state, config, handleAnwerQuestion, loadSavedGame, getFinalResults } =
    useElectionState(gameId);
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictResult | null>();

  const handleOnClick = (id?: string) => {
    if (state.isEnded) {
      setCurrentView("FinalScreen");
      return;
    }
    handleAnwerQuestion(id, selectedDistrict as any);
    setAnswer("");
    if (state.turn > 0 && state.turn % 2) {
      setCurrentView("MapView");
    }
  };

  return (
    <ScreenWrapper loadSavedGame={loadSavedGame}>
      {currentView === "MapView" ? (
        <MapCreator
          setCurrentView={setCurrentView}
          candidateListData={state.candidateListData}
          capitalCity={config.capitalCity}
          districts={config.districts}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
        />
      ) : currentView === "FinalScreen" ? (
        <FinalResultScreen results={getFinalResults()} />
      ) : (
        <QuestionCard
          id={questions[currentQuestion].id}
          question={questions[currentQuestion].question}
          possibleAnswers={questions[currentQuestion].possibleAnswers}
          answer={answer}
          setAnswer={setAnswer}
          setCurrentView={setCurrentView}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          handleOnClick={handleOnClick}
        />
      )}
    </ScreenWrapper>
  );
}

function ScreenWrapper({
  children,
  loadSavedGame,
}: {
  children: React.ReactNode;
  loadSavedGame: () => void;
}) {
  return (
    <div className="w-full h-full">
      <div>
        <Button onClick={loadSavedGame} size="small">
          <Button.Text>Load saved game</Button.Text>
        </Button>
      </div>
      {children}
    </div>
  );
}
