import { container } from "tsyringe";
import {
  CampaignEvent,
  CandidateListData,
  Decision,
  EffectType,
  ParliamentaryElectionConfig,
  ProportionalElectionDefinition,
  RawQuestion,
} from "../types";
import { CampaignEngine } from "./CampaignEngine";
import { CampaignEventEngine } from "./CampaignEventEngine";
import { getVisibleParties } from "./CampaignStateAccess";
import { EffectApplier } from "./EffectApplier";
import { MandateCalculator } from "./MandateCalculator";
import { MayoralResultCalculator } from "./MayoralResultCalculator";
import { PollsterEngine } from "./PollsterEngine";
import { ResultModifier } from "./ResultModifier";
import { CandidateWithdrawalTransformer } from "./ResultTransformer/CandidateWithdrawalTransformer";

const districts: CandidateListData[] = [
  {
    megyekod: 1,
    megye: "Budapest",
    oevk: 1,
    telepules: "Budapest",
    valasztopolgar: 100000,
    partok: { mszmp: 40000, fkgp: 20000, szdp: 20000 },
  },
  {
    megyekod: 2,
    megye: "Vidék",
    oevk: 1,
    telepules: "Vidék",
    valasztopolgar: 100000,
    partok: { mszmp: 30000, fkgp: 40000, szdp: 10000 },
  },
];

const config: ParliamentaryElectionConfig & {
  election: ProportionalElectionDefinition;
} = {
  title: "1957",
  year: "1957",
  election: {
    type: "proportional",
    regions: [
      { id: "budapest", name: "Budapest", seats: 10, megyekods: [1] },
      { id: "videk", name: "Vidék", seats: 10, megyekods: [2] },
    ],
  },
  listSeats: 4,
  allSeats: 24,
  thresholdPercent: 0,
  partyListVotes: {},
  districtMap: "2011",
  parties: [
    { id: "mszmp", name: "MSZMP", color: "#c00" },
    { id: "fkgp", name: "FKGP", color: "#0a0" },
    { id: "szdp", name: "SZDP", color: "#f60" },
    { id: "kadar", name: "Kádár-párt", color: "#600", dormant: true },
  ],
  playableSides: [
    {
      id: "mszmp",
      label: "MSZMP",
      mainCandidates: [{ id: "nagy", label: "Nagy" }],
    },
  ],
  electionAssets: [],
};

const questions: RawQuestion[] = ["q1", "q2", "q3"].map((id) => ({
  id,
  question: "?",
  possibleAnswers: [{ id: "A", label: "A" }],
}));

const split: CampaignEvent = {
  id: "kadar_split",
  once: true,
  conditions: [
    {
      if: { type: "answer-selected", questionId: "q1", answerId: "A" },
      effects: [
        {
          type: "split-party",
          partyId: "kadar",
          from: { mszmp: 0.25 },
          fromByMegye: { "1": { mszmp: 0.5, szdp: 0.1 } },
        },
      ],
    },
  ],
};

const settings = { showAdvisorFeedback: false, language: "hu" as const };

const createEngine = () =>
  new CampaignEngine(
    districts,
    questions,
    [],
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    container.resolve(PollsterEngine),
    container.resolve(MayoralResultCalculator),
    container.resolve(CampaignEventEngine),
    container.resolve(CandidateWithdrawalTransformer),
    undefined,
    undefined,
    [split],
  );

const decision = (params: Record<string, number> = { mszmp: 0 }): Decision => ({
  questionId: "q1",
  answerId: "A",
  effects: [{ type: EffectType.UniformSwing, params }],
});

describe("party split", () => {
  it("keeps a dormant party out of the race until it splits", () => {
    const initial = createEngine().createInitialState("1957", null, config);

    expect(initial.candidates).toEqual({ kadar: { status: "dormant" } });
    expect(initial.results?.mandates.map((m) => m.party)).not.toContain(
      "kadar",
    );
    expect(getVisibleParties(config.parties, initial).map((p) => p.id)).toEqual(
      ["mszmp", "fkgp", "szdp"],
    );
  });

  it("moves votes to the new party and gives it seats", () => {
    const engine = createEngine();
    const initial = engine.createInitialState("1957", null, config);
    const next = engine.processTurn(initial, decision(), [], settings, config);

    expect(next.candidates?.kadar).toEqual({
      status: "active",
      splitFromIds: ["mszmp"],
      changedAtTurn: 1,
    });
    const [budapest, videk] = next.candidateListData!.map((d) => d.partok);
    expect(budapest.kadar).toBe(
      initial.candidateListData![0].partok.mszmp! -
        budapest.mszmp! +
        (initial.candidateListData![0].partok.szdp! - budapest.szdp!),
    );
    expect(
      budapest.kadar! / initial.candidateListData![0].partok.mszmp!,
    ).toBeGreaterThan(0.5);
    expect(videk.kadar).toBe(
      Math.round(initial.candidateListData![1].partok.mszmp! * 0.25),
    );
    expect(videk.szdp).toBe(initial.candidateListData![1].partok.szdp);
    const kadar = next.results?.mandates.find((m) => m.party === "kadar");
    expect(kadar?.totalSeats).toBeGreaterThan(0);
    expect(getVisibleParties(config.parties, next)).toHaveLength(4);
  });

  it("ignores answer effects aimed at a dormant party", () => {
    const engine = createEngine();
    const initial = engine.createInitialState("1957", null, {
      ...config,
    });
    const withoutSplit = new CampaignEngine(
      districts,
      questions,
      [],
      container.resolve(ResultModifier),
      container.resolve(EffectApplier),
      container.resolve(MandateCalculator),
      container.resolve(PollsterEngine),
      container.resolve(MayoralResultCalculator),
      container.resolve(CampaignEventEngine),
      container.resolve(CandidateWithdrawalTransformer),
    );
    const next = withoutSplit.processTurn(
      initial,
      decision({ kadar: 5 }),
      [],
      settings,
      config,
    );

    expect(next.candidateListData!.every((d) => !d.partok.kadar)).toBe(true);
  });
});
