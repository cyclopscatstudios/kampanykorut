import { defaultGroups as DEFAULT_GROUPS } from "./DefaultGroups";
import { createLogger } from "../logger/logger";
import { injectable } from "tsyringe";
import { CandidateListData, DistrictGroup } from "@/shared/types";

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
    const groups = [...DEFAULT_GROUPS];
    if (customGroups) {
      log.debug("Configuring DistrictGroupEngine with custom district groups", {
        customGroups,
      });
      this.districtGroups = [...groups, ...customGroups];
    }
    this.districtGroups = groups;
    this.candidateListData = candidateListData;
  }

  getDistrictTargetByGroupIds(ids: string[]) {
    return ids.map((id) => this.getDistrictsByGroupId(id));
  }

  private getDistrictsByGroupId(id: string): DistrictGroup {
    if (id === "osszes_oevk") {
      const group =
        this.districtGroups.find((group) => group.id === id) ??
        this.districtGroups[0];
      return {
        ...group,
        districts: this.candidateListData.map((data) => ({
          megyekod: data.megyekod,
          oevk: data.oevk,
        })),
      };
    }
    return (
      this.districtGroups.find((group) => group.id === id) ??
      this.districtGroups[0]
    );
  }
}
