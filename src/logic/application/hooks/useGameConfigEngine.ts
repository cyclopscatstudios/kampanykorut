import { container } from "tsyringe";
import { GameConfigEngine } from "../GameConfigEngine";
import { useEffect, useState } from "react";
import type { ElectionConfig } from "../../types/campaignEngine.types";
import type { CampaignState } from "../GameStateEngine";

export function useGameConfigEngine() {
  const engine = container.resolve(GameConfigEngine);
  const [gameConfig, setGameConfig] = useState(() =>
    engine.getCurrentElectionConfig(),
  );

  useEffect(() => {
    return engine.subscribe(setGameConfig);
  }, [engine]);

  return {
    gameConfig,
    campaignState: engine.getCurrentCampaignSession(),
    updateGameConfig: (config: Partial<ElectionConfig>) =>
      engine.updateGameConfig(config),
    updateCampaignState: (state: Partial<CampaignState> | null) =>
      engine.updateCampaignState(state),
  };
}
