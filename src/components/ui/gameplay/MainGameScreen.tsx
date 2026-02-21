import { useState } from "react";
import { MapCreator } from "./MapCreator";
import questions from "../../../assets/jsons/2022/2022_questions.json";
import { QuestionCard } from "./QuestionCard";
import { useElectionState } from "../../../logic/application/hooks/useElectionState";
import { Button } from "../Button";

export type CurrentView = "MapView" | "QuestionView";

export function MainGameScreen({ gameId }: { gameId: string }) {
  const [currentView, setCurrentView] = useState<CurrentView>("MapView");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { state, config, handleAnwerQuestion, loadSavedGame } =
    useElectionState(gameId);

  const handleOnClick = (id?: string) => {
    handleAnwerQuestion(id);
    setCurrentView("MapView");
  };

  return (
    <ScreenWrapper loadSavedGame={loadSavedGame}>
      {currentView === "MapView" ? (
        <MapCreator
          setCurrentView={setCurrentView}
          candidateListData={state.candidateListData}
          capitalCity={config.capitalCity}
          districts={config.districts}
        />
      ) : (
        <QuestionCard
          id={questions[currentQuestion].id}
          title={questions[currentQuestion].title}
          question={questions[currentQuestion].question}
          possibleAnswers={questions[currentQuestion].possibleAnswers}
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
    <div className="w-full">
      <div>
        <Button onClick={loadSavedGame} size="small">
          <Button.Text>Load saved game</Button.Text>
        </Button>
      </div>
      {children}
    </div>
  );
}
