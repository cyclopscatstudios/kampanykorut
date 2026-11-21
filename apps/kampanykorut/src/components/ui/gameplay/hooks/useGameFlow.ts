import { useReducer } from "react";
import {
  AnswerFeedback,
  CampaignState,
  CurrentView,
  District,
  PendingTurn,
} from "@/shared/types";

type PendingAdvisor = {
  feedback: AnswerFeedback;
  turn: PendingTurn;
};

export type GameFlowState = {
  currentView: CurrentView;
  answer: string | undefined;
  pendingAdvisor: PendingAdvisor | null;
  selectedDistrict: District | null;
  visitingDistrict: District | null;
  questionPaused: boolean;
};

export type GameFlowAction =
  | { type: "SELECT_DISTRICT"; district: District | null }
  | { type: "SET_ANSWER"; answer: string | undefined }
  | { type: "SHOW_ADVISOR"; feedback: AnswerFeedback; turn: PendingTurn }
  | { type: "DISMISS_ADVISOR" }
  | { type: "CHANGE_VIEW"; view: CurrentView }
  | { type: "PAUSE_QUESTION" }
  | { type: "RESUME_QUESTION" };

function gameFlowReducer(
  state: GameFlowState,
  action: GameFlowAction,
): GameFlowState {
  switch (action.type) {
    case "SELECT_DISTRICT":
      return { ...state, selectedDistrict: action.district };
    case "SET_ANSWER":
      return { ...state, answer: action.answer };
    case "SHOW_ADVISOR":
      return {
        ...state,
        pendingAdvisor: { feedback: action.feedback, turn: action.turn },
      };
    case "DISMISS_ADVISOR":
      return { ...state, pendingAdvisor: null, answer: undefined };
    case "CHANGE_VIEW":
      if (action.view === "QuestionView") {
        return {
          ...state,
          currentView: action.view,
          visitingDistrict: state.selectedDistrict,
          questionPaused: false,
        };
      }
      return { ...state, currentView: action.view, questionPaused: false };
    case "PAUSE_QUESTION":
      return { ...state, currentView: "MapView", questionPaused: true };
    case "RESUME_QUESTION":
      return {
        ...state,
        currentView: "QuestionView",
        selectedDistrict: state.visitingDistrict ?? state.selectedDistrict,
        questionPaused: false,
      };
  }
}

const initialState: GameFlowState = {
  currentView: "MapView",
  answer: undefined,
  pendingAdvisor: null,
  selectedDistrict: null,
  visitingDistrict: null,
  questionPaused: false,
};

type ProcessAnswer = (
  answer?: string,
  district?: District | null,
) => PendingTurn | undefined;

type CommitTurn = (pending: PendingTurn) => CampaignState;

export function useGameFlow(
  processAnswer: ProcessAnswer,
  commitTurn: CommitTurn,
  hasPendingAnnouncement: (state: CampaignState) => boolean = () => false,
) {
  const [flow, dispatch] = useReducer(gameFlowReducer, initialState);

  const applyTurnResult = (result: CampaignState) => {
    if (result.isEnded) {
      dispatch({
        type: "CHANGE_VIEW",
        view: hasPendingAnnouncement(result) ? "MapView" : "VoteCountingView",
      });
      return;
    }
    if (result.turn % 2 === 0) {
      dispatch({ type: "CHANGE_VIEW", view: "MapView" });
    }
  };

  const handleAnswer = (id?: string) => {
    const pending = processAnswer(id, flow.selectedDistrict);
    if (!pending) return;

    if (pending.newGameState.advisorFeedback) {
      dispatch({
        type: "SHOW_ADVISOR",
        feedback: pending.newGameState.advisorFeedback,
        turn: pending,
      });
      return;
    }

    applyTurnResult(commitTurn(pending));
    dispatch({ type: "SET_ANSWER", answer: undefined });
  };

  const handleAdvisorClose = () => {
    if (flow.pendingAdvisor) {
      applyTurnResult(commitTurn(flow.pendingAdvisor.turn));
    }
    dispatch({ type: "DISMISS_ADVISOR" });
  };

  return { flow, dispatch, handleAnswer, handleAdvisorClose };
}
