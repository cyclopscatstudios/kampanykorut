import { QuestionCard } from "../components/ui/gameplay/QuestionCard";
import questions from "../assets/jsons/2022/2022_questions.json";

export function QuestionCardDev() {
  const obj = questions[0];
  return (
    <QuestionCard
      id={obj.id}
      possibleAnswers={obj.possibleAnswers}
      question={obj.question}
      currentQuestion={0}
      setCurrentQuestion={() => {}}
      setCurrentView={() => {}}
    />
  );
}
