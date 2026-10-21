import { CandidateListData, RawParty } from "@/shared/types";
import { SwingFactorId } from "../../../types/utils";
import { getWinnerResultByCandidateList } from "../map.utils";
import { getSwingFactorByDistrict, SwingFactor } from "./swingFactor.utils";

export type DistrictInsight = {
  district: CandidateListData;
  leadingParty?: RawParty;
  swingFactor: SwingFactor;
};

const SWING_COLORS: Record<SwingFactorId, string> = {
  [SwingFactorId.High]: "#b8364a",
  [SwingFactorId.Medium]: "#d4a73a",
  [SwingFactorId.Low]: "#5ba84a",
};

const SWING_ORDER: Record<SwingFactorId, number> = {
  [SwingFactorId.High]: 0,
  [SwingFactorId.Medium]: 1,
  [SwingFactorId.Low]: 2,
};

export function getDistrictInsight(
  district: CandidateListData,
  parties: RawParty[],
): DistrictInsight {
  const { winner } = getWinnerResultByCandidateList(district);

  return {
    district,
    leadingParty: parties.find((party) => party.id === winner),
    swingFactor: getSwingFactorByDistrict(undefined, district),
  };
}

export function getSwingColor(swingFactor: SwingFactor) {
  return SWING_COLORS[swingFactor.id];
}

export function compareBySwing(a: DistrictInsight, b: DistrictInsight) {
  return SWING_ORDER[a.swingFactor.id] - SWING_ORDER[b.swingFactor.id];
}

export function formatVoters(voters: number) {
  return `${Math.round(voters / 1000)}`;
}

export function isSameDistrict(
  a?: Pick<CandidateListData, "megyekod" | "oevk"> | null,
  b?: Pick<CandidateListData, "megyekod" | "oevk"> | null,
) {
  return !!a && !!b && a.megyekod === b.megyekod && a.oevk === b.oevk;
}
