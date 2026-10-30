import { ElectionConfig, ElectionType } from "../types";

export function getElectionType(
  config?: Pick<ElectionConfig, "election">,
): ElectionType {
  return config?.election?.type ?? "parliamentary";
}
