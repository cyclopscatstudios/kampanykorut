import { StateEngine, ConfigEngine } from "@/logic/application";
import type { LoaderFunctionArgs } from "react-router";
import { container } from "tsyringe";

export function finalResultLoader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  console.log({ id });
  const stateEngine = container.resolve(StateEngine);
  const configEngine = container.resolve(ConfigEngine);

  const state = stateEngine.getCampaignState();
  if (!state) {
    return null;
  }

  const config = configEngine.getCampaignConfig(id);

  return { results: state.results, config };
}
