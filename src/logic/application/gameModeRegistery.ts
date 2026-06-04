
import { config2022 } from "../../../public/campaigns/2022/config";
import { fetchJSON } from "./fetchJSON";
import { DATA_PATHS, getDataPath } from "./PathResolver";
import { CampaignConfig } from "@/shared/types";

// TODO: this registery should be written by user action
export const gameModeRegistry: Record<string, CampaignConfig> = {
  "2022_ogyv_default": config2022,
};

export async function gameConfigRegistery(path: keyof typeof DATA_PATHS) {
  const resolvedPath = getDataPath(path);
  return await fetchJSON(resolvedPath as any);
}
