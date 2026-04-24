import { GameConfigEngine } from "@/logic/application";
import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";

export async function sideSelectorLoader({ params }: LoaderFunctionArgs) {
  const campaignId = params.campaignId;
  const gameConfigengine = container.resolve(GameConfigEngine);
  const config = await gameConfigengine.getElectionConfigById(campaignId);
  return { config, id: campaignId };
}
