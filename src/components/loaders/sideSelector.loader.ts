import { ConfigEngine } from "@/logic/application";
import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";

export async function sideSelectorLoader({ params }: LoaderFunctionArgs) {
  const campaignId = params.campaignId;
  const electionConfigEngine = container.resolve(ConfigEngine);
  const config = await electionConfigEngine.getElectionConfigById(campaignId);
  return { config, id: campaignId };
}
