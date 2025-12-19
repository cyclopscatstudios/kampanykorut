import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Text } from "../components/ui/Text";
import { UiKit } from "./UiKit";

type Page = "ui-kit";

function DevApp() {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  return (
    <div className="w-screen h-screen">
      <Text weight="bold" color="dark-blue" className="text-center">
        Dev testing
      </Text>
      <div className="flex gap-4 w-full justify-center">
        <Button onClick={() => setCurrentPage("ui-kit")}>
          <Button.Text>Ui-kit</Button.Text>
        </Button>
        <Button onClick={() => setCurrentPage(null)}>
          <Button.Text>Homepage</Button.Text>
        </Button>
      </div>
      {currentPage === "ui-kit" && <UiKit />}
    </div>
  );
}

export default DevApp;

[
  {
    id: "2022_ogyv-1",
    question: "Ami a helyzet : után van kérdés",
    possibleAnswers: [
      {
        id: 1,
        label: "válasz1",
      },
    ],
  },
];

const questions = [
  {
    id: 1,
    question:
      " 2021 ősze. Megnyerted az ellenzéki előválasztást, te vagy az összefogás közös miniszterelnök-jelöltje. A pártok bizalmatlanok, de a nyilvánosságban nagy várakozás van. Mit teszel?",
    possibleAnswers: [
      {
        id: 1,
        label:
          "Nyilvánosan hangsúlyozod a függetlenséged: “Én senkinek nem vagyok az embere, a pártok is csak eszközök a rendszer leváltásához.",
      },
      {
        id: 2,
        label:
          "A kampány első nagy beszédében külön-külön megdicséred az összes részt vevő pártot és vezetőjét, és azt mondod: “Mostantól egy csapat vagyunk, kész.”",
      },
      {
        id: 3,
        label:
          "Kijelented, hogy “a régi baloldal is bűnös”, és rendszeresen kritizálod Gyurcsány Ferencet – miközben a DK a legerősebb párt az összefogáson belül.",
      },
      {
        id: 4,
        label:
          "Zárt ajtók mögött leülsz a pártelnökökkel, és addig nem tartasz nagy nyilvános beszédet, amíg nincs közös, rövid üzenet, amit mindenki hajlandó ismételni.",
      },
    ],
  },
];
