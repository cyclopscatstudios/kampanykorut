import { Condition } from "./condition";

// A newspaper of a strategic campaign: the masthead its editions are printed
// under. Several papers may run in one campaign, each numbering its own
// editions.
export interface NewspaperPaper {
  id: string;
  name: string;
  subtitle?: string;
  // Public path of the paper's logo, shown beside its name.
  logo?: string;
  // Small print in the top corner, e.g. "Ára: 4,80 Ft".
  price?: string;
}

// One pre-written story. Stories are flavour only and never affect votes.
export interface NewspaperItem {
  id: string;
  // The paper printing it; the first paper when left out.
  paper?: string;
  headline: string;
  lead: string;
  // Public path of the photo; it is shown in greyscale.
  image?: string;
  imageCredit?: string;
  // Without a condition the story can run at any edition.
  when?: Condition;
  // Relative chance among the stories eligible at the same edition.
  weight?: number;
  // A pinned story runs at the first edition where its condition holds.
  priority?: "pinned";
}

export interface NewspaperCadence {
  // Turns between two editions; the gap is picked from this range.
  minTurns: number;
  maxTurns: number;
}

export interface NewspaperConfig {
  cadence?: NewspaperCadence;
  papers: NewspaperPaper[];
  items: NewspaperItem[];
}

export interface NewspaperEdition {
  itemId: string;
  turn: number;
  // Printed in a turn that also brought an event announcement: it does not
  // pop up, only the newspaper button shows it.
  quiet?: boolean;
}

export interface NewspaperState {
  editions: NewspaperEdition[];
  // Editions the player has already read, counted from the first.
  readCount: number;
  // The earliest turn the next edition may come out.
  nextTurn?: number;
}

// An edition as the UI shows it: the story, its paper and its issue number
// within that paper.
export interface NewspaperEditionView {
  item: NewspaperItem;
  paper: NewspaperPaper;
  issue: number;
  turn: number;
}
