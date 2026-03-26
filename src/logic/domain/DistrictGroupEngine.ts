import type { District } from "./ResultTransformer/VoteShareTransformer.types";
import { defaultGroups as DEFAULT_GROUPS } from "./DefaultGroups";
import { createLogger } from "../logger";

export interface DistrictGroup {
  id: string;
  label: string;
  districts: District[];
}

const log = createLogger("DistrictGroupEngine");

export class DistrictGroupEngine {
  private districtGroups: DistrictGroup[];

  constructor(customGroups?: DistrictGroup[]) {
    const groups = [...DEFAULT_GROUPS];
    if (customGroups) {
      log.info("custom groups added to default dsitrict groups");
      this.districtGroups = [...groups, ...customGroups];
    }
    this.districtGroups = groups;
  }

  getDistrictTargetByGroupIds(ids: string[]) {
    return ids.map((id) => this.getDistrictsByGroupId(id));
  }

  private getDistrictsByGroupId(id: string): DistrictGroup {
    return (
      this.districtGroups.find((group) => group.id === id) ??
      this.districtGroups[0]
    );
  }
}
