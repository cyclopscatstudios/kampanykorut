import { useState } from "react";
import { MapCreator } from "./MapCreator";
import questions from "../../../assets/jsons/2022/2022_questions.json";
import { QuestionCard } from "./QuestionCard";
import { useElectionState } from "../../../logic/application/hooks/useElectionState";

export type CurrentView = "MapView" | "QuestionView";

export function MainGameScreen({ gameId }: { gameId: string }) {
  const [currentView, setCurrentView] = useState<CurrentView>("MapView");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { state, config, handleAnwerQuestion } = useElectionState(gameId);

  const handleOnClick = (id?: string) => {
    handleAnwerQuestion(id);
    setCurrentView("MapView");
  };

  return currentView === "MapView" ? (
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
  );
}
