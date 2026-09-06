import { useState } from "react";
import { useLoaderData } from "react-router";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import { createLogger } from "@/shared/logger/logger";
import { FinalResults } from "@/shared/types";
import { useTranslate } from "../../../../../../../shared/logic/hooks/useTranslateLang";
import { Button } from "../../../../../../../shared/ui/Button";
import { StateEngine } from "../../../../logic/application/StateEngine";
import { GameChrome } from "../GameChrome";
import { ElectionMap } from "./ElectionMap";
import { Statistics } from "./Statistics/Statistics";
import { SummaryPage } from "./SummaryPage";
import { TurnHistory } from "./TurnHistory";

const log = createLogger("FinalResultScreen");

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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const stateEngine = container.resolve(StateEngine);
  const history = stateEngine.getHistory();
  const t = useTranslate();
  const state = stateEngine.getCampaignState();

  // check the result of `_other`, which aggregates party-list votes cast for minor/other parties
  // `_other` is not an actual party and should not be displayed in the UI
  inspectResults(results);

  return (
    <GameChrome config={config} state={state ?? undefined}>
      <div className="m-2 flex flex-col flex-1 min-h-0 md:flex-none">
        <div className="bg-[#0f172a] p-3 md:p-5 rounded-xl border border-slate-200/65 flex flex-col flex-1 min-h-0 md:flex-none">
          <div className="flex-1 min-h-0 md:flex-none md:h-[620px] w-full md:w-[1100px] mb-3 overflow-y-auto md:overflow-y-visible">
            {!isDesktop && <SummaryPage results={results} />}
            {isDesktop && activeScreen === "statistics" && (
              <Statistics results={results} config={config} />
            )}
            {isDesktop && activeScreen === "summaryPage" && (
              <SummaryPage results={results} />
            )}
            {isDesktop && activeScreen === "electionMap" && (
              <ElectionMap config={config} />
            )}
            {isDesktop && activeScreen === "history" && (
              <TurnHistory
                history={history}
                config={config}
                playerSideId={state?.playerSide?.partyId}
                playerCandidateId={state?.playerSide?.candidateId}
              />
            )}
          </div>
        </div>
        {isDesktop && (
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
        )}
      </div>
    </GameChrome>
  );
}

function inspectResults(results: FinalResults) {
  const otherPercentage = results.percentages.partyListResults["_other"];
  const otherVoteCount = results.totals.partyListResults["_other"];
  if (otherPercentage > 0.01) {
    log.warn(
      "the _other vote share is greater than 1%. This is not necessarily an error, but check the campaign configuration if this was not intended.",
      {
        otherPercentage,
        otherVoteCount,
      },
    );
  }
}
