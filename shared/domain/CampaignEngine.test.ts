import { container } from "tsyringe";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  AdvisorFeedback,
  CampaignState,
  CandidateListData,
  Decision,
  EffectType,
  ElectionConfig,
  HistoryItem,
  RawEffect,
  RawParty,
  RawQuestion,
  Strategy,
} from "../types";
import { CampaignEngine } from "./CampaignEngine";
import { EffectApplier } from "./EffectApplier";
import { MandateCalculator } from "./MandateCalculator";
import { campaignState } from "./mocks/mockCampaignState";
import { mockElectionConfig } from "./mocks/mockElectionConfig";
import { mockCandidateListData, mockPartyListData } from "./mocks/mockListData";
import { AGGREGATE_POLLSTER_ID, PollsterEngine } from "./PollsterEngine";
import { ResultModifier } from "./ResultModifier";

let campaignEngine: CampaignEngine;

const getDecision = (effects: RawEffect[]): Decision => ({
  questionId: "q1",
  answerId: "a1",
  effects,
});

describe("CampaignEngine", () => {
  beforeAll(() => {
    const resultModifier = container.resolve(ResultModifier);

    campaignEngine = new CampaignEngine(
      mockCandidateListData,
      [],
      [],
      resultModifier,
      container.resolve(EffectApplier),
      container.resolve(MandateCalculator),
      container.resolve(PollsterEngine),
      mockPartyListData,
    );
  });
  it("should apply the party-swing typed decision", () => {
    const decision = getDecision([
      {
        type: EffectType.UniformSwing,
        params: {
          party_a: 5,
          party_b: -3,
        },
      },
    ]);

    const result = campaignEngine.processTurn(
      campaignState,
      decision,
      [],
      {
        showAdvisorFeedback: true,
        language: "en",
      },
      mockElectionConfig,
    );
    expect(result).toMatchSnapshot();
  });
  it("should apply party-share typed decision", () => {
    const decision = getDecision([
      {
        type: EffectType.VoteAllocation,
        params: {
          newVotes: 100000,
          share: {
            party_a: 0.6,
            party_b: 0.4,
          },
        },
      },
    ]);

    const result = campaignEngine.processTurn(
      campaignState,
      decision,
      [],
      {
        showAdvisorFeedback: true,
        language: "en",
      },
      mockElectionConfig,
    );
    expect(result).toMatchSnapshot();
  });
  it("should apply motivation typed decision", () => {
    const decision = getDecision([
      {
        type: EffectType.TurnoutChange,
        params: {
          party_a: 4,
          party_b: -2,
        },
      },
    ]);

    const result = campaignEngine.processTurn(
      campaignState,
      decision,
      [],
      {
        showAdvisorFeedback: true,
        language: "en",
      },
      mockElectionConfig,
    );
    expect(result).toMatchSnapshot();
  });
  it("should apply district typed decision", () => {
    const decision = getDecision([
      {
        type: EffectType.DistrictVoteTransfer,
        params: [
          {
            amount: 50,
            megyekod: 1,
            oevk: 1,
            targetParty: "party_b",
            from: { party: "party_a", type: "party" },
          },
        ],
      },
    ]);

    const result = campaignEngine.processTurn(
      campaignState,
      decision,
      [],
      {
        showAdvisorFeedback: true,
        language: "en",
      },
      mockElectionConfig,
    );
    expect(result).toMatchSnapshot();
  });
});

describe("CampaignEngine.createInitialState", () => {
  let engine: CampaignEngine;

  beforeAll(() => {
    engine = new CampaignEngine(
      mockCandidateListData,
      [],
      [],
      container.resolve(ResultModifier),
      container.resolve(EffectApplier),
      container.resolve(MandateCalculator),
      container.resolve(PollsterEngine),
      mockPartyListData,
    );
  });

  it("creates fresh state when savedState is null", () => {
    const result = engine.createInitialState("test-campaign", null, {
      parties: [{ id: "party_a" }, { id: "party_b" }, { id: "party_c" }],
    } as ElectionConfig);

    expect(result.turn).toBe(0);
    expect(result.isEnded).toBe(false);
    expect(result.candidateListData).toEqual(mockCandidateListData);
  });

  it("returns savedState when it has candidateListData", () => {
    const savedState: CampaignState = {
      activeCampaignId: "test-campaign",
      turn: 5,
      isEnded: false,
      candidateListData: mockCandidateListData,
      partyListData: mockPartyListData,
      isBaseResultsAlreadyApplied: false,
    };

    const result = engine.createInitialState("test-campaign", savedState, {
      parties: [{ id: "party_a" }, { id: "party_b" }, { id: "party_c" }],
    } as ElectionConfig);

    expect(result).toEqual(expect.objectContaining(savedState));
    expect(result.turn).toBe(5);
  });

  it("creates fresh state when savedState has no candidateListData", () => {
    const savedState = {
      activeCampaignId: "test-campaign",
      turn: 3,
      isEnded: false,
      isBaseResultsAlreadyApplied: false,
    };

    const result = engine.createInitialState("test-campaign", savedState, {
      parties: [{ id: "party_a" }, { id: "party_b" }, { id: "party_c" }],
    } as ElectionConfig);

    expect(result.turn).toBe(0);
    expect(result.candidateListData).toEqual(mockCandidateListData);
  });

  it("applies baseResults when creating fresh state", () => {
    const electionConfig = {
      baseResults: { party_a: 3, party_b: -2 },
      thresholdPercent: 5,
    } as unknown as ElectionConfig;

    const withBase = engine.createInitialState(
      "test-campaign",
      null,
      electionConfig,
    );
    const withoutBase = engine.createInitialState("test-campaign", null, {
      parties: [{ id: "party_a" }, { id: "party_b" }, { id: "party_c" }],
    } as ElectionConfig);

    expect(withBase.candidateListData).not.toEqual(
      withoutBase.candidateListData,
    );
  });

  it("baseResults are ignored when savedState has candidateListData", () => {
    const savedState = {
      activeCampaignId: "test-campaign",
      turn: 2,
      isEnded: false,
      candidateListData: mockCandidateListData,
      isBaseResultsAlreadyApplied: false,
    };
    const electionConfig = {
      baseResults: { party_a: 99 },
      thresholdPercent: 5,
    } as unknown as ElectionConfig;

    const result = engine.createInitialState(
      "test-campaign",
      savedState,
      electionConfig,
    );

    expect(result).toEqual(expect.objectContaining(savedState));
  });

  it("rebuilds the poll projection from the saved poll differences", () => {
    const polls = { party_a: 2, party_b: -2 };
    const savedState: CampaignState = {
      activeCampaignId: "test-campaign",
      turn: 4,
      isEnded: false,
      candidateListData: mockCandidateListData,
      partyListData: mockPartyListData,
      isBaseResultsAlreadyApplied: true,
      pollingOpnions: { selectedPollsterId: "pollster-x", polls },
    };

    const result = engine.createInitialState(
      "test-campaign",
      savedState,
      mockElectionConfig,
    );

    expect(result.pollingOpnions).toEqual(
      engine.getPollProjection(
        savedState,
        mockElectionConfig,
        polls,
        "pollster-x",
      ),
    );
    expect(result.pollingOpnions?.candidateListData).toBeDefined();
    expect(result.pollingOpnions?.polls).toEqual(polls);
  });

  it("keeps a full poll projection saved by an older version", () => {
    const legacyProjection = {
      candidateListData: mockCandidateListData,
      selectedPollsterId: "aggregate",
    };
    const savedState: CampaignState = {
      activeCampaignId: "test-campaign",
      turn: 4,
      isEnded: false,
      candidateListData: mockCandidateListData,
      isBaseResultsAlreadyApplied: true,
      pollingOpnions: legacyProjection,
    };

    const result = engine.createInitialState(
      "test-campaign",
      savedState,
      mockElectionConfig,
    );

    expect(result.pollingOpnions).toBe(legacyProjection);
  });
});

describe("CampaignEngine.createInitialState – mergeUnknownPartiesToOther", () => {
  let engine: CampaignEngine;

  beforeAll(() => {
    engine = new CampaignEngine(
      mockCandidateListData,
      [],
      [],
      container.resolve(ResultModifier),
      container.resolve(EffectApplier),
      container.resolve(MandateCalculator),
      container.resolve(PollsterEngine),
      mockPartyListData,
    );
  });

  it("keeps parties that are in the config", () => {
    const result = engine.createInitialState("test", null, {
      parties: [{ id: "party_a" }, { id: "party_b" }, { id: "party_c" }],
    } as ElectionConfig);

    const partok = result.partyListData![0].partok;
    expect(partok).toHaveProperty("party_a");
    expect(partok).toHaveProperty("party_b");
  });

  it("merges unknown party votes into _other", () => {
    // mockPartyListData row 0 has party_c: 3000 – if party_c is not in config it should be merged
    const result = engine.createInitialState("test", null, {
      parties: [{ id: "party_a" }, { id: "party_b" }],
    } as ElectionConfig);

    const partok = result.partyListData![0].partok as Record<string, number>;
    expect(partok).not.toHaveProperty("party_c");
    expect(partok._other).toBeGreaterThan(0);
  });

  it("does not add _other entries for parties with undefined votes", () => {
    // mockCandidateListData row 0 has party_c: undefined – should not inflate _other
    const withAll = engine.createInitialState("test", null, {
      parties: [{ id: "party_a" }, { id: "party_b" }, { id: "party_c" }],
    } as ElectionConfig);
    const withoutC = engine.createInitialState("test", null, {
      parties: [{ id: "party_a" }, { id: "party_b" }],
    } as ElectionConfig);

    const otherWithAll =
      (withAll.candidateListData![0].partok as Record<string, number>)._other ??
      0;
    const otherWithoutC =
      (withoutC.candidateListData![0].partok as Record<string, number>)
        ._other ?? 0;
    // party_c was undefined in candidateListData row 0, so _other should not grow
    expect(otherWithoutC).toBe(otherWithAll);
  });
});

describe("CampaignEngine.mergeUnknownPartiesToOther (direct)", () => {
  let engine: CampaignEngine;

  beforeAll(() => {
    engine = new CampaignEngine(
      mockCandidateListData,
      [],
      [],
      container.resolve(ResultModifier),
      container.resolve(EffectApplier),
      container.resolve(MandateCalculator),
      container.resolve(PollsterEngine),
      mockPartyListData,
    );
  });

  const callMergeUnknownPartiesToOther = (
    candidateListData: CandidateListData[],
    parties: RawParty[],
  ) =>
    (
      engine as unknown as {
        mergeUnknownPartiesToOther: (
          candidateListData: CandidateListData[],
          partyListData: undefined,
          parties: RawParty[],
        ) => { candidateListData: CandidateListData[] };
      }
    ).mergeUnknownPartiesToOther(candidateListData, undefined, parties);

  const candidateListData: CandidateListData[] = [
    {
      megyekod: 1,
      megye: "Budapest főváros",
      oevk: 1,
      telepules: "Budapest 05. kerület",
      valasztopolgar: 73914,
      partok: {
        tisza: 37803,
        fidesz: 18391,
        mi_hazank: 1948,
        mkkp: 978,
        dk: 770,
        a_szolidaritas_partja_munkaspart: 66,
      },
      jeloltek: {
        tisza: ["TANÁCS ZOLTÁN"],
        fidesz: ["FAZEKAS CSILLA"],
        mi_hazank: ["NAGY ATTILA"],
        mkkp: ["SZINTAY ISTVÁN"],
        dk: ["HERFORT MARIETTA"],
        a_szolidaritas_partja_munkaspart: ["VÁRKONYI ZOLTÁN"],
      },
    },
  ];

  const parties: RawParty[] = [
    { id: "tisza", name: "Tisztelet és Szabadság Párt", color: "#88E8FF" },
    { id: "fidesz", name: "Fidesz–KDNP", color: "#F28E2B" },
    { id: "mi_hazank", name: "Mi Hazánk", color: "#688d1b" },
    { id: "mkkp", name: "Magyar Kétfarkú Kutya Párt", color: "#d92229" },
    { id: "dk", name: "Demokratikus Koalíció", color: "#2A61A4" },
  ];

  it("merges the party missing from the config into _other and drops its candidate", () => {
    const result = callMergeUnknownPartiesToOther(candidateListData, parties);
    const [row] = result.candidateListData;

    expect(row.partok).toEqual({
      tisza: 37803,
      fidesz: 18391,
      mi_hazank: 1948,
      mkkp: 978,
      dk: 770,
      _other: 66,
    });
    expect(row.jeloltek).toEqual({
      tisza: ["TANÁCS ZOLTÁN"],
      fidesz: ["FAZEKAS CSILLA"],
      mi_hazank: ["NAGY ATTILA"],
      mkkp: ["SZINTAY ISTVÁN"],
      dk: ["HERFORT MARIETTA"],
    });
  });
});

describe("CampaignEngine.getPollProjection", () => {
  let engine: CampaignEngine;

  beforeAll(() => {
    engine = new CampaignEngine(
      mockCandidateListData,
      [],
      [],
      container.resolve(ResultModifier),
      container.resolve(EffectApplier),
      container.resolve(MandateCalculator),
      container.resolve(PollsterEngine),
      mockPartyListData,
    );
  });

  it("returns undefined when polls is undefined", () => {
    expect(
      engine.getPollProjection(campaignState, mockElectionConfig, undefined),
    ).toBeUndefined();
  });

  it("returns projection data when polls are provided", () => {
    const result = engine.getPollProjection(campaignState, mockElectionConfig, {
      party_a: 3,
      party_b: -3,
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty("candidateListData");
    expect(result).toHaveProperty("partyListData");
    expect(result).toHaveProperty("percentages");
  });

  it("non-zero poll differences produce different candidateListData than the original state", () => {
    const result = engine.getPollProjection(campaignState, mockElectionConfig, {
      party_a: 5,
      party_b: -5,
    })!;
    expect(result.candidateListData).not.toEqual(
      campaignState.candidateListData,
    );
  });

  it("zero poll differences produce candidateListData equal to the original", () => {
    const result = engine.getPollProjection(campaignState, mockElectionConfig, {
      party_a: 0,
      party_b: 0,
    })!;
    expect(result.candidateListData).toEqual(campaignState.candidateListData);
  });
});

describe("CampaignEngine advisor feedback", () => {
  const question: RawQuestion = {
    id: "q2",
    question: "Second question",
    possibleAnswers: [
      { id: "A", label: "Answer A" },
      { id: "B", label: "Answer B" },
    ],
  };

  const advisorFeedback: AdvisorFeedback[] = [
    {
      questionId: "q2",
      answers: [
        { answerId: "A", text: "plain A" },
        { answerId: "B", text: "plain B" },
      ],
      conditionalAnswers: [
        {
          if: [{ questionId: "q1", answerId: "X" }],
          answer: { answerId: "B", text: "conditional B" },
        },
        {
          if: [{ questionId: "q1", answerId: "Y" }],
          answer: { answerId: "A", text: "conditional A first" },
        },
        {
          if: [{ questionId: "q1", answerId: "Y" }],
          answer: { answerId: "A", text: "conditional A second" },
        },
      ],
    },
  ];

  const engine = () =>
    new CampaignEngine(
      mockCandidateListData,
      [question],
      [],
      container.resolve(ResultModifier),
      container.resolve(EffectApplier),
      container.resolve(MandateCalculator),
      container.resolve(PollsterEngine),
      mockPartyListData,
      advisorFeedback,
    );

  const feedbackFor = (answerId: string, priorAnswerId: string) =>
    engine().processTurn(
      { ...campaignState, turn: 0, currentQuestion: question },
      { questionId: "q2", answerId, effects: [] },
      [{ questionId: "q1", answerId: priorAnswerId } as HistoryItem],
      { showAdvisorFeedback: true, language: "en" },
      mockElectionConfig,
    ).advisorFeedback;

  it("returns the conditional feedback of the selected answer when history matches", () => {
    expect(feedbackFor("B", "X")).toEqual({
      answerId: "B",
      text: "conditional B",
    });
  });

  it("ignores a history-matching conditional that belongs to another answer", () => {
    expect(feedbackFor("A", "X")).toEqual({ answerId: "A", text: "plain A" });
  });

  it("falls back to plain feedback when history does not match", () => {
    expect(feedbackFor("B", "Z")).toEqual({ answerId: "B", text: "plain B" });
  });

  it("keeps first-match order among applicable conditionals", () => {
    expect(feedbackFor("A", "Y")).toEqual({
      answerId: "A",
      text: "conditional A first",
    });
  });
});

describe("CampaignEngine campaign strategies", () => {
  const lastQuestion: RawQuestion = {
    id: "q_last",
    question: "Last question",
    possibleAnswers: [{ id: "A", label: "Answer A" }],
  };

  const engine = new CampaignEngine(
    mockCandidateListData,
    [lastQuestion],
    [],
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    container.resolve(PollsterEngine),
    mockPartyListData,
  );

  const strategy = (party: string, conditionAnswerId = "A"): Strategy => ({
    id: `strategy_${party}`,
    label: `strategy ${party}`,
    target: { party: "party_a", candidate: "candidate_a" },
    conditions: [{ questionId: "q_prev", answerId: conditionAnswerId }],
    rewards: [
      {
        minMatches: 1,
        effects: [{ type: EffectType.UniformSwing, params: { [party]: 3 } }],
      },
    ],
  });

  const answerSwing: RawEffect = {
    type: EffectType.UniformSwing,
    params: { party_a: 5, party_b: -5 },
  };
  const neutralSwing: RawEffect = {
    type: EffectType.UniformSwing,
    params: { party_a: 0 },
  };

  const shares = (effect: RawEffect, strategies?: Strategy[]) =>
    engine.processTurn(
      { ...campaignState, turn: 0, currentQuestion: lastQuestion },
      { questionId: "q_last", answerId: "A", effects: [effect] },
      [{ questionId: "q_prev", answerId: "A" } as HistoryItem],
      { showAdvisorFeedback: false, language: "en" },
      mockElectionConfig,
      strategies,
    ).results!.percentages.candidateListResults;

  it("leaves the final turn unchanged when no strategy is fulfilled", () => {
    expect(shares(answerSwing, [strategy("party_b", "B")])).toEqual(
      shares(answerSwing),
    );
  });

  it("applies the reward on top of the final answer's effects", () => {
    const answerOnly = shares(answerSwing);
    const rewardOnly = shares(neutralSwing, [strategy("party_b")]);
    const answerAndReward = shares(answerSwing, [strategy("party_b")]);

    expect(answerAndReward.party_b).toBeGreaterThan(answerOnly.party_b);
    expect(answerAndReward.party_b).toBeLessThan(rewardOnly.party_b);
  });

  it("stacks rewards of multiple fulfilled strategies", () => {
    const onlyA = shares(answerSwing, [strategy("party_a")]);
    const bThenA = shares(answerSwing, [
      strategy("party_b"),
      strategy("party_a"),
    ]);

    expect(bThenA.party_b).toBeGreaterThan(onlyA.party_b);
  });
});

describe("CampaignEngine.getFinalResults majority", () => {
  const engine = new CampaignEngine(
    mockCandidateListData,
    [],
    [],
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    container.resolve(PollsterEngine),
    mockPartyListData,
  );

  const finalResults = (winnerSeats: number, allSeats: number) =>
    engine.getFinalResults(
      {
        ...campaignState,
        results: {
          mandates: [
            {
              party: "party_a",
              constituencySeats: winnerSeats,
              listSeats: 0,
              totalSeats: winnerSeats,
            },
            ...["party_b", "party_c"].map((party, i) => {
              const rest = allSeats - winnerSeats;
              const seats =
                i === 0 ? Math.floor(rest / 2) : Math.ceil(rest / 2);
              return {
                party,
                constituencySeats: seats,
                listSeats: 0,
                totalSeats: seats,
              };
            }),
          ],
          compensation: { losingVotes: {}, winnerCompensation: {}, total: {} },
          constituencySeats: {},
          listSeats: {},
          totals: { candidateListResults: {}, partyListResults: {} },
          percentages: { candidateListResults: {}, partyListResults: {} },
        },
      },
      allSeats,
    )?.winnerParty;

  it.each([
    [99, 199, false, null],
    [100, 199, true, "simple"],
    [133, 199, true, "supermajority"],
    [100, 200, false, null],
  ])(
    "%i of %i seats -> hasMajority %s, %s",
    (seats, allSeats, hasMajority, majorityType) => {
      expect(finalResults(seats, allSeats)).toMatchObject({
        hasMajority,
        majorityType,
      });
    },
  );
});

describe("CampaignEngine poll projection after a turn", () => {
  const question: RawQuestion = {
    id: "q1",
    question: "Question",
    possibleAnswers: [{ id: "A", label: "Answer A" }],
  };
  const pollsterEngine = new PollsterEngine(
    container.resolve(MandateCalculator),
  );
  const engine = new CampaignEngine(
    mockCandidateListData,
    [question, question],
    [],
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    pollsterEngine,
    mockPartyListData,
  );

  const playTurn = (selectedPollsterId?: string) =>
    engine.processTurn(
      {
        ...campaignState,
        turn: 0,
        currentQuestion: question,
        pollingOpnions: { selectedPollsterId },
      },
      getDecision([{ type: EffectType.UniformSwing, params: { party_a: 0 } }]),
      [],
      { showAdvisorFeedback: false, language: "en" },
      mockElectionConfig,
    );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the selected pollster's polls", () => {
    const byPollster = vi
      .spyOn(pollsterEngine, "getPollsByPollsterId")
      .mockReturnValue({ id: "pollster-x", differences: { party_a: 1 } });
    const aggregate = vi.spyOn(pollsterEngine, "getPolls");

    const result = playTurn("pollster-x");

    expect(byPollster).toHaveBeenCalledWith(
      "pollster-x",
      expect.objectContaining({ turn: 1 }),
      mockElectionConfig,
    );
    expect(aggregate).not.toHaveBeenCalled();
    expect(result.pollingOpnions?.selectedPollsterId).toBe("pollster-x");
    expect(result.pollingOpnions?.polls).toEqual({ party_a: 1 });
  });

  it("falls back to the aggregate when the selected pollster is unknown", () => {
    vi.spyOn(pollsterEngine, "getPollsByPollsterId").mockReturnValue(
      undefined,
    );
    vi.spyOn(pollsterEngine, "getPolls").mockReturnValue({ party_a: 2 });

    const result = playTurn("removed-pollster");

    expect(result.pollingOpnions?.selectedPollsterId).toBe(
      AGGREGATE_POLLSTER_ID,
    );
    expect(result.pollingOpnions?.polls).toEqual({ party_a: 2 });
  });

  it("uses the aggregate polls when the aggregate is selected", () => {
    const byPollster = vi.spyOn(pollsterEngine, "getPollsByPollsterId");
    vi.spyOn(pollsterEngine, "getPolls").mockReturnValue({ party_a: 3 });

    const result = playTurn(AGGREGATE_POLLSTER_ID);

    expect(byPollster).not.toHaveBeenCalled();
    expect(result.pollingOpnions?.selectedPollsterId).toBe(
      AGGREGATE_POLLSTER_ID,
    );
    expect(result.pollingOpnions?.polls).toEqual({ party_a: 3 });
  });
});
