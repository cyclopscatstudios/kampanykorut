import { CombinedOevk } from "@/shared/types";
import { MandateCalculator } from "./MandateCalculator";
import { mockElectionConfig } from "./mocks/mockElectionConfig";

describe("MandateCalculator", () => {
  const calculator = new MandateCalculator();

  describe("calculateConstituencySeats", () => {
    it("should count constituency seats", () => {
      const data: CombinedOevk[] = [
        {
          megyekod: 1,
          megye: "BUDAPEST",
          oevk: 1,
          constituencyVotes: { party_a: 12000, party_b: 11000 },
          listVotes: {},
        },
        {
          megyekod: 1,
          megye: "BUDAPEST",
          oevk: 2,
          constituencyVotes: { party_b: 9000, party_a: 8000 },
          listVotes: {},
        },
      ];

      const result = (calculator as any).calculateSeats(data);

      expect(result).toEqual({ party_a: 1, party_b: 1 });
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
          constituencyVotes: { party_a: 12000, party_b: 10000, party_c: 1000 },
          listVotes: {},
        },
      ];

      const result = (calculator as any).calculateCompensation(data);

      expect(result.losingVotes).toEqual({ party_b: 10000, party_c: 1000 });
      expect(result.winnerCompensation).toEqual({ party_a: 1999 });
      expect(result.total).toEqual({ party_b: 10000, party_c: 1000, party_a: 1999 });
    });
  });

  describe("allocateListSeats (D'Hondt)", () => {
    it("should allocate list seats using D'Hondt method", () => {
      const listVotes = { party_a: 500_000, party_b: 400_000, party_c: 100_000 };
      const compensation = { party_a: 50_000, party_b: 20_000 };

      const seats = (calculator as any).allocateListSeats(
        listVotes,
        compensation,
        mockElectionConfig,
      );

      const totalSeats = (Object.values(seats) as number[]).reduce(
        (a: number, b: number) => a + b,
        0,
      );
      expect(totalSeats).toBe(mockElectionConfig.listSeats);
      expect(seats.party_a).toBeGreaterThan(seats.party_b);
    });

    it("should filter out parties below the threshold", () => {
      const listVotes = { party_a: 800, party_b: 150, party_c: 20 };
      const compensation = {};

      const seats = (calculator as any).allocateListSeats(
        listVotes,
        compensation,
        mockElectionConfig,
      );

      expect(seats.party_c).toBeUndefined();
    });

    it("should handle the case when only one party qualifies", () => {
      const listVotes = { party_a: 1000, party_b: 10 };
      const compensation = {};

      const seats = (calculator as any).allocateListSeats(
        listVotes,
        compensation,
        mockElectionConfig,
      );

      expect(seats.party_a).toBe(mockElectionConfig.listSeats);
    });
  });
});
