import { ElectionEngine } from "./ElectionEngine";
import type { VoterEnvironmentConfig } from "./VoterEnvironment";

const listResults = [
  {
    megyekod: 1,
    megye: "BUDAPEST",
    oevk: 1,
    telepules: "",
    valasztopolgar: 600000,
    partok: {
      ellenzeki_osszefogas: 21300,
      fidesz: 18767,
      mkkp: 2842,
      megoldas_mozgalom: 472,
      mi_hazank: 1307,
      normalis_elet: 155,
    },
  },
  {
    megyekod: 1,
    megye: "BUDAPEST",
    oevk: 2,
    telepules: "",
    valasztopolgar: 600000,
    partok: {
      ellenzeki_osszefogas: 26398,
      fidesz: 21814,
      mkkp: 2963,
      megoldas_mozgalom: 484,
      mi_hazank: 1696,
      normalis_elet: 188,
    },
  },
  {
    megyekod: 1,
    megye: "BUDAPEST",
    oevk: 3,
    telepules: "",
    valasztopolgar: 600000,
    partok: {
      ellenzeki_osszefogas: 25194,
      fidesz: 21352,
      mkkp: 3717,
      megoldas_mozgalom: 449,
      mi_hazank: 1358,
      normalis_elet: 132,
    },
  },
];

describe("ElectionEngine", () => {
  const electionConfig = {
    listSeats: 10,
    thresholdPercent: 5,
  };

  const voterEnvironmentConfig: VoterEnvironmentConfig = {
    maxTurnout: 85,
    eligibleVoters: 8215304,
    listData: listResults,
  };

  const constituencyData = [
    {
      megyekod: 1,
      megye: "BP",
      oevk: 1,
      valasztopolgar: 600000,
      partok: {
        fidesz: 12000,
        opposition: 11000,
        mkkp: undefined,
      },
      telepules: "",
      jeloltek: {
        fidesz: ["Candidate A"],
        opposition: ["Candidate B"],
      },
    },
    {
      megyekod: 1,
      megye: "BP",
      oevk: 2,
      telepules: "",
      valasztopolgar: 600000,
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
      telepules: "",
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
      telepules: "",
      partok: {
        fidesz: 30000,
        opposition: 35000,
      },
    },
  ];

  const engine = new ElectionEngine(electionConfig, voterEnvironmentConfig);

  it("merges input data and calculates mandates correctly", () => {
    const result = engine.calculate(constituencyData, listData);

    expect(result).toHaveProperty("mandates");
    expect(result).toHaveProperty("constituencySeats");
    expect(result).toHaveProperty("listSeats");
    expect(result).toHaveProperty("compensation");
    expect(result?.constituencySeats).toEqual({
      fidesz: 1,
      opposition: 1,
    });

    const totalListSeats = Object.values(result?.listSeats ?? {}).reduce(
      (a: number, b: unknown) => a + (b as number),
      0,
    );
    expect(totalListSeats).toBe(electionConfig.listSeats);

    for (const row of result?.mandates ?? []) {
      expect(row.totalSeats).toBe(row.constituencySeats + row.listSeats);
    }
  });

  it("filters invalid or zero votes before processing", () => {
    const updatedConstituencyData = [
      {
        megyekod: 1,
        megye: "Test",
        oevk: 1,
        telepules: "",
        valasztopolgar: 600000,
        partok: {
          fidesz: 100,
          opposition: undefined,
          minor: 0,
        },
      },
    ];
    const updatedListData = [
      {
        megyekod: 1,
        megye: "Test",
        oevk: 1,
        valasztopolgar: 600000,
        partok: {
          fidesz: 50,
          opposition: undefined,
        },
      },
    ];
    const result = engine.calculate(updatedConstituencyData, updatedListData);

    expect(result?.constituencySeats).toEqual({
      fidesz: 1,
    });

    expect(result?.listSeats.fidesz).toBeDefined();
  });

  it("does not allocate list seats to parties below threshold", () => {
    const updatedConstituencyData = [
      {
        megyekod: 1,
        megye: "Test",
        oevk: 1,
        telepules: "",
        valasztopolgar: 600000,
        partok: {
          major: 1000,
          minor: 100,
        },
      },
    ];
    const updatedListData = [
      {
        megyekod: 1,
        megye: "Test",
        oevk: 1,
        partok: {
          major: 1000,
          minor: 10,
        },
      },
    ];
    const result = engine.calculate(updatedConstituencyData, updatedListData);

    expect(result?.listSeats.minor).toBeUndefined();
    expect(result?.listSeats.major).toBe(electionConfig.listSeats);
  });
  it("asd", () => {
    const updatedConstituencyData = [
      {
        megyekod: 1,
        megye: "Test",
        oevk: 1,
        telepules: "",
        valasztopolgar: 600000,
        partok: {
          major: 1000,
          minor: 1000,
        },
      },
    ];
    const updatedListData = [
      {
        megyekod: 1,
        megye: "Test",
        oevk: 1,
        partok: {
          major: 1000,
          minor: 1000,
        },
      },
    ];
    const result = engine.modifyByMotivation(
      updatedConstituencyData,
      updatedListData,
      {
        major: 0.995,
        minor: 0.91,
      },
    );
    expect(result).toMatchSnapshot();
  });
});
