import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";

export function finalResultLoader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  const stateEngine = container.resolve(StateEngine);
  const configEngine = container.resolve(ConfigEngine);

  const state = stateEngine.getCampaignState();
  if (!state) {
    return null;
  }

  const config = configEngine.getCampaignConfig(id);

  return { results: state.results, config };
}
