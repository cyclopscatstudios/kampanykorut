import { VoterEnvironmentConfig } from "@/shared/types";

export const voternvironmentConfig: VoterEnvironmentConfig = {
  eligibleVoters: 200,
  listData: [
    {
      megye: "Teszt",
      megyekod: 1,
      oevk: 1,
      partok: { "party-a": 10, "party-b": 15 },
      telepules: "Teszt",
      jeloltek: {
        "party-a": ["candidate A"],
        "party-b": ["candidate B"],
      },
      valasztopolgar: 300,
    },
  ],
  maxTurnout: 85,
};
