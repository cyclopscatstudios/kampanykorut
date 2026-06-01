import { container } from "tsyringe";
import { candidateListData, partyListData } from "../mocks/mockListData";
import { VoteShareTransformer } from "./VoteShareTransformer";
import { CandidateListData, VoterEnvironmentConfig } from "@/shared/types";
import { VoterEnvironment } from "../VoterEnvironment";

let pipelineTransform: VoteShareTransformer;

const config: VoterEnvironmentConfig = {
  eligibleVoters: 20,
  listData: [
    {
      megye: "Teszt",
      megyekod: 1,
      oevk: 1,
      partok: { "party-a": 10, "party-b": 15 },
      telepules: "Teszt",
      jeloltek: {
        "party-a": ["candidate A"],
        "party-b": ["candidate B"],
      },
      valasztopolgar: 300,
    },
  ],
  maxTurnout: 85,
};

describe("PipelineTransform", () => {
  beforeEach(() => {
    const voterEnviorment = container.resolve(VoterEnvironment);
    voterEnviorment.configure(config);
    pipelineTransform = new VoteShareTransformer(voterEnviorment);
  });

  describe("distributeVotesByPartyShare", () => {
    it("should distribute votes by party share", () => {
      const result = pipelineTransform.distributeVotesByPartyShare(
        [
          {
            megye: "Teszt",
            megyekod: 1,
            oevk: 1,
            partok: { "party-a": 10, "party-b": 15 },
            telepules: "Teszt",
            jeloltek: {
              "party-a": ["candidate A"],
              "party-b": ["candidate B"],
            },
            valasztopolgar: 300,
          },
        ],
        [
          {
            megye: "Teszt",
            megyekod: 1,
            oevk: 1,
            partok: { "party-a": 10, "party-b": 15 },
          },
        ],
        50,
        { "party-a": 0.8, "party-b": 0.2 },
      );
      expect(result).toMatchSnapshot();
    });
    it("should return null if totalVoters exceeds district capacity", () => {
      const result = pipelineTransform.distributeVotesByPartyShare(
        [
          {
            megye: "Teszt",
            megyekod: 1,
            oevk: 1,
            partok: { "party-a": 10, "party-b": 15 },
            telepules: "Teszt",
            jeloltek: {
              "party-a": ["candidate A"],
              "party-b": ["candidate B"],
            },
            valasztopolgar: 300,
          },
        ],
        [
          {
            megye: "Teszt",
            megyekod: 1,
            oevk: 1,
            partok: { "party-a": 10, "party-b": 15 },
          },
        ],
        276,
        { "party-a": 1 },
      );
      expect(result).toBeNull();
    });
    it("should never exceeds district capacity", () => {
      const config: VoterEnvironmentConfig = {
        eligibleVoters: 1000,
        maxTurnout: 100,
        listData: [
          {
            megye: "Teszt",
            megyekod: 1,
            oevk: 1,
            partok: { "party-a": 0 },
            telepules: "Teszt",
            jeloltek: { "party-a": ["A"] },
            valasztopolgar: 10,
          },
        ],
      };

      const result = pipelineTransform.distributeVotesByPartyShare(
        config.listData,
        [
          {
            megye: "Teszt",
            megyekod: 1,
            oevk: 1,
            partok: { "party-a": 10, "party-b": 15 },
          },
        ],
        10,
        {
          "party-a": 1,
        },
      );

      expect(result).not.toBeNull();

      const district = result?.candidateList[0];
      const sum = Object.values(district?.partok ?? {}).reduce(
        (a, b) => (a ?? 0) + (b ?? 0),
        0,
      );

      expect(sum).toBeLessThanOrEqual(district?.valasztopolgar ?? 0);
    });
    it("should distributes exactly totalVoters additional votes", () => {
      const config: VoterEnvironmentConfig = {
        eligibleVoters: 1000,
        maxTurnout: 100,
        listData: [
          {
            megye: "Teszt",
            megyekod: 1,
            oevk: 1,
            partok: { "party-a": 5 },
            telepules: "Teszt",
            jeloltek: { "party-a": ["A"] },
            valasztopolgar: 100,
          },
        ],
      };

      const beforeVotes = Object.values(
        config.listData[0].partok as Record<string, number>,
      ).reduce((a, b) => a + b, 0);

      const result = pipelineTransform.distributeVotesByPartyShare(
        config.listData,
        [
          {
            megye: "Teszt",
            megyekod: 1,
            oevk: 1,
            partok: { "party-a": 10, "party-b": 15 },
          },
        ],
        20,
        {
          "party-a": 1,
        },
      )!;

      const afterVotes =
        Object.values(result.candidateList[0].partok).reduce(
          (a, b) => (a ?? 0) + (b ?? 0),
          0,
        ) ?? 0;

      expect(afterVotes - beforeVotes).toBe(20);
    });
    it("should respects capacity across multiple districts", () => {
      const districts: CandidateListData[] = [
        {
          megye: "A",
          megyekod: 1,
          oevk: 1,
          partok: { "party-a": 0 },
          telepules: "A",
          jeloltek: { "party-a": ["A1"] },
          valasztopolgar: 5,
        },
        {
          megye: "B",
          megyekod: 1,
          oevk: 2,
          partok: { "party-a": 0 },
          telepules: "B",
          jeloltek: { "party-a": ["B1"] },
          valasztopolgar: 15,
        },
      ];

      const result = pipelineTransform.distributeVotesByPartyShare(
        districts,
        [
          {
            megye: "A",
            megyekod: 1,
            oevk: 1,
            partok: { "party-a": 0 },
          },
          {
            megye: "B",
            megyekod: 1,
            oevk: 2,
            partok: { "party-a": 0 },
          },
        ],
        20,
        {
          "party-a": 1,
        },
      )!;

      for (const d of result.candidateList) {
        const sum = Object.values(d.partok).reduce(
          (a, b) => (a ?? 0) + (b ?? 0),
          0,
        );
        expect(sum).toBeLessThanOrEqual(d.valasztopolgar!);
      }
    });
  });
  describe("modifyByMotivation", () => {
    it("should modify votes by motivation target", () => {
      const result = pipelineTransform.modifyByMotivation(
        candidateListData,
        partyListData,
        {
          fidesz: 10,
          ellenzek: -5,
        },
      );
      expect(result).toMatchSnapshot();
    });
  });
});
