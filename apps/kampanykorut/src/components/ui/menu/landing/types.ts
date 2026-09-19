import type { useGetCampaigns } from "@/logic/application";

export type Campaign = ReturnType<typeof useGetCampaigns>[number];
