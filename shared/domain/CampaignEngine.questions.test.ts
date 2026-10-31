import { container } from "tsyringe";
import {
  CampaignEvent,
  CampaignState,
  CandidateListData,
  Decision,
  EffectType,
  HistoryItem,
  MayoralElectionConfig,
  RawQuestion,
  Strategy,
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
    valasztopolgar: 50000,
    partok: { karacsony: 9000, vitezy: 8000, szentkiralyi: 4000 },
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

const whileActive = {
  type: "candidate-status",
  candidateId: "szentkiralyi",
  status: "active",
} as const;

const question = (
  id: string,
  patch: Partial<RawQuestion> = {},
): RawQuestion => ({
  id,
  question: id,
  possibleAnswers: [
    { id: "stay", label: "stay" },
    { id: "deal", label: "deal" },
  ],
  ...patch,
});

const questions: RawQuestion[] = [
  question("q1"),
  question("q2"),
  question("q3", { visibleIf: whileActive }),
  question("q3_after", { visibleIf: { not: whileActive } }),
  question("q4"),
];

const withdrawal: CampaignEvent = {
  id: "szentkiralyi_withdrawal",
  conditions: [
    {
      if: { type: "answer-selected", questionId: "q2", answerId: "deal" },
      effects: [
        {
          type: "withdraw-candidate",
          candidateId: "szentkiralyi",
          redistribution: { vitezy: 1 },
        },
      ],
    },
  ],
};

const settings = { showAdvisorFeedback: false, language: "hu" as const };

const createEngine = (qs = questions) =>
  new CampaignEngine(
    districts,
    qs,
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
    [withdrawal],
  );

const decide = (state: CampaignState, answerId: string): Decision => ({
  questionId: state.currentQuestion!.id,
  answerId,
  effects: [{ type: EffectType.UniformSwing, params: { karacsony: 0 } }],
});

function play(
  answers: string[],
  engine = createEngine(),
  strategies?: Strategy[],
) {
  let state = engine.createInitialState("budapest", null, config);
  const history: HistoryItem[] = [];
  const shown: string[] = [];
  const counts: number[] = [state.decisionCount!];
  for (const answerId of answers) {
    if (state.isEnded) {
      break;
    }
    shown.push(state.currentQuestion!.id);
    const decision = decide(state, answerId);
    state = engine.processTurn(
      state,
      decision,
      history,
      settings,
      config,
      strategies,
    );
    history.push({
      questionId: decision.questionId,
      answerId,
    } as HistoryItem);
    counts.push(state.decisionCount!);
  }
  return { state, shown, counts };
}

describe("CampaignEngine question selection", () => {
  it("shows the questions in order when none of them has conditions", () => {
    const linear = ["a", "b", "c"].map((id) => question(id));
    const { state, shown, counts } = play(
      ["stay", "stay", "stay"],
      createEngine(linear),
    );

    expect(shown).toEqual(["a", "b", "c"]);
    expect(counts).toEqual([3, 3, 3, 3]);
    expect(state.isEnded).toBe(true);
    expect(state.turn).toBe(3);
  });

  it("follows the branch where the candidate stays in the race", () => {
    const { state, shown, counts } = play(["stay", "stay", "stay", "stay"]);

    expect(shown).toEqual(["q1", "q2", "q3", "q4"]);
    expect(counts).toEqual([4, 4, 4, 4, 4]);
    expect(state.isEnded).toBe(true);
  });

  it("swaps in the replacement question after the withdrawal, keeping the same number of decisions", () => {
    const { state, shown, counts } = play(["stay", "deal", "stay", "stay"]);

    expect(shown).toEqual(["q1", "q2", "q3_after", "q4"]);
    expect(shown).not.toContain("q3");
    expect(counts).toEqual([4, 4, 4, 4, 4]);
    expect(state.turn).toBe(4);
    expect(state.isEnded).toBe(true);
  });

  it("ends when no eligible question is left, even if later questions exist", () => {
    const trailing = [
      question("q1"),
      question("q2", { visibleIf: { not: whileActive } }),
    ];
    const { state, shown } = play(["stay", "stay"], createEngine(trailing));

    expect(shown).toEqual(["q1"]);
    expect(state.isEnded).toBe(true);
    expect(state.currentQuestion).toBeUndefined();
    expect(state.decisionCount).toBe(1);
  });

  it("applies the campaign strategies on the last shown decision", () => {
    const strategy: Strategy = {
      id: "s",
      label: "s",
      target: { party: "lmp", candidate: "vitezy" },
      conditions: [{ questionId: "q1", answerId: "stay" }],
      rewards: [
        {
          minMatches: 1,
          effects: [{ type: EffectType.UniformSwing, params: { vitezy: 5 } }],
        },
      ],
    };
    const trailing = [
      question("q1"),
      question("q2"),
      question("q3", { visibleIf: { not: whileActive } }),
    ];

    const withStrategy = play(["stay", "stay"], createEngine(trailing), [
      strategy,
    ]).state;
    const without = play(["stay", "stay"], createEngine(trailing)).state;

    expect(withStrategy.isEnded).toBe(true);
    expect(withStrategy.mayoralResult!.percentages.vitezy).toBeGreaterThan(
      without.mayoralResult!.percentages.vitezy,
    );
  });

  it("resumes a save made before question positions were stored", () => {
    const engine = createEngine();
    const { state } = play(["stay", "deal", "stay"]);
    const legacy = JSON.parse(JSON.stringify(state)) as CampaignState;
    delete legacy.questionCursor;
    delete legacy.decisionCount;

    const resumed = engine.createInitialState("budapest", legacy, config);
    expect(resumed.currentQuestion?.id).toBe("q4");

    const next = engine.processTurn(
      resumed,
      decide(resumed, "stay"),
      [],
      settings,
      config,
    );
    expect(next.isEnded).toBe(true);
    expect(next.questionCursor).toBe(questions.length);
  });
});
