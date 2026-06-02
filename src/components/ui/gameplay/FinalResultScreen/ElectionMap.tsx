import { MapWrapper } from "../MapWrapper";
import { container } from "tsyringe";
import { StateEngine } from "@/logic/application";
import { useState } from "react";
import { DistrictResult } from "./DistrictResult";
import { calculateVotePercentages, getCandidates } from "./electionMap.utils";
import { CampaignConfig, District } from "@/shared/types";

export function ElectionMap({ config }: { config: CampaignConfig }) {
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
      />
      <DistrictResult
        candidates={candidates}
        config={config}
        district={district}
      />
    </div>
  );
}
