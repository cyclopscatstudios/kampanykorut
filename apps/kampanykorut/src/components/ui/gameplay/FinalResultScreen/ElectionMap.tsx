import { useCallback, useState } from "react";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import { StateEngine } from "@/logic/application";
import { CampaignConfig, District } from "@/shared/types";
import { BottomSheet } from "../../BottomSheet";
import { MapWrapper } from "../MapWrapper";
import { DistrictResult } from "./DistrictResult";
import { calculateVotePercentages, getCandidates } from "./electionMap.utils";

export function ElectionMap({ config }: { config: CampaignConfig }) {
  const stateEngine = container.resolve(StateEngine);
  const state = stateEngine.getCampaignState();
  const [district, setDistrict] = useState<District | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const closeDistrict = useCallback(() => setDistrict(null), []);
  const votes = calculateVotePercentages(district?.partok);
  const candidates = getCandidates(district?.jeloltek, votes);

  return (
    <div className="w-full md:h-full flex flex-col md:flex-row justify-center items-stretch md:items-center gap-4">
      <div className="w-full min-w-0 md:contents [&>div]:!w-full md:[&>div]:!w-[750px] [&_svg]:max-w-full [&_svg]:h-full">
        <MapWrapper
          districts={config.districts}
          results={state?.candidateListData ?? []}
          isGameEnded
          handleDistrict={(e) => setDistrict(e)}
          width={750}
          height={444}
          selectedDistrict={district}
          className="max-md:!h-[300px]"
          electionConfig={config.electionConfig}
        />
      </div>
      {isDesktop ? (
        <DistrictResult
          candidates={candidates}
          config={config}
          district={district}
        />
      ) : (
        <BottomSheet
          open={district !== null}
          onClose={closeDistrict}
          title={district ? `${district.megye} ${district.oevk}` : ""}
        >
          {district && (
            <DistrictResult
              candidates={candidates}
              config={config}
              district={district}
            />
          )}
        </BottomSheet>
      )}
    </div>
  );
}
