import { config2022 } from "../../assets/jsons/2022/config";
import type { GameModeConfig } from "../types/campaignEngine.types";

export const gameModeRegistry: Record<string, GameModeConfig> = {
  "2022_ogyv_default": config2022,
};
