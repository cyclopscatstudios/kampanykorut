import { Pollster } from "../types/pollsters";

export const defaultPollsters: Pollster[] = [
  {
    id: "median",
    label: "Medián",
    description:
      "A Medián egy magyarországi közvélemény-kutató intézet, amely rendszeresen készít politikai és társadalmi témájú felméréseket, és jelentős szereplő a magyar közvélemény-kutatásban.",
    errorMargin: {
      min: 1,
      max: 5,
    },
  },
  {
    id: "zavecz",
    label: "Závecz Research",
    description:
      "A Závecz Research egy magyarországi közvélemény-kutató intézet, amely politikai és társadalmi témájú felméréseket készít, és jelentős szereplő a magyar közvélemény-kutatásban.",
    errorMargin: {
      min: 1.5,
      max: 5.5,
    },
    bias: [
      {
        type: "result",
        partyBias: {
          fidesz: -5,
          ellenzeki_osszefogas: 5,
        },
      },
    ],
  },
  {
    id: "publicus",
    label: "Publicus Intézet",
    description:
      "A Publicus Intézet egy magyarországi közvélemény-kutató intézet, amely politikai és társadalmi témájú felméréseket készít, és jelentős szereplő a magyar közvélemény-kutatásban.",
    errorMargin: {
      min: 2,
      max: 6,
    },
    bias: [
      {
        type: "result",
        partyBias: {
          fidesz: -10,
          ellenzeki_osszefogas: 5,
        },
      },
    ],
  },
  {
    id: "nezopont",
    label: "Nézőpont Intézet",
    description:
      "A Nézőpont Intézet egy magyarországi közvélemény-kutató intézet, amely politikai és társadalmi témájú felméréseket készít, és jelentős szereplő a magyar közvélemény-kutatásban.",
    errorMargin: {
      min: 1.5,
      max: 5.5,
    },
    bias: [
      {
        type: "result",
        partyBias: {
          fidesz: 5,
          ellenzeki_osszefogas: -5,
        },
      },
    ],
  },
  {
    id: "alapjogokert",
    label: "Alapjogokért Központ",
    description:
      "Az Alapjogokért Központ egy magyarországi közvélemény-kutató intézet, amely politikai és társadalmi témájú felméréseket készít, és jelentős szereplő a magyar közvélemény-kutatásban.",
    errorMargin: {
      min: 2,
      max: 6,
    },
    bias: [
      {
        type: "result",
        partyBias: {
          fidesz: 10,
          ellenzeki_osszefogas: -10,
        },
      },
    ],
  },
];
