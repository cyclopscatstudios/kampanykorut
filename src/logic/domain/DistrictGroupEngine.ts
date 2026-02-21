import type { District } from "./ResultTransformer/VoteShareTransformer.types";
import { defaultGroups as DEFAULT_GROUPS } from "./DefaultGroups";

interface DistrictGroup {
  id: string;
  label: string;
  districts: District[];
}

// EXAMPLE
/* const group01: DistrictGroup = {
  id: "nyu_dis",
  label: "Nyugati megyék",
  districts: [
    { megyekod: 20, oevk: 1 },
    { megyekod: 20, oevk: 2 },
    { megyekod: 20, oevk: 3 },
    { megyekod: 18, oevk: 1 },
    { megyekod: 18, oevk: 2 },
    { megyekod: 18, oevk: 3 },
    { megyekod: 8, oevk: 1 },
    { megyekod: 8, oevk: 2 },
    { megyekod: 8, oevk: 3 },
    { megyekod: 8, oevk: 4 },
    { megyekod: 8, oevk: 5 },
  ],
}; */

// test

export class DistrictGroupEngine {
  private defaultGroups: DistrictGroup[] = DEFAULT_GROUPS;

  constructor() {}

  getDistrictTargetByGroupIds(ids: string[]) {
    return ids.map((id) => this.defaultGroups.map((group) => group.id === id));
  }
}
