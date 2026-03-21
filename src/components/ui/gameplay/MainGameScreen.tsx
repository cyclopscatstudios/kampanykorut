import { useState } from "react";
import { MapCreator } from "./MapCreator";
import { QuestionCard } from "./QuestionCard";
import {
  useElectionState,
  type AnswerFeedback,
  type PendingTurn,
} from "../../../logic/application/hooks/useElectionState";
import { Button } from "../Button";
import { FinalResultScreen } from "./FinalResultScreen/EndResultScreen";
import type { DistrictResult } from "../map.utils";
import { AdvisorModal } from "./AdvisorModal";
import type { GameState } from "../../../logic/domain/CampaignEngine";

export type CurrentView = "MapView" | "QuestionView" | "FinalScreen";

export function MainGameScreen({ gameId }: { gameId: string }) {
  const [currentView, setCurrentView] = useState<CurrentView>("MapView");
  const [answer, setAnswer] = useState<string | undefined>();
  const [advisorFeedback, setAdvisorFeedback] = useState<AnswerFeedback | null>(
    null,
  );
  const [pendingTurn, setPendingTurn] = useState<PendingTurn | null>(null);
  const {
    state,
    config,
    processAnswer,
    commitTurn,
    loadSavedGame,
    getFinalResults,
  } = useElectionState(gameId);
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictResult | null>();

  const applyTurnResult = (result: GameState) => {
    if (result.isEnded) {
      setCurrentView("FinalScreen");
      return;
    }
    if (result.turn % 2 === 0) {
      setCurrentView("MapView");
    }
  };

  const handleOnClick = (id?: string) => {
    const pending = processAnswer(id, selectedDistrict);
    if (!pending) return;

    if (pending.newGameState.advisorFeedback) {
      setAdvisorFeedback(pending.newGameState.advisorFeedback);
      setPendingTurn(pending);
      return;
    }
    applyTurnResult(commitTurn(pending));
    setAnswer("");
  };

  const handleAdvisorClose = () => {
    setAdvisorFeedback(null);
    if (pendingTurn) {
      applyTurnResult(commitTurn(pendingTurn));
      setPendingTurn(null);
      setAnswer("");
    }
  };

  return (
    <ScreenWrapper loadSavedGame={loadSavedGame}>
      <AdvisorModal
        advice={advisorFeedback?.text ?? ""}
        open={Boolean(advisorFeedback)}
        onClose={handleAdvisorClose}
        img1={config.advisorFeedbackAssets.primaryAdvisorImageUri}
        img2={config.advisorFeedbackAssets.secondaryAdvisorImageUri}
      />
      {currentView === "MapView" ? (
        <MapCreator
          setCurrentView={setCurrentView}
          candidateListData={state.candidateListData}
          capitalCity={config.capitalCity}
          districts={config.districts}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
        />
      ) : currentView === "FinalScreen" ? (
        <FinalResultScreen results={getFinalResults()} />
      ) : (
        <QuestionCard
          id={state.currentQuestion?.id ?? ""}
          question={state.currentQuestion?.question ?? ""}
          possibleAnswers={state.currentQuestion?.possibleAnswers ?? []}
          affects={state.currentQuestion?.affects}
          answer={answer}
          setAnswer={setAnswer}
          setCurrentView={setCurrentView}
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
    <div className="w-full h-full">
      <div>
        <Button onClick={loadSavedGame} size="small">
          <Button.Text>Load saved game</Button.Text>
        </Button>
      </div>
      {children}
    </div>
  );
}
