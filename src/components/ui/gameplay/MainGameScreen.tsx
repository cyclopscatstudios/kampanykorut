import { useState } from "react";
import { MapCreator } from "./MapCreator";
import { QuestionCard } from "./QuestionCard";
import { useElectionState } from "../../../logic/application/hooks/useElectionState";
import { Button } from "../Button";
import { FinalResultScreen } from "./FinalResultScreen/EndResultScreen";
import type { DistrictResult } from "../map.utils";
import { AdvisorModal } from "./AdvisorModal";
import type { GameState } from "../../../logic/domain/CampaignEngine";
import type {
  AnswerFeedback,
  PendingTurn,
} from "../../../logic/application/types";
import logo from "../../../assets/logo_reworked.png";
import { Text } from "../Text";

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
        asset={{
          primaryAdvisorImageUri:
            config.advisorFeedbackAssets.primaryAdvisorImageUri,
          secondaryAdvisorImageUri:
            config.advisorFeedbackAssets.secondaryAdvisorImageUri,
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
        />
      )}
    </ScreenWrapper>
  );
}

function ScreenWrapper({
  children,
}: {
  children: React.ReactNode;
  loadSavedGame: () => void;
}) {
  return (
    <div className="w-full h-full">
      <div>
        <MenuBar />
      </div>
      {children}
    </div>
  );
}

function MenuBar() {
  return (
    <div className="w-full border-b-2 border-blue-400">
      <div className="flex justify-between items-center mx-5">
        <div className="flex justify-center items-center gap-2">
          <div className="flex justify-center items-center">
            <img src={logo} className="size-5 mr-3" />
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              KAMPÁNYKÖRÚT
            </Text>
          </div>
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              MAP
            </Text>
          </Button>
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              DASHBOARD
            </Text>
          </Button>
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              SAVE
            </Text>
          </Button>
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              LOAD
            </Text>
          </Button>
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              SETTINGS
            </Text>
          </Button>
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              LANGUAGE
            </Text>
          </Button>
        </div>
      </div>
    </div>
  );
}
