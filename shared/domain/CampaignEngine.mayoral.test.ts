import { container } from "tsyringe";
import {
  CandidateListData,
  District,
  EffectType,
  MayoralElectionConfig,
  RawQuestion,
} from "../types";
import { CampaignEngine } from "./CampaignEngine";
import { EffectApplier } from "./EffectApplier";
import { MandateCalculator } from "./MandateCalculator";
import { MayoralResultCalculator } from "./MayoralResultCalculator";
import { mockElectionConfig } from "./mocks/mockElectionConfig";
import { mockCandidateListData, mockPartyListData } from "./mocks/mockListData";
import { PollsterEngine } from "./PollsterEngine";
import { ResultModifier } from "./ResultModifier";

const districts: CandidateListData[] = [
  {
    megyekod: 1,
    megye: "Budapest",
    oevk: 1,
    telepules: "I. kerület",
    valasztopolgar: 20000,
    partok: { karacsony: 5000, vitezy: 4000, grundtner: 500 },
  },
  {
    megyekod: 1,
    megye: "Budapest",
    oevk: 2,
    telepules: "II. kerület",
    valasztopolgar: 60000,
    partok: { karacsony: 12000, vitezy: 14000, grundtner: 1000 },
  },
];

const mayoralConfig: MayoralElectionConfig = {
  title: "Budapest",
  year: "2024",
  election: { type: "mayoral", resultRule: "plurality" },
  districtMap: "2024",
  parties: [
    { id: "karacsony", name: "Karácsony", color: "#00f" },
    { id: "vitezy", name: "Vitézy", color: "#0f0" },
    { id: "grundtner", name: "Grundtner", color: "#000" },
  ],
  playableSides: [
    {
      id: "lmp",
      label: "LMP",
      mainCandidates: [{ id: "vitezy", label: "Vitézy" }],
    },
  ],
  electionAssets: [],
};

const questions: RawQuestion[] = [
  {
    id: "q1",
    question: "?",
    possibleAnswers: [{ id: "A", label: "A" }],
  },
  {
    id: "q2",
    question: "?",
    possibleAnswers: [{ id: "A", label: "A" }],
  },
];

const settings = { showAdvisorFeedback: false, language: "hu" as const };

function createEngine(data = districts) {
  return new CampaignEngine(
    data,
    questions,
    [],
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    container.resolve(PollsterEngine),
    container.resolve(MayoralResultCalculator),
  );
}

describe("CampaignEngine with a mayoral election", () => {
  it("calculates a city-wide mayoral result and no seats at the start", () => {
    const state = createEngine().createInitialState(
      "budapest",
      null,
      mayoralConfig,
    );

    expect(state.mayoralResult?.outcome).toEqual({
      kind: "winner",
      candidateId: "vitezy",
    });
    expect(state.mayoralResult?.validVotes).toBe(36500);
    expect(state.results?.mandates).toEqual([]);
    expect(state.results?.constituencySeats).toEqual({});
    expect(state.results?.percentages.candidateListResults.karacsony).toBe(
      state.mayoralResult?.percentages.karacsony,
    );
  });

  it("recalculates the mayoral result after each answer", () => {
    const engine = createEngine();
    const initial = engine.createInitialState("budapest", null, mayoralConfig);

    const next = engine.processTurn(
      initial,
      {
        questionId: "q1",
        answerId: "A",
        effects: [
          {
            type: EffectType.UniformSwing,
            params: { karacsony: 5, vitezy: -5 },
          },
        ],
      },
      [],
      settings,
      mayoralConfig,
    );

    expect(next.turn).toBe(1);
    expect(next.mayoralResult?.outcome).toEqual({
      kind: "winner",
      candidateId: "karacsony",
    });
    expect(next.results?.mandates).toEqual([]);
  });

  it("boosts the player's candidate, not the side id, in the visited district", () => {
    const engine = createEngine();
    const initial = engine.createInitialState("budapest", null, mayoralConfig);
    const visited = { ...districts[0], winner: "karacsony" } as District;

    const next = engine.processTurn(
      initial,
      {
        questionId: "q1",
        answerId: "A",
        effects: [{ type: EffectType.UniformSwing, params: { vitezy: 0 } }],
        selectedDistrict: visited,
      },
      [],
      settings,
      mayoralConfig,
      undefined,
      true,
      "vitezy",
    );

    const before = initial.mayoralResult!.districts[0].votes.vitezy;
    const after = next.mayoralResult!.districts[0].votes.vitezy;
    expect(after - before).toBe(500);
    expect(next.mayoralResult?.votes).not.toHaveProperty("lmp");
  });

  it("leaves inactive candidates out of the result after a turn", () => {
    const engine = createEngine();
    const initial = engine.createInitialState("budapest", null, mayoralConfig);
    const withWithdrawal = {
      ...initial,
      candidates: {
        vitezy: {
          status: "inactive" as const,
          inactiveReason: "withdrawal" as const,
        },
      },
    };

    const next = engine.processTurn(
      withWithdrawal,
      {
        questionId: "q1",
        answerId: "A",
        effects: [{ type: EffectType.UniformSwing, params: { karacsony: 0 } }],
      },
      [],
      settings,
      mayoralConfig,
    );

    expect(next.mayoralResult?.outcome).toEqual({
      kind: "winner",
      candidateId: "karacsony",
    });
    expect(next.mayoralResult?.withdrawn.map((w) => w.candidateId)).toEqual([
      "vitezy",
    ]);
    expect(next.candidates).toEqual(withWithdrawal.candidates);
  });

  it("stamps a new game with the campaign config version", () => {
    const state = createEngine().createInitialState(
      "budapest",
      null,
      mayoralConfig,
      "lmp",
      "1.0.0",
    );

    expect(state.campaignConfigVersion).toBe("1.0.0");
  });

  it("keeps the saved config version when resuming with a newer config", () => {
    const engine = createEngine();
    const saved = engine.createInitialState(
      "budapest",
      null,
      mayoralConfig,
      "lmp",
      "1.0.0",
    );

    const resumed = engine.createInitialState(
      "budapest",
      saved,
      mayoralConfig,
      "lmp",
      "1.1.0",
    );

    expect(resumed.campaignConfigVersion).toBe("1.0.0");
  });

  it("returns the mayoral result as the final result", () => {
    const engine = createEngine();
    const state = engine.createInitialState("budapest", null, mayoralConfig);

    const final = engine.getFinalResults(state);

    expect(final?.mayoralResult).toBe(state.mayoralResult);
    expect(final?.winnerParty).toBeUndefined();
  });

  it("keeps parliamentary campaigns free of a mayoral result", () => {
    const engine = new CampaignEngine(
      mockCandidateListData,
      questions,
      [],
      container.resolve(ResultModifier),
      container.resolve(EffectApplier),
      container.resolve(MandateCalculator),
      container.resolve(PollsterEngine),
      container.resolve(MayoralResultCalculator),
      mockPartyListData,
    );

    const state = engine.createInitialState("test", null, mockElectionConfig);

    expect(state).not.toHaveProperty("mayoralResult");
    expect(state.results?.mandates.length).toBeGreaterThan(0);
  });
});
