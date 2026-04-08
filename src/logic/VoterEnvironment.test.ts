import { describe, it, expect } from "vitest";
import { VoterEnvironment } from "./VoterEnvironment";
import type { CandidateListData } from "./domain/ResultTransformer/VoteShareTransformer.types";

const makeDistrict = (
  partok: Record<string, number | undefined>,
  overrides?: Partial<CandidateListData>,
): CandidateListData => ({
  megyekod: 1,
  megye: "Pest",
  oevk: 1,
  telepules: "Budapest",
  valasztopolgar: 10000,
  partok,
  ...overrides,
});

describe("VoterEnvironment", () => {
  describe("constructor / getAvailableVoters", () => {
    it("calculates available voters as floor(eligibleVoters * maxTurnout / 100) minus current voters", () => {
      const listData = [makeDistrict({ fidesz: 1000, ellenzek: 500 })];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 10000,
        maxTurnout: 80,
        listData,
      });
      // maxAvailableVoters = floor(10000 * 80 / 100) = 8000
      // voters = 1000 + 500 = 1500
      expect(env.getAvailableVoters()).toBe(6500);
    });

    it("handles districtSum ?? 0 branch when partok is empty (no votes to sum)", () => {
      const listData = [makeDistrict({})];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 5000,
        maxTurnout: 100,
        listData,
      });
      // voters = 0, maxAvailableVoters = 5000
      expect(env.getAvailableVoters()).toBe(5000);
    });

    it("handles partok with undefined values via votes ?? 0 in getVoters", () => {
      const listData = [makeDistrict({ fidesz: 2000, ellenzek: undefined })];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 10000,
        maxTurnout: 50,
        listData,
      });
      // voters = 2000 + 0 = 2000, maxAvailableVoters = 5000
      expect(env.getAvailableVoters()).toBe(3000);
    });

    it("sums voters across multiple districts", () => {
      const listData = [
        makeDistrict({ a: 1000 }, { megyekod: 1, oevk: 1 }),
        makeDistrict({ b: 2000 }, { megyekod: 1, oevk: 2 }),
      ];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 20000,
        maxTurnout: 100,
        listData,
      });
      // voters = 3000, maxAvailableVoters = 20000
      expect(env.getAvailableVoters()).toBe(17000);
    });
  });

  describe("setVoters", () => {
    it("updates voters and recalculates getAvailableVoters", () => {
      const initial = [makeDistrict({ fidesz: 1000 })];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 10000,
        maxTurnout: 100,
        listData: initial,
      });
      expect(env.getAvailableVoters()).toBe(9000);

      env.setVoters([makeDistrict({ fidesz: 3000, ellenzek: 2000 })]);
      // voters = 5000, maxAvailableVoters remains 10000
      expect(env.getAvailableVoters()).toBe(5000);
    });

    it("handles undefined partok values in new listData", () => {
      const initial = [makeDistrict({ fidesz: 500 })];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 10000,
        maxTurnout: 100,
        listData: initial,
      });

      env.setVoters([makeDistrict({ fidesz: undefined, ellenzek: undefined })]);
      // voters = 0
      expect(env.getAvailableVoters()).toBe(10000);
    });
  });

  describe("getRemainingVoteCount", () => {
    it("uses district.valasztopolgar directly when defined", () => {
      const listData = [
        makeDistrict({ fidesz: 3000 }, { valasztopolgar: 10000 }),
      ];
      const env = new VoterEnvironment();
      const district = makeDistrict(
        { fidesz: 3000 },
        { valasztopolgar: 10000, oevk: 1, megyekod: 1 },
      );
      env.configure({
        eligibleVoters: 100000,
        maxTurnout: 100,
        listData,
      });
      expect(env.getRemainingVoteCount(district)).toBe(7000);
    });

    it("falls back to voterBase when district.valasztopolgar is undefined", () => {
      // Initial listData seeds the voterBase with valasztopolgar = 8000
      const listData = [
        makeDistrict(
          { fidesz: 1000 },
          { valasztopolgar: 8000, megyekod: 3, oevk: 5 },
        ),
      ];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 100000,
        maxTurnout: 100,
        listData,
      });

      // District with undefined valasztopolgar — should fall back to voterBase (8000)
      const district: CandidateListData = {
        megyekod: 3,
        oevk: 5,
        megye: "Borsod",
        telepules: "Miskolc",
        valasztopolgar: undefined as unknown as number,
        partok: { fidesz: 2000 },
      };
      // voterBase for 3-5 = 8000, votes = 2000 → remaining = 6000
      expect(env.getRemainingVoteCount(district)).toBe(6000);
    });

    it("falls back to 0 when voterBase is not found and valasztopolgar is undefined", () => {
      const listData = [
        makeDistrict({ fidesz: 500 }, { megyekod: 1, oevk: 1 }),
      ];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 100000,
        maxTurnout: 100,
        listData,
      });

      // District with unknown key (99-99) and no valasztopolgar
      const district: CandidateListData = {
        megyekod: 99,
        oevk: 99,
        megye: "Unknown",
        telepules: "Unknown",
        valasztopolgar: undefined as unknown as number,
        partok: { fidesz: 100 },
      };
      // voterBase not found → 0, votes = 100 → remaining = 0 - 100 = -100
      expect(env.getRemainingVoteCount(district)).toBe(-100);
    });

    it("treats undefined partok values as 0 in vote subtraction", () => {
      const listData = [
        makeDistrict(
          { fidesz: 1000 },
          { valasztopolgar: 5000, megyekod: 1, oevk: 1 },
        ),
      ];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 100000,
        maxTurnout: 100,
        listData,
      });

      const district = makeDistrict(
        { fidesz: 1000, ellenzek: undefined },
        { valasztopolgar: 5000, oevk: 1, megyekod: 1 },
      );
      // allVoteCount = 1000 + 0 = 1000, remaining = 5000 - 1000 = 4000
      expect(env.getRemainingVoteCount(district)).toBe(4000);
    });

    it("handles all-undefined partok (allVoteCount = 0)", () => {
      const listData = [
        makeDistrict({}, { valasztopolgar: 6000, megyekod: 1, oevk: 1 }),
      ];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 100000,
        maxTurnout: 100,
        listData,
      });

      const district = makeDistrict(
        { a: undefined, b: undefined },
        { valasztopolgar: 6000, oevk: 1, megyekod: 1 },
      );
      expect(env.getRemainingVoteCount(district)).toBe(6000);
    });
  });

  describe("getRemainingVotesInDistricts", () => {
    it("sums getRemainingVoteCount across all provided districts", () => {
      const listData = [
        makeDistrict(
          { fidesz: 2000 },
          { valasztopolgar: 10000, megyekod: 1, oevk: 1 },
        ),
        makeDistrict(
          { ellenzek: 3000 },
          { valasztopolgar: 10000, megyekod: 1, oevk: 2 },
        ),
      ];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 100000,
        maxTurnout: 100,
        listData,
      });

      const districts = [
        makeDistrict(
          { fidesz: 2000 },
          { valasztopolgar: 10000, oevk: 1, megyekod: 1 },
        ),
        makeDistrict(
          { ellenzek: 3000 },
          { valasztopolgar: 10000, oevk: 2, megyekod: 1 },
        ),
      ];
      // (10000 - 2000) + (10000 - 3000) = 8000 + 7000 = 15000
      expect(env.getRemainingVotesInDistricts(districts)).toBe(15000);
    });

    it("returns 0 for an empty districts array", () => {
      const listData = [makeDistrict({ fidesz: 1000 })];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 10000,
        maxTurnout: 100,
        listData,
      });
      expect(env.getRemainingVotesInDistricts([])).toBe(0);
    });
  });

  describe("setVoterBase (tested via getRemainingVoteCount fallback)", () => {
    it("stores row.valasztopolgar ?? 0 so undefined valasztopolgar rows store 0", () => {
      // Seed with a district where valasztopolgar is undefined
      const listData: CandidateListData[] = [
        {
          megyekod: 5,
          oevk: 3,
          megye: "Gyor",
          telepules: "Gyor",
          valasztopolgar: undefined as unknown as number,
          partok: { fidesz: 500 },
        },
      ];
      const env = new VoterEnvironment();
      env.configure({
        eligibleVoters: 100000,
        maxTurnout: 100,
        listData,
      });

      // Query with matching key but no valasztopolgar → voterBase should be 0
      const district: CandidateListData = {
        megyekod: 5,
        oevk: 3,
        megye: "Gyor",
        telepules: "Gyor",
        valasztopolgar: undefined as unknown as number,
        partok: { fidesz: 200 },
      };
      // voterBase = 0, votes = 200 → remaining = -200
      expect(env.getRemainingVoteCount(district)).toBe(-200);
    });
  });
});
