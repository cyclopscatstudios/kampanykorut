import { CampaignState, CandidateListData, PartyResults } from "@shared/types";
import { useState } from "react";
import {
  buildSnapshot,
  diffSnapshots,
  PollSnapshot,
  VisitChange,
} from "../visitChange.utils";

type Projection =
  | {
      candidateListData?: CandidateListData[];
      percentages?: PartyResults;
    }
  | undefined;

export function useVisitChange(
  initialState: CampaignState,
  getProjection: (state: CampaignState) => Projection,
  isCityMap: boolean,
) {
  const takeSnapshot = (state: CampaignState): PollSnapshot | null => {
    const projection = getProjection(state);
    if (!projection?.candidateListData) return null;
    const national = isCityMap
      ? projection.percentages?.candidateListResults
      : projection.percentages?.partyListResults;
    return buildSnapshot(projection.candidateListData, national);
  };

  // shortcut: the baseline lives in memory only, so after a reload the first visit shows no change; persist it in the session if players ask.
  const [baseline, setBaseline] = useState<PollSnapshot | null>(() =>
    takeSnapshot(initialState),
  );
  const [change, setChange] = useState<VisitChange | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const onTurnCommitted = (result: CampaignState) => {
    if (result.isEnded || result.turn % 2 !== 0) return;
    const after = takeSnapshot(result);
    if (!after) return;
    if (baseline) {
      setChange(diffSnapshots(baseline, after));
      setIsSummaryOpen(true);
    }
    setBaseline(after);
  };

  return {
    change,
    isSummaryOpen,
    closeSummary: () => setIsSummaryOpen(false),
    onTurnCommitted,
  };
}
