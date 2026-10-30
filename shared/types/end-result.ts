import { CalculateResults } from "./campaign";
import { MayoralResult } from "./mayoral-result";

export interface EndResultProps {
  playerSideDefeat: Asset;
  playerSideVictory: Asset;
  deadlock: Asset;
}

export interface Asset {
  imageUri: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface FinalResults extends CalculateResults {
  mayoralResult?: MayoralResult;
  winnerParty?: {
    party?: string;
    constituencySeats?: number;
    listSeats?: number;
    totalSeats?: number;
    hasMajority?: boolean;
    majorityType?: "simple" | "supermajority" | null;
  };
}
