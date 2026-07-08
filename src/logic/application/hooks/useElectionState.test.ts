import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { CampaignConfig, PendingTurn } from "@/shared/types";
import { EffectType } from "@/shared/types";
import { gameModeRegistry } from "../gameModeRegistery";
import { useElectionState } from "./useElectionState";

const MOCK_CAMPAIGN_ID = "mock_campaign";

const mockConfig: CampaignConfig = {
  electionConfig: {
    title: "Mock Election",
    listSeats: 10,
    allSeats: 20,
    thresholdPercent: 5,
    parties: [
      { id: "party_a", name: "Party A", color: "#ff0000" },
      { id: "party_b", name: "Party B", color: "#0000ff" },
    ],
    playableSides: [],
    electionAssets: [],
      partyListVotes: {},
  },
  voterEnvironmentConfig: {
    eligibleVoters: 1000,
    maxTurnout: 0.7,
    listData: [],
  },
  candidateListData: [
    {
      megyekod: 1,
      megye: "Test",
      oevk: 1,
      telepules: "Testville",
      valasztopolgar: 10000,
      partok: { party_a: 3000, party_b: 2000 },
      jeloltek: {},
    },
  ],
  partyListData: [
    {
      megyekod: 1,
      megye: "Test",
      oevk: 1,
      partok: { party_a: 5000, party_b: 4000 },
    },
  ],
  districts: [],
  capitalCity: [],
  questions: [],
  answerEffect: [],
  endResults: {
    playerSideVictory: {
      imageUri: "",
      title: "Win",
      subtitle: "",
      description: "",
    },
    playerSideDefeat: {
      imageUri: "",
      title: "Loss",
      subtitle: "",
      description: "",
    },
  },
};

beforeAll(() => {
  gameModeRegistry[MOCK_CAMPAIGN_ID] = mockConfig;
});

afterAll(() => {
  delete (gameModeRegistry as Record<string, unknown>)[MOCK_CAMPAIGN_ID];
});

const MOCK_CAMPAIGN_WITH_Q = "mock_campaign_with_q";

const mockConfigWithQuestion: CampaignConfig = {
  ...mockConfig,
  questions: [
    {
      id: "q1",
      title: "Test Q",
      question: "Test?",
      possibleAnswers: [
        { id: "a1", label: "Answer 1" },
        { id: "a2", label: "Answer 2" },
      ],
    },
  ],
  answerEffect: [
    {
      id: "q1",
      answers: [
        {
          id: "a1",
          effects: [
            {
              type: EffectType.UniformSwing,
              params: { party_a: 2, party_b: -2 },
            },
          ],
        },
        {
          id: "a2",
          effects: [],
        },
      ],
    },
  ],
};

describe("useElectionState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize state", () => {
    const { result } = renderHook(() => useElectionState(MOCK_CAMPAIGN_ID), {
      wrapper: MemoryRouter,
    });

    expect(result.current.state.activeCampaignId).toBe(MOCK_CAMPAIGN_ID);
  });

  it("initial state has turn 0 and isEnded false", () => {
    const { result } = renderHook(() => useElectionState(MOCK_CAMPAIGN_ID), {
      wrapper: MemoryRouter,
    });

    expect(result.current.state.turn).toBe(0);
    expect(result.current.state.isEnded).toBe(false);
  });

  it("processAnswer returns undefined when there is no current question", () => {
    const { result } = renderHook(() => useElectionState(MOCK_CAMPAIGN_ID), {
      wrapper: MemoryRouter,
    });

    const pending = result.current.processAnswer("any-answer");
    expect(pending).toBeUndefined();
  });

  it("processAnswer returns undefined when rawAnswer is empty", () => {
    const { result } = renderHook(() => useElectionState(MOCK_CAMPAIGN_ID), {
      wrapper: MemoryRouter,
    });

    expect(result.current.processAnswer(undefined)).toBeUndefined();
    expect(result.current.processAnswer("")).toBeUndefined();
  });
});

describe("useElectionState – processAnswer and commitTurn", () => {
  beforeAll(() => {
    gameModeRegistry[MOCK_CAMPAIGN_WITH_Q] = mockConfigWithQuestion;
  });

  afterAll(() => {
    delete (gameModeRegistry as Record<string, unknown>)[MOCK_CAMPAIGN_WITH_Q];
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it("initial state has the first question loaded", () => {
    const { result } = renderHook(
      () => useElectionState(MOCK_CAMPAIGN_WITH_Q),
      { wrapper: MemoryRouter },
    );
    expect(result.current.state.currentQuestion?.id).toBe("q1");
  });

  it("processAnswer returns a PendingTurn with the correct answer and question ids", () => {
    const { result } = renderHook(
      () => useElectionState(MOCK_CAMPAIGN_WITH_Q),
      { wrapper: MemoryRouter },
    );

    const pending = result.current.processAnswer("a1");

    expect(pending).toBeDefined();
    expect(pending?.rawAnswer).toBe("a1");
    expect(pending?.decision.answerId).toBe("a1");
    expect(pending?.decision.questionId).toBe("q1");
  });

  it("processAnswer returns undefined for an answer not in answerEffects", () => {
    const { result } = renderHook(
      () => useElectionState(MOCK_CAMPAIGN_WITH_Q),
      { wrapper: MemoryRouter },
    );

    expect(result.current.processAnswer("nonexistent")).toBeUndefined();
  });

  it("the newGameState from processAnswer has turn incremented by 1", () => {
    const { result } = renderHook(
      () => useElectionState(MOCK_CAMPAIGN_WITH_Q),
      { wrapper: MemoryRouter },
    );

    const pending = result.current.processAnswer("a1");
    expect(pending?.newGameState.turn).toBe(1);
  });

  it("commitTurn updates state.turn after processing an answer", () => {
    const { result } = renderHook(
      () => useElectionState(MOCK_CAMPAIGN_WITH_Q),
      { wrapper: MemoryRouter },
    );

    let pending: PendingTurn | undefined;
    act(() => {
      pending = result.current.processAnswer("a1");
    });

    act(() => {
      result.current.commitTurn(pending!);
    });

    expect(result.current.state.turn).toBe(1);
  });

  it("commitTurn marks the game as ended after the last question", () => {
    const { result } = renderHook(
      () => useElectionState(MOCK_CAMPAIGN_WITH_Q),
      { wrapper: MemoryRouter },
    );

    let pending: PendingTurn | undefined;
    act(() => {
      pending = result.current.processAnswer("a1");
    });
    act(() => {
      result.current.commitTurn(pending!);
    });

    expect(result.current.state.isEnded).toBe(true);
  });
});
