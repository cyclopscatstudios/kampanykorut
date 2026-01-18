import { ResultModifier, type ConstituencyDataProps } from "./ResultModifier";
import { type VoterEnvironmentConfig } from "./VoterEnvironment";

const listResults = [
  {
    megyekod: 1,
    megye: "BUDAPEST",
    oevk: 1,
    telepules: "",
    partok: {
      ellenzeki_osszefogas: 21300,
      fidesz: 18767,
      mkkp: 2842,
      megoldas_mozgalom: 472,
      mi_hazank: 1307,
      normalis_elet: 155,
    },
  },
  {
    megyekod: 1,
    megye: "BUDAPEST",
    oevk: 2,
    telepules: "",
    partok: {
      ellenzeki_osszefogas: 26398,
      fidesz: 21814,
      mkkp: 2963,
      megoldas_mozgalom: 484,
      mi_hazank: 1696,
      normalis_elet: 188,
    },
  },
  {
    megyekod: 1,
    megye: "BUDAPEST",
    oevk: 3,
    telepules: "",
    partok: {
      ellenzeki_osszefogas: 25194,
      fidesz: 21352,
      mkkp: 3717,
      megoldas_mozgalom: 449,
      mi_hazank: 1358,
      normalis_elet: 132,
    },
  },
];

describe("ResultModifier", () => {
  let baseList: ConstituencyDataProps[];
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
      const rm = new ResultModifier(voterEnvironmentConfig);

      const result = rm.modifyDistrict(
        baseList,
        1,
        1,
        "ellenzek",
        100,
        "fidesz",
      );

      const row = result[0];

      expect(row.partok.fidesz).toBe(300);
      expect(row.partok.ellenzek).toBe(400);
    });

    it("should not be able to take more votes than available", () => {
      const rm = new ResultModifier(voterEnvironmentConfig);

      const result = rm.modifyDistrict(
        baseList,
        1,
        1,
        "ellenzek",
        9999,
        "mkkp",
      );

      const row = result[0];

      expect(row.partok.mkkp).toBe(0);
      expect(row.partok.ellenzek).toBe(350);
    });

    it("should take votes from 'bizonytalan' if from === 'bizonytalan'", () => {
      const rm = new ResultModifier(voterEnvironmentConfig);

      const result = rm.modifyDistrict(
        baseList,
        1,
        1,
        "ellenzek",
        200,
        "bizonytalan",
      );

      const row = result[0];

      expect(row.partok.ellenzek).toBe(500);
    });

    it("should not modify other districts", () => {
      const other: ConstituencyDataProps = {
        megyekod: 2,
        megye: "PEST",
        oevk: 1,
        telepules: "",
        partok: { fidesz: 10 },
      };

      const rm = new ResultModifier(voterEnvironmentConfig);

      const result = rm.modifyDistrict(
        [...baseList, other],
        1,
        1,
        "ellenzek",
        50,
        "fidesz",
      );

      expect(result[1]).toEqual(other);
    });
  });

  describe("applyNationalSwingToList", () => {
    it("should keep all vote counts", () => {
      const rm = new ResultModifier(voterEnvironmentConfig);

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
      const rm = new ResultModifier(voterEnvironmentConfig);

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
      const rm = new ResultModifier(voterEnvironmentConfig);
      const result = rm.distributeVotesByPartyShare(
        [
          {
            megyekod: 1,
            megye: "BUDAPEST",
            oevk: 1,
            telepules: "Budapest V. kerület",
            partok: {
              ellenzeki_osszefogas: 21300,
              fidesz: 18767,
              mkkp: 2842,
              megoldas_mozgalom: 472,
              mi_hazank: 1307,
              normalis_elet: 155,
            },
          },
          {
            megyekod: 1,
            megye: "BUDAPEST",
            oevk: 2,
            telepules: "Budapest XI. kerület",
            partok: {
              ellenzeki_osszefogas: 26398,
              fidesz: 21814,
              mkkp: 2963,
              megoldas_mozgalom: 484,
              mi_hazank: 1696,
              normalis_elet: 188,
            },
          },
          {
            megyekod: 1,
            megye: "BUDAPEST",
            oevk: 3,
            telepules: "Budapest XII. kerület",
            partok: {
              ellenzeki_osszefogas: 25194,
              fidesz: 21352,
              mkkp: 3717,
              megoldas_mozgalom: 449,
              mi_hazank: 1358,
              normalis_elet: 132,
            },
          },
        ],
        200000,
        {
          fidesz: 0.46,
          ellenzeki_osszefogas: 0.51,
          mi_hazank: 0.03,
        },
      );
      expect(result?.totalVotes).toBe(350588);
      expect(result?.percentages).toEqual({
        ellenzeki_osszefogas: 0.49885335493513755,
        fidesz: 0.43907093226237065,
        megoldas_mozgalom: 0.004007553025203373,
        mi_hazank: 0.029553207753830708,
        mkkp: 0.027160085342339157,
        normalis_elet: 0.001354866681118578,
      });
      expect(result?.totals).toEqual({
        ellenzeki_osszefogas: 174892,
        fidesz: 153933,
        megoldas_mozgalom: 1405,
        mi_hazank: 10361,
        mkkp: 9522,
        normalis_elet: 475,
      });
      expect(result?.districts).toMatchSnapshot();
    });
  });
});
