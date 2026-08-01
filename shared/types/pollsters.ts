export interface Pollster {
  id: string;
  label?: string;
  description?: string;
  errorMargin?: {
    min: number;
    max: number;
  };
  bias?: PollBias[];
  exclude?: boolean;
}

export type PollBias = ResultBias;

export interface ResultBias {
  type: string;
  partyBias: Record<string, number>;
}
