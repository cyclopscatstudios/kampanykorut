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
import { Modal } from "../Modal";
import { useNavigation } from "../../../hooks/navigationHook";

export type CurrentView = "MapView" | "QuestionView" | "FinalScreen";

export function MainGameScreen({ campaignId }: { campaignId: string }) {
  const [isSettingsOpen, setIsOpenSettings] = useState(false);
  const [isGameMenuOpen, setIsOpenGameMenu] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<CurrentView>("MapView");
  const [answer, setAnswer] = useState<string | undefined>();
  const [advisorFeedback, setAdvisorFeedback] = useState<AnswerFeedback | null>(
    null,
  );
  const [pendingTurn, setPendingTurn] = useState<PendingTurn | null>(null);
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictResult | null>();

  const { state, config, processAnswer, commitTurn, getFinalResults } =
    useElectionState(campaignId);

  const { goToMainMenu } = useNavigation();

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
      isSettingsOpen={isSettingsOpen}
      isGameMenuOpen={isGameMenuOpen}
      isExitModalOpen={isExitModalOpen}
      setIsOpenSettings={setIsOpenSettings}
      setIsOpenGameMenu={setIsOpenGameMenu}
      setIsExitModalOpen={setIsExitModalOpen}
    >
      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsOpenSettings} />
      <GameDialog isOpen={isGameMenuOpen} setIsOpen={setIsOpenGameMenu} />
      {isExitModalOpen && (
        <ConfirmExitGameModal
          onCancel={() => setIsExitModalOpen(false)}
          onConfirm={() => {
            setIsExitModalOpen(false);
            goToMainMenu();
          }}
        />
      )}
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
  isSettingsOpen,
  isGameMenuOpen,
  isExitModalOpen,
  setIsOpenGameMenu,
  setIsOpenSettings,
  setIsExitModalOpen,
}: {
  children: React.ReactNode;
  isSettingsOpen: boolean;
  isGameMenuOpen: boolean;
  isExitModalOpen: boolean;
  setIsOpenGameMenu: (val: boolean) => void;
  setIsOpenSettings: (val: boolean) => void;
  setIsExitModalOpen: (val: boolean) => void;
}) {
  return (
    <div className="w-full h-full">
      <GameMenuBar
        isSettingsOpen={isSettingsOpen}
        isGameMenuOpen={isGameMenuOpen}
        isExitModalOpen={isExitModalOpen}
        setIsExitModalOpen={setIsExitModalOpen}
        setIsOpenGameMenu={setIsOpenGameMenu}
        setIsOpenSettings={setIsOpenSettings}
      />
      {children}
    </div>
  );
}

interface ConfirmExitGameModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmExitGameModal({
  onCancel,
  onConfirm,
}: ConfirmExitGameModalProps) {
  return (
    <Modal
      title="Attention"
      description="Are you sure you want to exist the game?"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
