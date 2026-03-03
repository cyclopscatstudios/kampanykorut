import type { District } from "./ResultTransformer/VoteShareTransformer.types";
import { defaultGroups as DEFAULT_GROUPS } from "./DefaultGroups";

interface DistrictGroup {
  id: string;
  label: string;
  districts: District[];
}

export class DistrictGroupEngine {
  private defaultGroups: DistrictGroup[] = DEFAULT_GROUPS;

  constructor() {}

  getDistrictTargetByGroupIds(ids: string[]) {
    return ids.map((id) => this.getDistrictsByGroupId(id));
  }

  private getDistrictsByGroupId(id: string): DistrictGroup {
    return (
      this.defaultGroups.find((group) => group.id === id) ??
      this.defaultGroups[0]
    );
  }
}
