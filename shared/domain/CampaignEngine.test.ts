import { container } from "tsyringe";
import {
  CampaignState,
  CandidateListData,
  Decision,
  EffectType,
  ElectionConfig,
  RawEffect,
  RawParty,
} from "@/shared/types";
import { CampaignEngine } from "./CampaignEngine";
import { EffectApplier } from "./EffectApplier";
import { MandateCalculator } from "./MandateCalculator";
import { campaignState } from "./mocks/mockCampaignState";
import { mockElectionConfig } from "./mocks/mockElectionConfig";
import { mockCandidateListData, mockPartyListData } from "./mocks/mockListData";
import { PollsterEngine } from "./PollsterEngine";
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

  it("returns savedState directly when it has candidateListData", () => {
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

    expect(result).toBe(savedState);
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

    expect(result).toBe(savedState);
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
