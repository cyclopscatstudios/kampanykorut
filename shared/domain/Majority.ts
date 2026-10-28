export type MajorityType = "simple" | "supermajority";

export interface MajorityThresholds {
  simple: number;
  supermajority: number;
}

export function getMajorityThresholds(allSeats: number): MajorityThresholds {
  return {
    simple: Math.floor(allSeats / 2) + 1,
    supermajority: Math.ceil((2 * allSeats) / 3),
  };
}

export function getMajorityType(
  seats: number,
  allSeats: number,
): MajorityType | null {
  const thresholds = getMajorityThresholds(allSeats);
  if (seats >= thresholds.supermajority) {
    return "supermajority";
  }
  if (seats >= thresholds.simple) {
    return "simple";
  }
  return null;
}
