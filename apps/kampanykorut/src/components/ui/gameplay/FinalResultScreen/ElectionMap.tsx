import { useCallback, useState } from "react";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import { StateEngine } from "@/logic/application";
import { CampaignConfig, District, MayoralResult } from "@/shared/types";
import { BottomSheet } from "../../BottomSheet";
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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const closeDistrict = useCallback(() => setDistrict(null), []);
  const votes = calculateVotePercentages(district?.partok);
  const candidates = getCandidates(district?.jeloltek, votes);
  const districtDetails = mayoralResult ? (
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
  );

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
        districtDetails
      ) : (
        <BottomSheet
          open={district !== null}
          onClose={closeDistrict}
          title={district ? `${district.megye} ${district.oevk}` : ""}
          fitContent
        >
          {district && districtDetails}
        </BottomSheet>
      )}
    </div>
  );
}
