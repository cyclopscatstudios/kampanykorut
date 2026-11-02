import { CandidateListData, RawParty } from "@/shared/types";
import { SwingFactorId } from "../../../types/utils";

export type EstimateStatus = "safe" | "likely" | "tossup";

export type EstimateRow = {
  partyId: string;
  partyName: string;
  color: string;
  candidateName?: string;
  percent: number;
  low: number;
  high: number;
};

export type Estimate = {
  rows: EstimateRow[];
  margin: number;
  status: EstimateStatus;
  leader?: EstimateRow;
};

const MARGIN_BY_SWING: Record<SwingFactorId, number> = {
  [SwingFactorId.Low]: 3,
  [SwingFactorId.Medium]: 5,
  [SwingFactorId.High]: 7,
};

export const NATIONAL_MARGIN = 2;
const SAFE_LEAD = 15;
const FALLBACK_COLOR = "#94a3b8";

export function getMarginBySwing(swingFactorId: SwingFactorId) {
  return MARGIN_BY_SWING[swingFactorId];
}

export function getDistrictEstimate(
  district: Pick<CandidateListData, "partok" | "jeloltek">,
  parties: RawParty[],
  margin: number,
): Estimate {
  const shares = toShares(district.partok);
  return buildEstimate(shares, parties, margin, district.jeloltek);
}

export function getNationalEstimate(
  percentages: Record<string, number> | undefined,
  parties: RawParty[],
  margin = NATIONAL_MARGIN,
): Estimate | null {
  if (!percentages) {
    return null;
  }
  const shares = Object.entries(percentages)
    .filter(([partyId, share]) => partyId !== "_total" && share > 0)
    .map(([partyId, share]) => [partyId, share * 100] as const);
  if (!shares.length) {
    return null;
  }
  return buildEstimate(shares, parties, margin);
}

function toShares(partok: Record<string, number | undefined>) {
  const entries = Object.entries(partok).filter(
    (entry): entry is [string, number] =>
      typeof entry[1] === "number" && entry[1] > 0,
  );
  const total = entries.reduce((sum, [, votes]) => sum + votes, 0);
  if (!total) {
    return [];
  }
  return entries.map(
    ([partyId, votes]) => [partyId, (votes / total) * 100] as const,
  );
}

function buildEstimate(
  shares: ReadonlyArray<readonly [string, number]>,
  parties: RawParty[],
  margin: number,
  candidates?: Record<string, string[] | undefined>,
): Estimate {
  const rows = [...shares]
    .sort((a, b) => b[1] - a[1])
    .map(([partyId, share]): EstimateRow => {
      const party = parties.find((p) => p.id === partyId);
      const percent = Math.round(share);
      return {
        partyId,
        partyName: party?.name ?? partyId,
        color: party?.color ?? FALLBACK_COLOR,
        candidateName: candidates?.[partyId]?.[0],
        percent,
        low: Math.max(0, percent - margin),
        high: Math.min(100, percent + margin),
      };
    });

  const status = getStatus(rows, margin);
  return {
    rows: rows.filter((row) => row.partyName !== "_other"),
    margin,
    status,
    leader: status === "tossup" ? undefined : rows[0],
  };
}

function getStatus(rows: EstimateRow[], margin: number): EstimateStatus {
  const [first, second] = rows;
  if (!first) {
    return "tossup";
  }
  const lead = first.percent - (second?.percent ?? 0);
  if (lead <= margin * 2) {
    return "tossup";
  }
  return lead >= SAFE_LEAD ? "safe" : "likely";
}
