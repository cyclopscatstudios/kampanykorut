import { CalculateResults } from "./campaign";

export interface EndResultProps {
  playerSideDefeat: Asset;
  playerSideVictory: Asset;
}

export interface Asset {
  imageUri: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface FinalResults extends CalculateResults {
  winnerParty?: {
    party?: string;
    constituencySeats?: number;
    listSeats?: number;
    totalSeats?: number;
    hasMajority?: boolean;
    majorityType?: "simple" | "supermajority" | null;
  };
}
