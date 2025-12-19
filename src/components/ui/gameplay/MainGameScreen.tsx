import { useState } from "react";
import { MapCreator } from "./MapCreator";
import questions from "../../../assets/jsons/2022/2022_questions.json";
import { QuestionCard } from "./QuestionCard";

export type CurrentView = "MapView" | "QuestionView";

export function MainGameScreen() {
  const [currentView, setCurrentView] = useState<CurrentView>("MapView");
  const [currentQuestion, setCurrentQuestion] = useState(0);

  return currentView === "MapView" ? (
    <MapCreator setCurrentView={setCurrentView} />
  ) : (
    <QuestionCard
      id={questions[currentQuestion].id}
      question={questions[currentQuestion].question}
      possibleAnswers={questions[currentQuestion].possibleAnswers}
      setCurrentView={setCurrentView}
      currentQuestion={currentQuestion}
      setCurrentQuestion={setCurrentQuestion}
    />
  );
}
