import { Condition } from "./condition";

export interface NewspaperPaper {
  id: string;
  name: string;
  subtitle?: string;
  logo?: string;
  price?: string;
}

export interface NewspaperItem {
  id: string;
  paper?: string;
  headline: string;
  lead: string;
  image?: string;
  imageCredit?: string;
  when?: Condition;
  weight?: number;
  priority?: "pinned";
}

export interface NewspaperCadence {
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
  quiet?: boolean;
}

export interface NewspaperState {
  editions: NewspaperEdition[];
  readCount: number;
  nextTurn?: number;
}

export interface NewspaperEditionView {
  item: NewspaperItem;
  paper: NewspaperPaper;
  issue: number;
  turn: number;
}
