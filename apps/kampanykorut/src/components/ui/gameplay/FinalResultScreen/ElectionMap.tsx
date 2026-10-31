import { useState } from "react";
import { container } from "tsyringe";
import { StateEngine } from "@/logic/application";
import { CampaignConfig, District, MayoralResult } from "@/shared/types";
import { MapWrapper } from "../MapWrapper";
import { DistrictResult } from "./DistrictResult";
import { calculateVotePercentages, getCandidates } from "./electionMap.utils";
import { MayoralDistrictPanel } from "./MayoralDistricts";

export function ElectionMap({
  config,
  mayoralResult,
}: {
  config: CampaignConfig;
  mayoralResult?: MayoralResult;
}) {
  const stateEngine = container.resolve(StateEngine);
  const state = stateEngine.getCampaignState();
  const [district, setDistrict] = useState<District | null>(null);
  const votes = calculateVotePercentages(district?.partok);
  const candidates = getCandidates(district?.jeloltek, votes);

  return (
    <div className="size-full flex justify-center items-center gap-4">
      <MapWrapper
        districts={config.districts}
        results={state?.candidateListData ?? []}
        isGameEnded
        handleDistrict={(e) => setDistrict(e)}
        width={750}
        height={444}
        electionConfig={config.electionConfig}
      />
      {mayoralResult ? (
        <MayoralDistrictPanel
          district={district}
          mayoralResult={mayoralResult}
          config={config}
        />
      ) : (
        <DistrictResult
          candidates={candidates}
          config={config}
          district={district}
        />
      )}
    </div>
  );
}
