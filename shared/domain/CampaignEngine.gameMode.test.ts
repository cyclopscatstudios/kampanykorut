import {
  CampaignEvent,
  CandidateListData,
  Decision,
  EffectType,
  GameMode,
  MayoralElectionConfig,
  PoliticalConfig,
  RawAnsweEffectProps,
  RawQuestion,
} from "@shared/types";
import { container } from "tsyringe";
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
    partok: { karacsony: 9000, vitezy: 8000 },
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

const question = (id: string, gameModes?: GameMode[]): RawQuestion => ({
  id,
  question: id,
  possibleAnswers: [{ id: "A", label: "A" }],
  ...(gameModes && { gameModes }),
});

const questions = [
  question("both"),
  question("classic_only", ["classic"]),
  question("strategic_only", ["strategic"]),
  question("last"),
];

const answers: RawAnsweEffectProps[] = [
  {
    id: "both",
    answers: [
      {
        id: "A",
        effects: [
          { type: EffectType.UniformSwing, params: { vitezy: 1 } },
          {
            type: EffectType.UniformSwing,
            params: { vitezy: 2 },
            gameModes: ["strategic"],
          },
          {
            type: EffectType.IssueStance,
            params: { issueId: "kozlekedes", shift: 1 },
          },
        ],
      },
    ],
  },
];

const studentsEvent: CampaignEvent = {
  id: "students",
  conditions: [
    {
      if: { type: "answer-selected", questionId: "both", answerId: "A" },
      effects: [
        {
          type: "set-relation",
          relationId: "students",
          tone: "good",
          label: "Lelkes",
          description: "A diákság kiáll melletted.",
        },
      ],
    },
  ],
};

const strategicOnlyEvent: CampaignEvent = {
  id: "strategic_only",
  gameModes: ["strategic"],
  conditions: [{ if: { type: "turn", min: 1 }, effects: [] }],
};

const dual: PoliticalConfig = { gameModes: ["classic", "strategic"] };

function createEngine(politicalConfig?: PoliticalConfig) {
  return new CampaignEngine(
    districts,
    questions,
    answers,
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    container.resolve(PollsterEngine),
    container.resolve(MayoralResultCalculator),
    container.resolve(CampaignEventEngine),
    container.resolve(CandidateWithdrawalTransformer),
    undefined,
    undefined,
    [studentsEvent, strategicOnlyEvent],
    undefined,
    politicalConfig,
  );
}

function start(politicalConfig?: PoliticalConfig, gameMode?: GameMode) {
  const engine = createEngine(politicalConfig);
  const state = engine.createInitialState(
    "budapest",
    gameMode
      ? {
          activeCampaignId: "budapest",
          gameMode,
          turn: 0,
          isEnded: false,
          isBaseResultsAlreadyApplied: false,
        }
      : null,
    config,
  );
  return { engine, state };
}

const settings = { showAdvisorFeedback: false, language: "hu" as const };

const decide = (questionId: string, effects: Decision["effects"]) => ({
  questionId,
  answerId: "A",
  effects,
});

describe("CampaignEngine game modes", () => {
  it("starts a dual side in classic unless strategic was asked for", () => {
    expect(start(dual).state.gameMode).toBe("classic");
    expect(start(dual, "strategic").state.gameMode).toBe("strategic");
  });

  it("keeps a single-mode side in its own mode", () => {
    expect(start({ gameMode: "strategic" }, "classic").state.gameMode).toBe(
      "strategic",
    );
    expect(start(undefined, "strategic").state.gameMode).toBe("classic");
  });

  it("skips questions of the other mode and counts turns per mode", () => {
    const classic = start(dual, "classic");
    const strategic = start(dual, "strategic");
    expect(classic.state.decisionCount).toBe(3);
    expect(strategic.state.decisionCount).toBe(3);

    const next = (run: ReturnType<typeof start>) =>
      run.engine.processTurn(
        run.state,
        decide("both", []),
        [],
        settings,
        config,
      ).currentQuestion?.id;
    expect(next(classic)).toBe("classic_only");
    expect(next(strategic)).toBe("strategic_only");
  });

  it("offers only the effects of the current mode", () => {
    const classic = start(dual, "classic").state.answerEffects?.[0].effects;
    const strategic = start(dual, "strategic").state.answerEffects?.[0].effects;
    expect(classic?.map((e) => e.type)).toEqual([EffectType.UniformSwing]);
    expect(strategic).toHaveLength(3);
  });

  it("runs relations and strategic events only in strategic mode", () => {
    const run = (gameMode: GameMode) => {
      const { engine, state } = start(dual, gameMode);
      return engine.processTurn(
        state,
        decide("both", []),
        [],
        settings,
        config,
      );
    };
    const classic = run("classic");
    const strategic = run("strategic");

    expect(classic.politicalDashboard?.relations).toBeUndefined();
    expect(classic.campaignEvents?.triggeredEventIds).toEqual(["students"]);
    expect(strategic.politicalDashboard?.relations?.students?.tone).toBe(
      "good",
    );
    expect(strategic.campaignEvents?.triggeredEventIds).toEqual([
      "students",
      "strategic_only",
    ]);
  });
});
