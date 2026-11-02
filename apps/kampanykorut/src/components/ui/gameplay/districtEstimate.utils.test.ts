import {
  getDistrictEstimate,
  getNationalEstimate,
} from "./districtEstimate.utils";

const parties = [
  { id: "fidesz", name: "Fidesz–KDNP", color: "#f28c28" },
  { id: "tisza", name: "Tisza", color: "#8ee6f5" },
  { id: "mihazank", name: "Mi Hazánk", color: "#7a9a2a" },
];

describe("getDistrictEstimate", () => {
  it("orders parties by share and rounds to whole percents with a band", () => {
    const estimate = getDistrictEstimate(
      { partok: { tisza: 330, fidesz: 540, mihazank: 130 } },
      parties,
      3,
    );

    expect(estimate.rows.map((row) => row.partyId)).toEqual([
      "fidesz",
      "tisza",
      "mihazank",
    ]);
    expect(estimate.rows[0]).toMatchObject({ percent: 54, low: 51, high: 57 });
  });

  it("marks a wide lead as safe and names the leader", () => {
    const estimate = getDistrictEstimate(
      { partok: { fidesz: 54, tisza: 33, mihazank: 13 } },
      parties,
      3,
    );

    expect(estimate.status).toBe("safe");
    expect(estimate.leader?.partyId).toBe("fidesz");
  });

  it("treats overlapping bands as a toss-up without a leader", () => {
    const estimate = getDistrictEstimate(
      { partok: { fidesz: 43, tisza: 41, mihazank: 16 } },
      parties,
      5,
    );

    expect(estimate.status).toBe("tossup");
    expect(estimate.leader).toBeUndefined();
  });

  it("uses the first listed candidate's name", () => {
    const estimate = getDistrictEstimate(
      {
        partok: { fidesz: 60, tisza: 40 },
        jeloltek: { fidesz: ["Kovács István"] },
      },
      parties,
      3,
    );

    expect(estimate.rows[0]?.candidateName).toBe("Kovács István");
    expect(estimate.rows[1]?.candidateName).toBeUndefined();
  });

  it("skips parties without votes", () => {
    const estimate = getDistrictEstimate(
      { partok: { fidesz: 60, tisza: 40, mihazank: 0 } },
      parties,
      3,
    );

    expect(estimate.rows).toHaveLength(2);
  });
});

describe("getNationalEstimate", () => {
  it("converts fractions to percents and ignores the total", () => {
    const estimate = getNationalEstimate(
      { fidesz: 0.44, tisza: 0.38, _total: 1 },
      parties,
    );

    expect(estimate?.rows.map((row) => row.percent)).toEqual([44, 38]);
    expect(estimate?.status).toBe("likely");
  });

  it("returns null without data", () => {
    expect(getNationalEstimate(undefined, parties)).toBeNull();
    expect(getNationalEstimate({ _total: 0 }, parties)).toBeNull();
  });
});
