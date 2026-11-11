import { CampaignState, ElectionConfig, Issue } from "../types";
import { getAreaIssues, resolveIssueStance } from "./Issues";

const issue: Issue = {
  id: "rev",
  name: "Forradalom",
  default: { strength: 1, opinion: 0 },
  areas: {
    city: { strength: 3, opinion: 2 },
    "2": { strength: 2, opinion: -2 },
  },
  positions: { me: 1, left: 2, right: -2 },
};

const config = {
  issues: [issue],
  election: {
    type: "proportional",
    regions: [{ id: "city", name: "Város", seats: 5, megyekods: [1] }],
  },
} as unknown as Pick<ElectionConfig, "issues" | "election">;

const row = (megyekod: number) => ({
  megyekod,
  megye: String(megyekod),
  oevk: 1,
  telepules: String(megyekod),
  valasztopolgar: 10000,
  partok: { me: 10000, left: 5000, right: 5000 },
});

const state = {
  playerSide: { partyId: "me" },
  candidateListData: [row(1), row(2), row(3)],
} as Pick<CampaignState, "candidateListData" | "playerSide">;

const moved = (
  targets: ReturnType<typeof resolveIssueStance>["targets"],
  mover = "me",
) =>
  targets.reduce<Record<number, number>>((sum, t) => {
    const sign = t.targetParty === mover ? 1 : -1;
    sum[t.megyekod] = (sum[t.megyekod] ?? 0) + sign * t.amount;
    return sum;
  }, {});

describe("Issues", () => {
  it("costs votes where the issue is popular and wins them where it is not", () => {
    const result = resolveIssueStance(state, config, {
      issueId: "rev",
      shift: -1,
    });
    expect(result.issuePositions).toEqual({ rev: { me: 0 } });
    const net = moved(result.targets);
    expect(net[1]).toBe(-600);
    expect(net[2]).toBe(400);
    expect(net[3]).toBe(200);
  });

  it("sends leaving voters mostly to the party closest to them", () => {
    const { targets } = resolveIssueStance(state, config, {
      issueId: "rev",
      shift: -1,
    });
    const city = targets.filter((t) => t.megyekod === 1);
    const left = city.find((t) => t.targetParty === "left")?.amount ?? 0;
    const right = city.find((t) => t.targetParty === "right")?.amount ?? 0;
    expect(left).toBeGreaterThan(right * 4);
    expect(city.every((t) => t.from?.type === "party")).toBe(true);
  });

  it("moves another party and keeps positions within -2..2", () => {
    const result = resolveIssueStance(state, config, {
      issueId: "rev",
      party: "right",
      position: 5,
    });
    expect(result.issuePositions).toEqual({ rev: { right: 2 } });
    expect(moved(result.targets, "right")[1]).toBeGreaterThan(0);
  });

  it("ignores unknown issues, unchanged positions and inactive parties", () => {
    expect(
      resolveIssueStance(state, config, { issueId: "x", shift: 1 }).targets,
    ).toEqual([]);
    expect(
      resolveIssueStance(state, config, { issueId: "rev", position: 1 })
        .targets,
    ).toEqual([]);
    expect(
      resolveIssueStance(state, config, { issueId: "rev", shift: 1 }, ["me"])
        .targets,
    ).toEqual([]);
  });

  it("lists the issues of an area by strength", () => {
    expect(getAreaIssues(config, 1).map((i) => [i.id, i.strength])).toEqual([
      ["rev", 3],
    ]);
    expect(getAreaIssues(config, 2)[0].opinion).toBe(-2);
  });
});
