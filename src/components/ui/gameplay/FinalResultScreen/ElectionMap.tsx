import { MapWrapper } from "../MapWrapper";
import { container } from "tsyringe";
import { StateEngine } from "@/logic/application";
import type { CampaignConfig } from "@/logic/types";

export function ElectionMap({ config }: { config: CampaignConfig }) {
  const stateEngine = container.resolve(StateEngine);
  const state = stateEngine.getCampaignState();
  return (
    <div className="w-[850px] h-[500px] p-4">
      <MapWrapper
        districts={config.districts}
        fullView
        results={state?.candidateListData ?? []}
        isGameEnded
      />
    </div>
  );
}
