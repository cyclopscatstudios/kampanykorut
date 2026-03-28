import type { Story } from "@ladle/react";
import { QuestionCard } from "../components/ui/gameplay/QuestionCard";
import { noop } from "./FunctionUtils";
import { useState } from "react";

export const Default: Story = () => {
  const [answer, setAnswer] = useState("");
  const question =
    "2021 őszén megnyered az ellenzéki előválasztást, így te leszel az összefogás közös miniszterelnök-jelöltje. A pártok között még van bizalmatlanság, de a nyilvánosságban nagy a várakozás.";
  const possibleAnswers = [
    {
      id: "A",
      label:
        "Nyilvánosan hangsúlyozod a függetlenségedet: „Én senkinek nem vagyok az embere, a pártok csak eszközök a rendszer leváltásához. ”",
    },
    {
      id: "B",
      label:
        "Az első nagy kampánybeszédben külön-külön megdicséred az összes részt vevő pártot és vezetőjét: „Mostantól egy csapat vagyunk.”",
    },
    {
      id: "C",
      label:
        "Kijelented, hogy „a régi baloldal is hibázott”, és időnként kritizálod Gyurcsány Ferencet.",
    },
    {
      id: "D",
      label:
        "Először zárt ajtók mögött egyeztetsz a pártelnökökkel, és csak ezután tartasz nagy nyilvános beszédet.",
    },
  ];

  return (
    <QuestionCard
      id="question-1"
      question={question}
      possibleAnswers={possibleAnswers}
      cityName="Budapest"
      handleOnClick={noop}
      setAnswer={setAnswer}
      answer={answer}
      setCurrentView={noop}
      affects={[{ "id": "A" }, { "id": "C" }]}
    />
  );
};
