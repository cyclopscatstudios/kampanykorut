import { ElectionConfigEngine } from "@/logic/application";
import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";

export async function sideSelectorLoader({ params }: LoaderFunctionArgs) {
  const campaignId = params.campaignId;
  const electionConfigEngine = container.resolve(ElectionConfigEngine);
  const config = await electionConfigEngine.getElectionConfigById(campaignId);
  return { config, id: campaignId };
}
