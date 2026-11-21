import {
  CampaignState,
  CandidateListData,
  DistrictTarget,
  ElectionConfig,
  Issue,
  IssueArea,
  IssuePositions,
  IssueStanceParams,
} from "../types";

export const MIN_ISSUE_POSITION = -2;
export const MAX_ISSUE_POSITION = 2;
// Share of a party's votes in an area that one step of distance moves there,
// per point of strength.
export const ISSUE_SWING_PER_STEP = 0.02;

const NO_AREA: IssueArea = { strength: 0, opinion: 0 };

export function getIssues(
  config: Pick<ElectionConfig, "issues"> | undefined,
): Issue[] {
  return config?.issues ?? [];
}

function getRegionIds(
  config: Pick<ElectionConfig, "election">,
  megyekod: number,
): string[] {
  const election = config.election;
  if (election?.type !== "proportional") {
    return [];
  }
  return election.regions
    .filter((region) => region.megyekods.includes(megyekod))
    .map((region) => region.id);
}

export function getIssueArea(
  issue: Issue,
  config: Pick<ElectionConfig, "election">,
  megyekod: number,
): IssueArea {
  const key = [...getRegionIds(config, megyekod), String(megyekod)].find(
    (id) => issue.areas?.[id],
  );
  return (key && issue.areas?.[key]) || issue.default || NO_AREA;
}

export function getIssuePosition(
  issue: Issue,
  positions: IssuePositions | undefined,
  party: string,
): number | undefined {
  return positions?.[issue.id]?.[party] ?? issue.positions[party];
}

function clampPosition(value: number) {
  return Math.min(MAX_ISSUE_POSITION, Math.max(MIN_ISSUE_POSITION, value));
}

function nextPosition(current: number, params: IssueStanceParams) {
  return clampPosition(
    params.position !== undefined
      ? params.position
      : current + (params.shift ?? 0),
  );
}

// Voters who leave go to the parties closest to them; voters who come are
// taken mostly from the parties furthest from them. Both in proportion to
// the parties' votes in the area.
function getTransferWeights(
  row: CandidateListData,
  mover: string,
  opinion: number,
  positionOf: (party: string) => number | undefined,
  inactive: Set<string>,
  gaining: boolean,
): Record<string, number> {
  const span = MAX_ISSUE_POSITION - MIN_ISSUE_POSITION;
  const weights: Record<string, number> = {};
  for (const [party, votes] of Object.entries(row.partok)) {
    if (party === mover || inactive.has(party) || !votes || votes <= 0) {
      continue;
    }
    const distance = Math.abs(opinion - (positionOf(party) ?? 0));
    weights[party] = votes * (gaining ? 1 + distance : 1 + span - distance);
  }
  return weights;
}

function getAreaTargets(
  row: CandidateListData,
  area: IssueArea,
  mover: string,
  from: number,
  to: number,
  positionOf: (party: string) => number | undefined,
  inactive: Set<string>,
): DistrictTarget[] {
  const closer = Math.abs(area.opinion - from) - Math.abs(area.opinion - to);
  const own = row.partok[mover] ?? 0;
  const amount = Math.round(
    Math.abs(closer) * area.strength * ISSUE_SWING_PER_STEP * own,
  );
  if (amount <= 0) {
    return [];
  }
  const gaining = closer > 0;
  const weights = getTransferWeights(
    row,
    mover,
    area.opinion,
    positionOf,
    inactive,
    gaining,
  );
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (total <= 0) {
    return [];
  }
  return Object.entries(weights).flatMap(([party, weight]) => {
    const share = Math.round((amount * weight) / total);
    if (share <= 0) {
      return [];
    }
    return [
      gaining
        ? {
            megyekod: row.megyekod,
            oevk: row.oevk,
            targetParty: mover,
            amount: share,
            from: { type: "party" as const, party },
          }
        : {
            megyekod: row.megyekod,
            oevk: row.oevk,
            targetParty: party,
            amount: share,
            from: { type: "party" as const, party: mover },
          },
    ];
  });
}

export interface IssueStanceResult {
  issuePositions: IssuePositions;
  targets: DistrictTarget[];
}

// Moves a party on an issue and returns the vote transfers it causes in
// every district, plus the positions to keep in the state.
export function resolveIssueStance(
  state: Pick<
    CampaignState,
    "candidateListData" | "issuePositions" | "playerSide"
  >,
  config: Pick<ElectionConfig, "issues" | "election">,
  params: IssueStanceParams,
  inactiveCandidateIds: string[] = [],
): IssueStanceResult {
  const unchanged = {
    issuePositions: state.issuePositions ?? {},
    targets: [],
  };
  const issue = getIssues(config).find((i) => i.id === params.issueId);
  const mover = params.party ?? state.playerSide?.partyId;
  if (!issue || !mover || inactiveCandidateIds.includes(mover)) {
    return unchanged;
  }
  const from = getIssuePosition(issue, state.issuePositions, mover) ?? 0;
  const to = nextPosition(from, params);
  if (to === from) {
    return unchanged;
  }
  const issuePositions = {
    ...state.issuePositions,
    [issue.id]: { ...state.issuePositions?.[issue.id], [mover]: to },
  };
  const inactive = new Set(inactiveCandidateIds);
  const positionOf = (party: string) =>
    getIssuePosition(issue, issuePositions, party);
  const targets = (state.candidateListData ?? []).flatMap((row) =>
    getAreaTargets(
      row,
      getIssueArea(issue, config, row.megyekod),
      mover,
      from,
      to,
      positionOf,
      inactive,
    ),
  );
  return { issuePositions, targets };
}

export interface AreaIssueView {
  id: string;
  name: string;
  icon?: Issue["icon"];
  description?: string;
  strength: number;
  opinion: number;
}

export function getAreaIssues(
  config: Pick<ElectionConfig, "issues" | "election">,
  megyekod: number,
): AreaIssueView[] {
  return getIssues(config)
    .map((issue) => ({
      id: issue.id,
      name: issue.name,
      icon: issue.icon,
      description: issue.description,
      ...getIssueArea(issue, config, megyekod),
    }))
    .filter((issue) => issue.strength > 0)
    .sort((a, b) => b.strength - a.strength);
}
