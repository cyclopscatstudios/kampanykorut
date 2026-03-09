import { useState } from "react";
import type { FinalResults } from "../../../../logic/domain/CampaignEngine";
import { Button } from "../../Button";
import { SummaryPage } from "./SummaryPage";
import { useTranslate } from "../../../../logic/useTranslateLang";

const screens = [
  { id: "summaryPage", label: "endResult.menuBar.summary" },
  { id: "electionMap", label: "endResult.menuBar.electionMap" },
  { id: "statistics", label: "endResult.menuBar.statistics" },
  { id: "history", label: "endResult.menuBar.history" },
];

type ActiveScreen = (typeof screens)[number]["id"];

export function FinalResultScreen({ results }: { results: FinalResults }) {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("summaryPage");
  const t = useTranslate();

  return (
    <div className=" bg-[#0f172a] p-5 rounded-xl border border-slate-200/65">
      <div className="h-[700px]">
        {activeScreen === "summaryPage" && <SummaryPage results={results} />}
      </div>
      <div className="flex gap-5 w-full justify-center">
        {screens.map((screen) => {
          return (
            <Button
              disabled={activeScreen === screen.id}
              onClick={() => setActiveScreen(screen.id)}
            >
              <Button.Text>{t(screen.label)}</Button.Text>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
