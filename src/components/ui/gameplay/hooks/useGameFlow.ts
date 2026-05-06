import { useReducer } from "react";
import type { CampaignState } from "../../../../logic/domain/CampaignEngine";
import type {
  AnswerFeedback,
  PendingTurn,
} from "../../../../logic/types/campaignEngine.types";
import type { DistrictResult } from "../../map.utils";
import type { CurrentView } from "../MainGameScreen";

type PendingAdvisor = {
  feedback: AnswerFeedback;
  turn: PendingTurn;
};

export type GameFlowState = {
  currentView: CurrentView;
  answer: string | undefined;
  pendingAdvisor: PendingAdvisor | null;
  selectedDistrict: DistrictResult | null;
};

export type GameFlowAction =
  | { type: "SELECT_DISTRICT"; district: DistrictResult | null }
  | { type: "SET_ANSWER"; answer: string | undefined }
  | { type: "SHOW_ADVISOR"; feedback: AnswerFeedback; turn: PendingTurn }
  | { type: "DISMISS_ADVISOR" }
  | { type: "CHANGE_VIEW"; view: CurrentView };

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
      return { ...state, currentView: action.view };
  }
}

const initialState: GameFlowState = {
  currentView: "MapView",
  answer: undefined,
  pendingAdvisor: null,
  selectedDistrict: null,
};

type ProcessAnswer = (
  answer?: string,
  district?: DistrictResult | null,
) => PendingTurn | undefined;

type CommitTurn = (pending: PendingTurn) => CampaignState;

export function useGameFlow(
  processAnswer: ProcessAnswer,
  commitTurn: CommitTurn,
) {
  const [flow, dispatch] = useReducer(gameFlowReducer, initialState);

  const applyTurnResult = (result: CampaignState) => {
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
