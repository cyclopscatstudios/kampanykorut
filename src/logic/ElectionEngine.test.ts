import { ElectionEngine } from "./ElectionEngine";

describe("ElectionEngine", () => {
  const config = {
    listSeats: 10,
    thresholdPercent: 5,
  };

  it("merges input data and calculates mandates correctly", () => {
    const constituencyData = [
      {
        megyekod: 1,
        megye: "BP",
        oevk: 1,
        partok: {
          fidesz: 12000,
          opposition: 11000,
          mkkp: undefined,
        },
        jeloltek: {
          fidesz: ["Candidate A"],
          opposition: ["Candidate B"],
        },
      },
      {
        megyekod: 1,
        megye: "BP",
        oevk: 2,
        partok: {
          opposition: 9000,
          fidesz: 8000,
        },
      },
    ];

    const listData = [
      {
        megyekod: 1,
        megye: "BP",
        oevk: 1,
        partok: {
          fidesz: 50000,
          opposition: 40000,
          mkkp: 3000,
        },
      },
      {
        megyekod: 1,
        megye: "BP",
        oevk: 2,
        partok: {
          fidesz: 30000,
          opposition: 35000,
        },
      },
    ];

    const engine = new ElectionEngine(
      constituencyData,
      listData,
      config,
    );

    const result = engine.calculate();

    expect(result).toHaveProperty("mandates");
    expect(result).toHaveProperty("constituencySeats");
    expect(result).toHaveProperty("listSeats");
    expect(result).toHaveProperty("compensation");
    expect(result.constituencySeats).toEqual({
      fidesz: 1,
      opposition: 1,
    });

    const totalListSeats = Object.values(result.listSeats).reduce(
      (a: number, b: unknown) => a + (b as number),
      0,
    );
    expect(totalListSeats).toBe(config.listSeats);

    for (const row of result.mandates) {
      expect(row.totalSeats).toBe(
        row.constituencySeats + row.listSeats,
      );
    }
  });

  it("filters invalid or zero votes before processing", () => {
    const engine = new ElectionEngine(
      [
        {
          megyekod: 1,
          megye: "Test",
          oevk: 1,
          partok: {
            fidesz: 100,
            opposition: undefined,
            minor: 0,
          },
        },
      ],
      [
        {
          megyekod: 1,
          megye: "Test",
          oevk: 1,
          partok: {
            fidesz: 50,
            opposition: undefined,
          },
        },
      ],
      config,
    );

    const result = engine.calculate();

    expect(result.constituencySeats).toEqual({
      fidesz: 1,
    });

    expect(result.listSeats.fidesz).toBeDefined();
  });

  it("does not allocate list seats to parties below threshold", () => {
    const engine = new ElectionEngine(
      [
        {
          megyekod: 1,
          megye: "Test",
          oevk: 1,
          partok: {
            major: 1000,
            minor: 100,
          },
        },
      ],
      [
        {
          megyekod: 1,
          megye: "Test",
          oevk: 1,
          partok: {
            major: 1000,
            minor: 10,
          },
        },
      ],
      config,
    );

    const result = engine.calculate();

    expect(result.listSeats.minor).toBeUndefined();
    expect(result.listSeats.major).toBe(config.listSeats);
  });
});
