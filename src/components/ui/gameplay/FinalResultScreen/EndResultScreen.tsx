import { useState } from "react";
import { Button } from "../../Button";
import { SummaryPage } from "./SummaryPage";
import { useTranslate } from "../../../../logic/useTranslateLang";
import { useLoaderData } from "react-router";
import { ElectionMap } from "./ElectionMap";

const screens = [
  { id: "summaryPage", label: "endResult.menuBar.summary" },
  { id: "electionMap", label: "endResult.menuBar.electionMap" },
  { id: "statistics", label: "endResult.menuBar.statistics" },
  { id: "history", label: "endResult.menuBar.history" },
];

type ActiveScreen = (typeof screens)[number]["id"];

export function FinalResultScreen() {
  const { results, config } = useLoaderData();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("summaryPage");
  const t = useTranslate();

  return (
    <div className="m-2">
      <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-200/65">
        <div className="h-[620px] mb-3">
          {activeScreen === "summaryPage" && <SummaryPage results={results} />}
          {activeScreen === "electionMap" && <ElectionMap config={config} />}
        </div>
        <div className="flex gap-5 w-full justify-center">
          {screens.map((screen) => {
            return (
              <Button
                key={screen.id}
                disabled={activeScreen === screen.id}
                onClick={() => setActiveScreen(screen.id)}
              >
                <Button.Text>{t(screen.label)}</Button.Text>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
