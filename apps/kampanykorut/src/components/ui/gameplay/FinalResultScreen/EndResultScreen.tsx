import { useState } from "react";
import { useLoaderData } from "react-router";
import { container } from "tsyringe";
import { useTranslate } from "../../../../../../../shared/logic/hooks/useTranslateLang";
import { StateEngine } from "../../../../logic/application/StateEngine";
import { Button } from "../../../../../../../shared/ui/Button";
import { GameChrome } from "../GameChrome";
import { ElectionMap } from "./ElectionMap";
import { Statistics } from "./Statistics/Statistics";
import { SummaryPage } from "./SummaryPage";
import { TurnHistory } from "./TurnHistory";

const screens = [
  { id: "summaryPage", label: "endResult.menuBar.summary" },
  { id: "electionMap", label: "endResult.menuBar.electionMap" },
  { id: "statistics", label: "endResult.menuBar.statistics" },
  { id: "history", label: "endResult.menuBar.history" },
] as const;

type ActiveScreen = (typeof screens)[number]["id"];

export function FinalResultScreen() {
  const { results, config } = useLoaderData();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("summaryPage");
  const stateEngine = container.resolve(StateEngine);
  const history = stateEngine.getHistory();
  const t = useTranslate();
  const state = stateEngine.getCampaignState();

  return (
    <GameChrome config={config} state={state ?? undefined}>
      <div className="m-2">
        <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-200/65">
          <div className="h-[620px] w-[1100px] mb-3">
            {activeScreen === "statistics" && (
              <Statistics results={results} config={config} />
            )}
            {activeScreen === "summaryPage" && (
              <SummaryPage results={results} />
            )}
            {activeScreen === "electionMap" && <ElectionMap config={config} />}
            {activeScreen === "history" && (
              <TurnHistory
                history={history}
                config={config}
                playerSideId={state?.playerSide?.partyId}
                playerCandidateId={state?.playerSide?.candidateId}
              />
            )}
          </div>
        </div>
        <div className="flex gap-5 w-full justify-center mt-5">
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
    </GameChrome>
  );
}
