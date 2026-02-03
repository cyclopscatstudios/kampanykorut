import { listResults } from "./mocks/mockCandidateData";
import { ResultModifier } from "./ResultModifier";
import { type CandidateListData } from "./ResultTransformer/PipelineTransform";
import { type VoterEnvironmentConfig } from "./VoterEnvironment";

const electionConfig = {
  listSeats: 10,
  thresholdPercent: 5,
};

describe("ResultModifier", () => {
  let baseList: CandidateListData[];
  const voterEnvironmentConfig: VoterEnvironmentConfig = {
    maxTurnout: 85,
    eligibleVoters: 8215304,
    listData: listResults,
  };

  beforeEach(() => {
    baseList = [
      {
        megyekod: 1,
        megye: "BUDAPEST",
        oevk: 1,
        telepules: "Teszt körzet",
        valasztopolgar: 1000,
        partok: {
          fidesz: 400,
          ellenzek: 300,
          mkkp: 50,
        },
      },
    ];
  });

  describe("modifyDistrict", () => {
    it("should move votes from one party to another", () => {
      const rm = new ResultModifier(voterEnvironmentConfig, electionConfig);

      const result = rm.modifyDistricts(baseList, [
        {
          amount: 100,
          megyekod: 1,
          oevk: 1,
          targetParty: "ellenzek",
          from: { party: "fidesz", type: "party" },
        },
      ]);

      const row = result[0];

      expect(row.partok.fidesz).toBe(300);
      expect(row.partok.ellenzek).toBe(400);
    });

    it("should not be able to take more votes than available", () => {
      const rm = new ResultModifier(voterEnvironmentConfig, electionConfig);

      const result = rm.modifyDistricts(baseList, [
        {
          amount: 9999,
          megyekod: 1,
          oevk: 1,
          targetParty: "ellenzek",
          from: { party: "mkkp", type: "party" },
        },
      ]);

      const row = result[0];

      expect(row.partok.mkkp).toBe(0);
      expect(row.partok.ellenzek).toBe(350);
    });

    it("should take votes from 'bizonytalan' if from === 'bizonytalan'", () => {
      const rm = new ResultModifier(voterEnvironmentConfig, electionConfig);

      const result = rm.modifyDistricts(baseList, [
        {
          amount: 200,
          megyekod: 1,
          oevk: 1,
          targetParty: "ellenzek",
          from: { type: "bizonytalan" },
        },
      ]);

      const row = result[0];

      expect(row.partok.ellenzek).toBe(500);
    });

    it("should not modify other districts", () => {
      const other: CandidateListData = {
        megyekod: 2,
        megye: "PEST",
        oevk: 1,
        telepules: "",
        valasztopolgar: 12,
        partok: { fidesz: 10 },
      };

      const rm = new ResultModifier(voterEnvironmentConfig, electionConfig);

      const result = rm.modifyDistricts(
        [...baseList, other],
        [
          {
            amount: 50,
            megyekod: 1,
            oevk: 1,
            targetParty: "ellenzek",
            from: { party: "fidesz", type: "party" },
          },
        ],
      );

      expect(result[1]).toEqual(other);
    });
  });

  describe("applyNationalSwingToList", () => {
    it("should keep all vote counts", () => {
      const rm = new ResultModifier(voterEnvironmentConfig, electionConfig);

      const baseShare = {
        fidesz: 0.5,
        ellenzek: 0.4,
        mkkp: 0.1,
      };

      const targetShare = {
        fidesz: 0.4,
        ellenzek: 0.5,
        mkkp: 0.1,
      };

      const result = rm.applyNationalSwingToList(
        baseList,
        baseShare,
        targetShare,
      );

      const originalSum = Object.values(baseList[0].partok).reduce(
        (a, b) => (a ?? 0) + (b ?? 0),
        0,
      );

      const newSum = Object.values(result[0].partok).reduce(
        (a, b) => (a ?? 0) + (b ?? 0),
        0,
      );

      expect(newSum).toBe(originalSum);
    });

    it("should proportionally shift votes", () => {
      const rm = new ResultModifier(voterEnvironmentConfig, electionConfig);

      const result = rm.applyNationalSwingToList(
        baseList,
        {
          fidesz: 0.5,
          ellenzek: 0.4,
          mkkp: 0.1,
        },
        {
          fidesz: 0.3,
          ellenzek: 0.6,
          mkkp: 0.1,
        },
      );

      const row = result[0];

      expect(row.partok.ellenzek!).toBeGreaterThan(300);
      expect(row.partok.fidesz!).toBeLessThan(400);
    });
  });

  describe("distributeVotesByPartyShare", () => {
    it("should distribute votes by party share", () => {
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
      const rm = new ResultModifier(config, electionConfig);
      const result = rm.distributeVotesByPartyShare(
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
        50,
        { "party-a": 0.8, "party-b": 0.2 },
      );
      expect(result).toMatchSnapshot();
    });
    it("should return null if totalVoters exceeds district capacity", () => {
      const config: VoterEnvironmentConfig = {
        eligibleVoters: 1000,
        maxTurnout: 100,
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
      };
      const rm = new ResultModifier(config, electionConfig);
      const result = rm.distributeVotesByPartyShare(
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

      const rm = new ResultModifier(config, electionConfig);

      const result = rm.distributeVotesByPartyShare(config.listData, 10, {
        "party-a": 1,
      });

      expect(result).not.toBeNull();

      const district = result!.districts[0];
      const sum = Object.values(district.partok).reduce(
        (a, b) => (a ?? 0) + (b ?? 0),
        0,
      );

      expect(sum).toBeLessThanOrEqual(district.valasztopolgar!);
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

      const rm = new ResultModifier(config, electionConfig);

      const beforeVotes =
        Object.values(config.listData[0].partok).reduce(
          (a, b) => (a ?? 0) + (b ?? 0),
          0,
        ) ?? 0;

      const result = rm.distributeVotesByPartyShare(config.listData, 20, {
        "party-a": 1,
      })!;

      const afterVotes =
        Object.values(result.districts[0].partok).reduce(
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

      const rm = new ResultModifier(
        {
          eligibleVoters: 1000,
          maxTurnout: 100,
          listData: districts,
        },
        electionConfig,
      );

      const result = rm.distributeVotesByPartyShare(districts, 20, {
        "party-a": 1,
      })!;

      for (const d of result.districts) {
        const sum = Object.values(d.partok).reduce(
          (a, b) => (a ?? 0) + (b ?? 0),
          0,
        );
        expect(sum).toBeLessThanOrEqual(d.valasztopolgar!);
      }
    });
  });
});
