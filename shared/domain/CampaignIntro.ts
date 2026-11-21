import { CampaignState, ElectionConfig } from "../types";

export function isIntroPending(
  state: Pick<CampaignState, "introSeen" | "turn" | "isEnded">,
  electionConfig: Pick<ElectionConfig, "intro">,
): boolean {
  return (
    Boolean(electionConfig.intro?.text.trim()) &&
    !state.introSeen &&
    state.turn === 0 &&
    !state.isEnded
  );
}

export function markIntroSeen(state: CampaignState): CampaignState {
  return state.introSeen ? state : { ...state, introSeen: true };
}
