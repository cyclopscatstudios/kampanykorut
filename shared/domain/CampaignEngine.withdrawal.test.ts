import { container } from "tsyringe";
import {
  CampaignEvent,
  CampaignState,
  CandidateListData,
  Decision,
  EffectType,
  MayoralElectionConfig,
  RawQuestion,
} from "../types";
import { CampaignEngine } from "./CampaignEngine";
import { CampaignEventEngine } from "./CampaignEventEngine";
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
    telepules: "I. kerület",
    valasztopolgar: 30000,
    partok: { karacsony: 6000, vitezy: 5000, szentkiralyi: 2000 },
  },
  {
    megyekod: 1,
    megye: "Budapest",
    oevk: 2,
    telepules: "II. kerület",
    valasztopolgar: 60000,
    partok: { karacsony: 9000, vitezy: 8500, szentkiralyi: 3000 },
  },
];

const config: MayoralElectionConfig = {
  title: "Budapest",
  year: "2024",
  election: { type: "mayoral" },
  districtMap: "2024",
  parties: [
    { id: "karacsony", name: "Karácsony", color: "#00f" },
    { id: "vitezy", name: "Vitézy", color: "#0f0" },
    { id: "szentkiralyi", name: "Szentkirályi", color: "#f60" },
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

const questions: RawQuestion[] = ["q1", "q2", "q3"].map((id) => ({
  id,
  question: "?",
  possibleAnswers: [{ id: "A", label: "A" }],
}));

const withdrawal: CampaignEvent = {
  id: "szentkiralyi_withdrawal",
  conditions: [
    {
      if: { type: "answer-selected", questionId: "q1", answerId: "A" },
      effects: [
        {
          type: "withdraw-candidate",
          candidateId: "szentkiralyi",
          endorsedCandidateId: "vitezy",
          redistribution: { vitezy: 0.8, karacsony: 0.1, _abstain: 0.1 },
        },
      ],
    },
  ],
};

const settings = { showAdvisorFeedback: false, language: "hu" as const };

const createEngine = (events: CampaignEvent[] = [withdrawal]) =>
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
    events,
  );

const decision = (
  questionId: string,
  params: Record<string, number> = { vitezy: 0 },
): Decision => ({
  questionId,
  answerId: "A",
  effects: [{ type: EffectType.UniformSwing, params }],
});

function playFirstTurn(engine = createEngine()) {
  const initial = engine.createInitialState("budapest", null, config);
  const next = engine.processTurn(
    initial,
    decision("q1"),
    [],
    settings,
    config,
  );
  return { engine, initial, next };
}

describe("candidate withdrawal", () => {
  it("makes the candidate inactive and moves their votes in the same step", () => {
    const { initial, next } = playFirstTurn();

    expect(next.candidates).toEqual({
      szentkiralyi: {
        status: "inactive",
        inactiveReason: "withdrawal",
        endorsedCandidateId: "vitezy",
        changedAtTurn: 1,
      },
    });
    expect(next.candidateListData?.map((d) => d.partok)).toEqual([
      { _other: 0, karacsony: 6200, vitezy: 6600, szentkiralyi: 0 },
      { _other: 0, karacsony: 9300, vitezy: 10900, szentkiralyi: 0 },
    ]);
    expect(initial.mayoralResult?.outcome).toEqual({
      kind: "winner",
      candidateId: "karacsony",
    });
    expect(next.mayoralResult?.outcome).toEqual({
      kind: "winner",
      candidateId: "vitezy",
    });
    expect(next.mayoralResult?.validVotes).toBe(
      initial.mayoralResult!.validVotes - 500,
    );
  });

  it("keeps the eligible voters unchanged", () => {
    const { next } = playFirstTurn();

    expect(next.candidateListData?.map((d) => d.valasztopolgar)).toEqual([
      30000, 60000,
    ]);
  });

  it("gives an inactive candidate no new votes from later answers", () => {
    const { engine, next } = playFirstTurn();

    const after = engine.processTurn(
      next,
      decision("q2", { szentkiralyi: 10, vitezy: -1 }),
      [{ questionId: "q1", answerId: "A" } as never],
      settings,
      config,
    );

    expect(after.mayoralResult?.votes).not.toHaveProperty("szentkiralyi");
    expect(after.candidateListData?.every((d) => !d.partok.szentkiralyi)).toBe(
      true,
    );
    expect(after.mayoralResult?.outcome).toEqual({
      kind: "winner",
      candidateId: "vitezy",
    });
  });

  it("leaves the withdrawn candidate out of the polls", () => {
    const { next } = playFirstTurn();

    expect(next.pollingOpnions?.polls).not.toHaveProperty("szentkiralyi");
  });

  it("does not move the votes twice after a save and reload", () => {
    const { next } = playFirstTurn();
    const saved = JSON.parse(JSON.stringify(next)) as CampaignState;

    const engine = createEngine();
    const resumed = engine.createInitialState("budapest", saved, config);
    const after = engine.processTurn(
      resumed,
      decision("q2"),
      [{ questionId: "q1", answerId: "A" } as never],
      settings,
      config,
    );

    expect(after.candidateListData?.map((d) => d.partok)).toEqual(
      next.candidateListData?.map((d) => d.partok),
    );
    expect(after.campaignEvents?.triggeredEventIds).toEqual([
      "szentkiralyi_withdrawal",
    ]);
  });

  it("refuses to withdraw an inactive candidate or to move votes to one", () => {
    const repeat: CampaignEvent = {
      ...withdrawal,
      id: "second_withdrawal",
      conditions: [
        {
          if: { type: "turn", min: 2 },
          effects: withdrawal.conditions[0].effects,
        },
      ],
    };
    const { engine, next } = playFirstTurn(createEngine([withdrawal, repeat]));

    expect(() =>
      engine.processTurn(next, decision("q2"), [], settings, config),
    ).toThrow(/cannot withdraw inactive candidate "szentkiralyi"/);

    const toInactive: CampaignEvent = {
      id: "vitezy_withdrawal",
      conditions: [
        {
          if: { type: "turn", min: 2 },
          effects: [
            {
              type: "withdraw-candidate",
              candidateId: "vitezy",
              redistribution: { szentkiralyi: 1 },
            },
          ],
        },
      ],
    };
    const second = playFirstTurn(createEngine([withdrawal, toInactive]));
    expect(() =>
      second.engine.processTurn(
        second.next,
        decision("q2"),
        [],
        settings,
        config,
      ),
    ).toThrow(/cannot move votes of "vitezy" to "szentkiralyi"/);
  });
});
