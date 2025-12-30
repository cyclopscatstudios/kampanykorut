import { ResultModifier, type OevkResult } from "./ResultModifier";


describe("ResultModifier", () => {
  let baseList: OevkResult[];

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
      const rm = new ResultModifier(baseList);

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
      const rm = new ResultModifier(baseList);

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
      const rm = new ResultModifier(baseList);

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
      const other: OevkResult = {
        megyekod: 2,
        megye: "PEST",
        oevk: 1,
        partok: { fidesz: 10 },
      };

      const rm = new ResultModifier([...baseList, other]);

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
      const rm = new ResultModifier(baseList);

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

      const result = rm.applyNationalSwingToList(baseList, baseShare, targetShare);

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
      const rm = new ResultModifier(baseList);

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
});
