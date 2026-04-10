import { defaultGroups as DEFAULT_GROUPS } from "./DefaultGroups";
import { createLogger } from "../logger";
import type { DistrictGroup } from "../types/campaignEngine.types";

const log = createLogger("DistrictGroupEngine");

export class DistrictGroupEngine {
  private districtGroups: DistrictGroup[] = [];

  constructor() {
    log.debug("DistrictGroupEngine initialized");
  }

  configure(customGroups?: DistrictGroup[]) {
    const groups = [...DEFAULT_GROUPS];
    if (customGroups) {
      log.debug("Configuring DistrictGroupEngine with custom district groups", {
        customGroups,
      });
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
