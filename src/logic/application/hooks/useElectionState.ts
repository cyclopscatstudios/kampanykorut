import { useMemo, useState } from "react";
import type {
  CandidateListData,
  PartyListData,
} from "../../domain/ResultTransformer/PipelineTransform.types";
import type { Decision, GameState } from "../../domain/CampaignEngine";
import type { ElectionConfig } from "../../domain/MandateCalculator.types";
import type { VoterEnvironmentConfig } from "../../VoterEnvironment";
import { createCampaignEngine } from "../createCampaignEngine";

export interface GameModeConfig {
  electionConfig: ElectionConfig;
  voterEnvironmentConfig: VoterEnvironmentConfig;
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
}

export function useElectionState(config: GameModeConfig) {
  const engine = useMemo(() => createCampaignEngine(config), [config]);

  const [state, setState] = useState<GameState | null>(() =>
    createInitialState(config),
  );

  const processDecision = (decision: Decision) => {
    if (!state) {
      return null;
    }
    const result = engine.processTurn(state, decision);
    setState(result.modified);
    return result;
  };

  return { state, processDecision };
}

function createInitialState(config: GameModeConfig): GameState {
  return {
    candidateListData: config.candidateListData,
    partyListData: config.partyListData,
  };
}
