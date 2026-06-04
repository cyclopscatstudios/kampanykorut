export interface Pollster {
  id: string;
  label: string;
  description?: string;
  errorMargin: {
    min: number;
    max: number;
  };
  bias?: PollBias[];
}

export type PollBias = ResultBias;

export interface ResultBias {
  type: "result";
  partyBias: Record<string, number>;
}
