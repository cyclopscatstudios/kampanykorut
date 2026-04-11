import { useState } from "react";
import { MapCreator } from "./MapCreator";
import { QuestionCard } from "./QuestionCard";
import { useElectionState } from "@/logic/application";
import { FinalResultScreen } from "./FinalResultScreen/EndResultScreen";
import type { DistrictResult } from "../map.utils";
import { AdvisorModal } from "./AdvisorModal";
import type { GameState } from "../../../logic/domain/CampaignEngine";
import type {
  AnswerFeedback,
  PendingTurn,
} from "../../../logic/types/campaignEngine.types";
import { SettingsDialog } from "./SettingsDialog";
import { MenuBar } from "./GameMenuBar";

export type CurrentView = "MapView" | "QuestionView" | "FinalScreen";

export function MainGameScreen({ gameId }: { gameId: string }) {
  const [isOpen, setIsOpen] = useState(false);
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
    <ScreenWrapper loadSavedGame={loadSavedGame} setIsOpen={setIsOpen}>
      <SettingsDialog isOpen={isOpen} setIsOpen={setIsOpen} />
      <AdvisorModal
        advice={advisorFeedback?.text ?? ""}
        open={Boolean(advisorFeedback)}
        onClose={handleAdvisorClose}
        asset={{
          primaryAdvisorImageUri:
            config.advisorFeedbackAssets?.primaryAdvisorImageUri ?? "",
          secondaryAdvisorImageUri:
            config.advisorFeedbackAssets?.secondaryAdvisorImageUri ?? "",
        }}
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
          cityName={selectedDistrict?.telepules}
        />
      )}
    </ScreenWrapper>
  );
}

function ScreenWrapper({
  children,
  setIsOpen,
}: {
  children: React.ReactNode;
  loadSavedGame: () => void;
  setIsOpen: (val: boolean) => void;
}) {
  return (
    <div className="w-full h-full">
      <div>
        <MenuBar setIsOpen={setIsOpen} />
      </div>
      {children}
    </div>
  );
}
