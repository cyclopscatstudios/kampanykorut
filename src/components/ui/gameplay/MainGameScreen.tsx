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
import { GameMenuBar } from "./GameMenuBar";
import { GameDialog } from "./GameDialog";

export type CurrentView = "MapView" | "QuestionView" | "FinalScreen";

export function MainGameScreen({ campaignId }: { campaignId: string }) {
  const [isSettingsOpen, setIsOpenSettings] = useState(false);
  const [isSettingsGameMenu, setIsOpenGameMenu] = useState(false);
  const [currentView, setCurrentView] = useState<CurrentView>("MapView");
  const [answer, setAnswer] = useState<string | undefined>();
  const [advisorFeedback, setAdvisorFeedback] = useState<AnswerFeedback | null>(
    null,
  );
  const [pendingTurn, setPendingTurn] = useState<PendingTurn | null>(null);
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictResult | null>();

  const {
    state,
    config,
    processAnswer,
    commitTurn,
    loadSavedGame,
    getFinalResults,
  } = useElectionState(campaignId);

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
    if (!pending) {
      return;
    }

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
    <GameScreenWrapper
      loadSavedGame={loadSavedGame}
      setIsOpenSettings={setIsOpenSettings}
      setIsOpenGameMenu={setIsOpenGameMenu}
    >
      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsOpenSettings} />
      <GameDialog isOpen={isSettingsGameMenu} setIsOpen={setIsOpenGameMenu} />
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
    </GameScreenWrapper>
  );
}

function GameScreenWrapper({
  children,
  setIsOpenGameMenu,
  setIsOpenSettings,
}: {
  children: React.ReactNode;
  loadSavedGame: () => void;
  setIsOpenGameMenu: (val: boolean) => void;
  setIsOpenSettings: (val: boolean) => void;
}) {
  return (
    <div className="w-full h-full">
      <GameMenuBar
        setIsOpenGameMenu={setIsOpenGameMenu}
        setIsOpenSettings={setIsOpenSettings}
      />
      {children}
    </div>
  );
}
