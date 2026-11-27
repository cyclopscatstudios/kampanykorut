import { CandidateListData, District } from "@shared/types";
import { t } from "i18next";
import { SwingFactorId } from "../../../types/utils";
import {
  getWinnerResultByCandidateList,
  getWinnerResultByDistrict,
} from "../map.utils";

export type SwingFactor = {
  id: SwingFactorId;
  label: string;
};

export function getSwingFactorByDistrict(
  district?: District | null,
  canidateData?: CandidateListData,
) {
  let results = getWinnerResultByDistrict(district);
  if (canidateData) {
    results = getWinnerResultByCandidateList(canidateData);
  }
  if (!results) {
    return {
      label: t("bottomBar.low"),
      id: SwingFactorId.Low,
    };
  }
  const { diffPercentage: percent } = results;

  if (percent < 5) {
    return {
      label: t("bottomBar.high"),
      id: SwingFactorId.High,
    };
  }

  if (percent < 15) {
    return {
      label: t("bottomBar.medium"),
      id: SwingFactorId.Medium,
    };
  }

  if (percent < 20) {
    return {
      label: t("bottomBar.low"),
      id: SwingFactorId.Low,
    };
  }
  return {
    label: t("bottomBar.low"),
    id: SwingFactorId.Low,
  };
}
