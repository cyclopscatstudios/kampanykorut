import {
  CampaignEvent,
  CandidateListData,
  Decision,
  EffectType,
  ElectionConfig,
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

const district = (
  oevk: number,
  partok: Record<string, number>,
): CandidateListData => ({
  megyekod: 17,
  megye: "Tolna",
  oevk,
  telepules: `Tolna ${oevk}`,
  valasztopolgar: 80000,
  partok,
});

const districts: CandidateListData[] = [
  district(1, { fidesz: 20000, tisza: 30000, mi_hazank: 3000 }),
  district(2, { fidesz: 24000, tisza: 25000, mi_hazank: 3000 }),
  district(3, { fidesz: 25000, tisza: 24500, mi_hazank: 2000 }),
];

const config: ElectionConfig = {
  title: "Teszt",
  year: "2026",
  listSeats: 2,
  allSeats: 5,
  thresholdPercent: 5,
  districtMap: "2024",
  partyListVotes: { fidesz: 70000, tisza: 80000, mi_hazank: 8000 },
  parties: [
    { id: "fidesz", name: "Fidesz", color: "#f80" },
    { id: "tisza", name: "Tisza", color: "#0cf" },
    { id: "mi_hazank", name: "Mi Hazánk", color: "#690" },
  ],
  playableSides: [
    {
      id: "fidesz",
      label: "Fidesz",
      mainCandidates: [{ id: "orban_viktor", label: "Orbán Viktor" }],
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
  id: "mi_hazank_visszalep",
  conditions: [
    {
      if: { type: "answer-selected", questionId: "q1", answerId: "A" },
      effects: [
        {
          type: "withdraw-district-candidates",
          partyId: "mi_hazank",
          closeRace: { between: ["fidesz", "tisza"], maxGapPercent: 3 },
          redistribution: { fidesz: 0.6, tisza: 0.15, _abstain: 0.25 },
        },
      ],
    },
  ],
};

const settings = { showAdvisorFeedback: false, language: "hu" as const };

const createEngine = () => {
  const pollsterEngine = container.resolve(PollsterEngine);
  pollsterEngine.configure();
  return new CampaignEngine(
    districts,
    questions,
    [],
    container.resolve(ResultModifier),
    container.resolve(EffectApplier),
    container.resolve(MandateCalculator),
    pollsterEngine,
    container.resolve(MayoralResultCalculator),
    container.resolve(CampaignEventEngine),
    container.resolve(CandidateWithdrawalTransformer),
    undefined,
    undefined,
    [withdrawal],
  );
};

const decision = (
  questionId: string,
  params: Record<string, number> = { fidesz: 0 },
): Decision => ({
  questionId,
  answerId: "A",
  effects: [{ type: EffectType.UniformSwing, params }],
});

function playFirstTurn() {
  const engine = createEngine();
  const initial = {
    ...engine.createInitialState("teszt", null, config),
    playerSide: { partyId: "fidesz", candidateId: "orban_viktor" },
  };
  const next = engine.processTurn(
    initial,
    decision("q1"),
    [],
    settings,
    config,
  );
  return { engine, next };
}

describe("district withdrawal", () => {
  it("withdraws only in the close districts and moves the votes", () => {
    const { next } = playFirstTurn();

    expect(next.candidateListData?.map((d) => d.partok)).toEqual([
      expect.objectContaining({ fidesz: 20000, tisza: 30000, mi_hazank: 3000 }),
      expect.objectContaining({ fidesz: 25800, tisza: 25450, mi_hazank: 0 }),
      expect.objectContaining({ fidesz: 26200, tisza: 24800, mi_hazank: 0 }),
    ]);
    expect(next.districtWithdrawals).toEqual({
      mi_hazank: [
        { megyekod: 17, oevk: 2 },
        { megyekod: 17, oevk: 3 },
      ],
    });
    expect(next.candidates?.mi_hazank?.status ?? "active").toBe("active");
  });

  it("gives a withdrawn district no new votes from later answers", () => {
    const { engine, next } = playFirstTurn();

    const after = engine.processTurn(
      next,
      decision("q2", { mi_hazank: 5, tisza: -5 }),
      [{ questionId: "q1", answerId: "A" } as never],
      settings,
      config,
    );

    expect(after.candidateListData?.map((d) => d.partok.mi_hazank)).toEqual([
      expect.any(Number),
      0,
      0,
    ]);
    expect(after.candidateListData?.[0].partok.mi_hazank).toBeGreaterThan(3000);
  });
});
