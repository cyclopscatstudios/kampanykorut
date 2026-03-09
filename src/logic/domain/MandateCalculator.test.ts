import { ElectionConfigEngine } from "./ElectionConfigEngine";
import { MandateCalculator } from "./MandateCalculator";
import type { CombinedOevk } from "./MandateCalculator.types";

describe("MandateCalculator", () => {
  const config = {
    listSeats: 10,
    thresholdPercent: 5,
    parties: []
  };

  const electionConfigEngine = new ElectionConfigEngine(config);
  const calculator = new MandateCalculator(electionConfigEngine);

  describe("calculateConstituencySeats", () => {
    it("should count constituency seats", () => {
      const data: CombinedOevk[] = [
        {
          megyekod: 1,
          megye: "BUDAPEST",
          oevk: 1,
          constituencyVotes: {
            fidesz: 12000,
            ellenzek: 11000,
          },
          listVotes: {},
        },
        {
          megyekod: 1,
          megye: "BUDAPEST",
          oevk: 2,
          constituencyVotes: {
            ellenzek: 9000,
            fidesz: 8000,
          },
          listVotes: {},
        },
      ];

      const result = (calculator as any).calculateSeats(data);

      expect(result).toEqual({
        fidesz: 1,
        ellenzek: 1,
      });
    });

    it("should handle empty constituencies", () => {
      const data: CombinedOevk[] = [
        {
          megyekod: 1,
          megye: "X",
          oevk: 1,
          constituencyVotes: {},
          listVotes: {},
        },
      ];

      const result = (calculator as any).calculateSeats(data);
      expect(result).toEqual({});
    });
  });

  describe("calculateCompensation", () => {
    it("should correctly calculate losing votes and winner compensation", () => {
      const data: CombinedOevk[] = [
        {
          megyekod: 1,
          megye: "A",
          oevk: 1,
          constituencyVotes: {
            fidesz: 12000,
            ellenzek: 10000,
            mkkp: 1000,
          },
          listVotes: {},
        },
      ];

      const result = (calculator as any).calculateCompensation(data);

      expect(result.losingVotes).toEqual({
        ellenzek: 10000,
        mkkp: 1000,
      });

      expect(result.winnerCompensation).toEqual({
        fidesz: 1999,
      });

      expect(result.total).toEqual({
        ellenzek: 10000,
        mkkp: 1000,
        fidesz: 1999,
      });
    });
  });

  describe("allocateListSeats (D’Hondt)", () => {
    it("should allocate list seats using D'Hondt method", () => {
      const listVotes = {
        fidesz: 500_000,
        ellenzek: 400_000,
        mkkp: 100_000,
      };

      const compensation = {
        fidesz: 50_000,
        ellenzek: 20_000,
      };

      const seats = (calculator as any).allocateListSeats(
        listVotes,
        compensation,
      );

      const totalSeats = (Object.values(seats) as number[]).reduce(
        (a: number, b: number) => a + b,
        0,
      );
      expect(totalSeats).toBe(config.listSeats);

      expect(seats.fidesz).toBeGreaterThan(seats.ellenzek);
    });

    it("should filter out parties below the threshold", () => {
      const listVotes = {
        fidesz: 800,
        ellenzek: 150,
        kispart: 20,
      };

      const compensation = {};

      const seats = (calculator as any).allocateListSeats(
        listVotes,
        compensation,
      );

      expect(seats.kispart).toBeUndefined();
    });

    it("should handle the case when only one party qualifies", () => {
      const listVotes = {
        fidesz: 1000,
        kispart: 10,
      };

      const compensation = {};

      const seats = (calculator as any).allocateListSeats(
        listVotes,
        compensation,
      );

      expect(seats.fidesz).toBe(config.listSeats);
    });
  });
});
