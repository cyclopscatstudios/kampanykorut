import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useGameFlow } from "./useGameFlow";
import type {
  PendingTurn,
  AnswerFeedback,
} from "../../../../logic/types/campaignEngine.types";
import type { CampaignState } from "../../../../logic/domain/CampaignEngine";
import type { District } from "../../map.utils";

const makePending = (overrides: Partial<CampaignState> = {}): PendingTurn => ({
  newGameState: { turn: 1, isEnded: false, ...overrides },
  decision: { questionId: "q1", answerId: "a1", effects: [] },
  rawAnswer: "a1",
});

const mockFeedback: AnswerFeedback = { answerId: "a1", text: "Jó döntés!" };

describe("useGameFlow", () => {
  const mockProcessAnswer = vi.fn();
  const mockCommitTurn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessAnswer.mockReturnValue(undefined);
    mockCommitTurn.mockReturnValue({ turn: 0, isEnded: false });
  });

  describe("initial state", () => {
    it("starts in MapView", () => {
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      expect(result.current.flow.currentView).toBe("MapView");
    });

    it("has no answer, no district, no pending advisor initially", () => {
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      expect(result.current.flow.answer).toBeUndefined();
      expect(result.current.flow.selectedDistrict).toBeNull();
      expect(result.current.flow.pendingAdvisor).toBeNull();
    });
  });

  describe("dispatch actions", () => {
    it("SELECT_DISTRICT updates selectedDistrict", () => {
      const district = { telepules: "Budapest" } as District;
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.dispatch({ type: "SELECT_DISTRICT", district });
      });

      expect(result.current.flow.selectedDistrict).toBe(district);
    });

    it("SET_ANSWER updates answer", () => {
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.dispatch({ type: "SET_ANSWER", answer: "option-b" });
      });

      expect(result.current.flow.answer).toBe("option-b");
    });

    it("CHANGE_VIEW updates currentView", () => {
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.dispatch({ type: "CHANGE_VIEW", view: "QuestionView" });
      });

      expect(result.current.flow.currentView).toBe("QuestionView");
    });

    it("DISMISS_ADVISOR clears pendingAdvisor and answer", () => {
      const pending = makePending({ advisorFeedback: mockFeedback });
      mockProcessAnswer.mockReturnValue(pending);
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.handleAnswer("a1");
      });
      act(() => {
        result.current.dispatch({ type: "DISMISS_ADVISOR" });
      });

      expect(result.current.flow.pendingAdvisor).toBeNull();
      expect(result.current.flow.answer).toBeUndefined();
    });
  });

  describe("handleAnswer", () => {
    it("does nothing when processAnswer returns undefined", () => {
      mockProcessAnswer.mockReturnValue(undefined);
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.handleAnswer("a1");
      });

      expect(mockCommitTurn).not.toHaveBeenCalled();
      expect(result.current.flow.pendingAdvisor).toBeNull();
    });

    it("passes selected district to processAnswer", () => {
      const district = { telepules: "Pécs" } as District;
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.dispatch({ type: "SELECT_DISTRICT", district });
      });
      act(() => {
        result.current.handleAnswer("a1");
      });

      expect(mockProcessAnswer).toHaveBeenCalledWith("a1", district);
    });

    it("shows advisor when newGameState has advisorFeedback", () => {
      const pending = makePending({ advisorFeedback: mockFeedback });
      mockProcessAnswer.mockReturnValue(pending);
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.handleAnswer("a1");
      });

      expect(mockCommitTurn).not.toHaveBeenCalled();
      expect(result.current.flow.pendingAdvisor).toEqual({
        feedback: mockFeedback,
        turn: pending,
      });
    });

    it("commits turn and clears answer when no advisorFeedback", () => {
      const pending = makePending({ turn: 2 });
      mockProcessAnswer.mockReturnValue(pending);
      mockCommitTurn.mockReturnValue({ turn: 2, isEnded: false });
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.handleAnswer("a1");
      });

      expect(mockCommitTurn).toHaveBeenCalledWith(pending);
      expect(result.current.flow.answer).toBeUndefined();
    });

    it("navigates to MapView when turn is even", () => {
      const pending = makePending({ turn: 4 });
      mockProcessAnswer.mockReturnValue(pending);
      mockCommitTurn.mockReturnValue({ turn: 4, isEnded: false });
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.dispatch({ type: "CHANGE_VIEW", view: "QuestionView" });
      });
      act(() => {
        result.current.handleAnswer("a1");
      });

      expect(result.current.flow.currentView).toBe("MapView");
    });

    it("stays in current view when turn is odd", () => {
      const pending = makePending({ turn: 3 });
      mockProcessAnswer.mockReturnValue(pending);
      mockCommitTurn.mockReturnValue({ turn: 3, isEnded: false });
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.dispatch({ type: "CHANGE_VIEW", view: "QuestionView" });
      });
      act(() => {
        result.current.handleAnswer("a1");
      });

      expect(result.current.flow.currentView).toBe("QuestionView");
    });
  });

  describe("handleAdvisorClose", () => {
    it("commits the pending turn and dismisses advisor", () => {
      const pending = makePending({ advisorFeedback: mockFeedback });
      mockProcessAnswer.mockReturnValue(pending);
      mockCommitTurn.mockReturnValue({ turn: 2, isEnded: false });
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.handleAnswer("a1");
      });
      act(() => {
        result.current.handleAdvisorClose();
      });

      expect(mockCommitTurn).toHaveBeenCalledWith(pending);
      expect(result.current.flow.pendingAdvisor).toBeNull();
      expect(result.current.flow.answer).toBeUndefined();
    });

    it("only dismisses when there is no pending advisor", () => {
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.handleAdvisorClose();
      });

      expect(mockCommitTurn).not.toHaveBeenCalled();
      expect(result.current.flow.pendingAdvisor).toBeNull();
    });

    it("navigates to MapView", () => {
      const pending = makePending({ advisorFeedback: mockFeedback });
      mockProcessAnswer.mockReturnValue(pending);
      mockCommitTurn.mockReturnValue({ turn: 1, isEnded: true });
      const { result } = renderHook(() =>
        useGameFlow(mockProcessAnswer, mockCommitTurn),
      );

      act(() => {
        result.current.handleAnswer("a1");
      });
      act(() => {
        result.current.handleAdvisorClose();
      });

      expect(result.current.flow.currentView).toBe("MapView");
    });
  });
});
