import { BootstrapIcon } from "./icon";

// How an issue stands in one area: `strength` is how much it moves voters
// there (0 = not at all, 3 = decisive), `opinion` is where the voters stand
// on it, from -2 (strongly against) to +2 (strongly for).
export interface IssueArea {
  strength: number;
  opinion: number;
}

export interface Issue {
  id: string;
  name: string;
  icon?: BootstrapIcon;
  description?: string;
  // Applies wherever `areas` has no entry.
  default?: IssueArea;
  // Keyed by proportional region id or by megyekod.
  areas?: Record<string, IssueArea>;
  // Each party's starting position, from -2 to +2. Events can move them.
  positions: Record<string, number>;
}

// Moves a party's position on an issue, by `shift` or to `position`. Without
// `party` it moves the player's party. Voters then drift, area by area,
// towards the parties that stand closest to them.
export interface IssueStanceParams {
  issueId: string;
  party?: string;
  shift?: number;
  position?: number;
}

export type IssuePositions = Record<string, Record<string, number>>;
