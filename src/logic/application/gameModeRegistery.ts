import { config2022 } from "../../assets/jsons/2022/config";
import type { CampaignConfig } from "../types/campaignEngine.types";

// TODO: this registery should be written by user action
export const gameModeRegistry: Record<string, CampaignConfig> = {
  "2022_ogyv_default": config2022,
};
