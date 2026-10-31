import { container } from "tsyringe";
import { CandidateListData } from "../types";
import { MayoralResultCalculator } from "./MayoralResultCalculator";

function district(
  oevk: number,
  valasztopolgar: number,
  partok: CandidateListData["partok"],
): CandidateListData {
  return {
    megyekod: 1,
    megye: "Budapest",
    oevk,
    telepules: `${oevk}. kerület`,
    valasztopolgar,
    partok,
  };
}

describe("MayoralResultCalculator", () => {
  const calculator = container.resolve(MayoralResultCalculator);

  it("sums district votes into one city-wide plurality result", () => {
    const result = calculator.calculate([
      district(1, 1000, { karacsony: 300, vitezy: 250, grundtner: 50 }),
      district(2, 2000, { karacsony: 500, vitezy: 700, grundtner: 100 }),
    ]);

    expect(result.votes).toEqual({
      karacsony: 800,
      vitezy: 950,
      grundtner: 150,
    });
    expect(result.validVotes).toBe(1900);
    expect(result.eligibleVoters).toBe(3000);
    expect(result.outcome).toEqual({ kind: "winner", candidateId: "vitezy" });
    expect(result.standings.map((s) => s.candidateId)).toEqual([
      "vitezy",
      "karacsony",
      "grundtner",
    ]);
    expect(result.margin?.votes).toBe(150);
    expect(result.margin?.percentagePoints).toBeCloseTo((150 / 1900) * 100);
  });

  it("weights districts by their votes, not by the average of their percentages", () => {
    // Karácsony wins the small district 90-10 and loses the large one 40-60:
    // averaging the two percentages would put him ahead, the real totals don't.
    const result = calculator.calculate([
      district(1, 200, { karacsony: 90, vitezy: 10 }),
      district(2, 2000, { karacsony: 400, vitezy: 600 }),
    ]);

    expect(result.outcome).toEqual({ kind: "winner", candidateId: "vitezy" });
    expect(result.percentages.vitezy).toBeCloseTo(610 / 1100);
  });

  it("does not hand out districts as seats", () => {
    const result = calculator.calculate([
      district(1, 1000, { karacsony: 300, vitezy: 200 }),
      district(2, 1000, { karacsony: 300, vitezy: 200 }),
      district(3, 5000, { karacsony: 100, vitezy: 900 }),
    ]);

    expect(
      result.districts.map((d) =>
        d.outcome.kind === "winner" ? d.outcome.candidateId : d.outcome.kind,
      ),
    ).toEqual(["karacsony", "karacsony", "vitezy"]);
    expect(result.outcome).toEqual({ kind: "winner", candidateId: "vitezy" });
  });

  it("reports an exact tie instead of picking a winner", () => {
    const result = calculator.calculate([
      district(1, 1000, { karacsony: 300, vitezy: 200, grundtner: 10 }),
      district(2, 1000, { karacsony: 200, vitezy: 300 }),
    ]);

    expect(result.outcome).toEqual({
      kind: "tie",
      candidateIds: ["karacsony", "vitezy"],
    });
    expect(result.margin).toEqual({ votes: 0, percentagePoints: 0 });
  });

  it("never lets an inactive candidate win and leaves their votes out of the valid total", () => {
    const result = calculator.calculate(
      [district(1, 5000, { szentkiralyi: 2000, karacsony: 900, vitezy: 800 })],
      { inactiveCandidateIds: ["szentkiralyi"] },
    );

    expect(result.outcome).toEqual({
      kind: "winner",
      candidateId: "karacsony",
    });
    expect(result.validVotes).toBe(1700);
    expect(result.votes).not.toHaveProperty("szentkiralyi");
    expect(result.withdrawn).toEqual([
      { candidateId: "szentkiralyi", votes: 2000 },
    ]);
    expect(result.districts[0].outcome).toEqual({
      kind: "winner",
      candidateId: "karacsony",
    });
  });

  it("counts aggregate keys as valid votes but never as a candidate", () => {
    const result = calculator.calculate([
      district(1, 1000, { _other: 500, karacsony: 300, vitezy: 200 }),
    ]);

    expect(result.validVotes).toBe(1000);
    expect(result.percentages._other).toBeCloseTo(0.5);
    expect(result.standings.map((s) => s.candidateId)).toEqual([
      "karacsony",
      "vitezy",
    ]);
    expect(result.outcome).toEqual({
      kind: "winner",
      candidateId: "karacsony",
    });
  });

  it("skips missing, zero and non-numeric vote entries", () => {
    const result = calculator.calculate([
      district(1, 1000, {
        karacsony: 300,
        vitezy: undefined,
        grundtner: 0,
        broken: Number.NaN,
      }),
    ]);

    expect(result.votes).toEqual({ karacsony: 300 });
    expect(result.margin).toBeUndefined();
  });

  it("has no winner when there are no valid votes", () => {
    expect(calculator.calculate([]).outcome).toEqual({ kind: "no_winner" });
    expect(
      calculator.calculate([district(1, 1000, { karacsony: 0 })]).outcome,
    ).toEqual({ kind: "no_winner" });
    expect(
      calculator.calculate([district(1, 1000, { karacsony: 10 })], {
        inactiveCandidateIds: ["karacsony"],
      }).outcome,
    ).toEqual({ kind: "no_winner" });
  });

  it("is deterministic regardless of the order of the vote keys", () => {
    const a = calculator.calculate([
      district(1, 1000, { vitezy: 300, karacsony: 300, grundtner: 1 }),
    ]);
    const b = calculator.calculate([
      district(1, 1000, { grundtner: 1, karacsony: 300, vitezy: 300 }),
    ]);

    expect(a.standings).toEqual(b.standings);
    expect(a.outcome).toEqual(b.outcome);
  });
});
