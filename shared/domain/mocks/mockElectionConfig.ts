import { ElectionConfig } from "@/shared/types";

export const mockElectionConfig: ElectionConfig = {
  title: "Mock Election",
  listSeats: 100,
  allSeats: 200,
  thresholdPercent: 5,
  districtBoost: true,

  baseResults: {
    party_a: 3,
    party_b: -2,
  },

  parties: [
    {
      id: "party_a",
      name: "Party A",
      color: "#4285F4",
    },
    {
      id: "party_b",
      name: "Party B",
      color: "#EA4335",
    },
    {
      id: "party_c",
      name: "Party C",
      color: "#34A853",
    },
  ],

  playableSides: [
    {
      id: "party_a",
      name: "Party A",
      description: "Mock description for Party A.",

      mainCandidates: [
        {
          id: "candidate_a",
          label: "Candidate A",
          description: "Mock description for Candidate A.",
        },
        {
          id: "candidate_b",
          label: "Candidate B",
        },
      ],

      playableCandidates: ["candidate_a"],
    },
    {
      id: "party_b",
      name: "Party B",

      mainCandidates: [
        {
          id: "candidate_c",
          label: "Candidate C",
        },
      ],

      playableCandidates: ["candidate_c"],
    },
  ],

  electionAssets: {
    party_a: {
      portrait: {
        candidate_a: "/images/mock/candidate-a.png",
      },

      slogan: {
        candidate_a: "/images/mock/slogan-a.png",
      },

      party_logo: "/images/mock/party-a-logo.png",
    },

    party_b: {
      portrait: {
        candidate_c: "/images/mock/candidate-c.png",
      },

      slogan: {
        candidate_c: "/images/mock/slogan-c.png",
      },

      party_logo: "/images/mock/party-b-logo.png",
    },
  },
};
