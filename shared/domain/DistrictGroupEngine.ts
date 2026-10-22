import { injectable } from "tsyringe";
import { createLogger } from "../logger";
import { CandidateListData, DistrictGroup } from "../types";
import { defaultGroups as DEFAULT_GROUPS } from "./DefaultGroups";

const log = createLogger("DistrictGroupEngine");

@injectable()
export class DistrictGroupEngine {
  private districtGroups: DistrictGroup[] = [];
  private candidateListData: CandidateListData[] = [];

  constructor() {
    log.debug("DistrictGroupEngine initialized");
  }

  configure(
    candidateListData: CandidateListData[],
    customGroups?: DistrictGroup[],
  ) {
    if (customGroups) {
      log.debug("Configuring DistrictGroupEngine with custom district groups", {
        customGroups,
      });
    }
    this.districtGroups = [...DEFAULT_GROUPS, ...(customGroups ?? [])];
    this.candidateListData = candidateListData;
  }

  getDistrictTargetByGroupIds(ids: string[]) {
    return ids.map((id) => this.getDistrictsByGroupId(id));
  }

  private getDistrictsByGroupId(id: string): DistrictGroup {
    const group = this.districtGroups.find((group) => group.id === id);
    if (!group) {
      log.error("Unknown district group, effect is skipped", { id });
      return { id, label: id, districts: [] };
    }
    if (id === "osszes_oevk") {
      return {
        ...group,
        districts: this.candidateListData.map((data) => ({
          megyekod: data.megyekod,
          oevk: data.oevk,
        })),
      };
    }
    return group;
  }
}
