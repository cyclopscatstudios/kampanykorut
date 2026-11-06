import { t } from "i18next";
import { CampaignConfig, District, RawParty } from "@/shared/types";
import { Text } from "../../../../../../../shared/ui/Text";
import { Badge } from "../../Badge";
import { CommonWrapper } from "../../CommonWrapper";
import { type Candidate, getPartyById } from "./electionMap.utils";

interface DistrictResultProps {
  district: District | null;
  candidates: Candidate[];
  config: CampaignConfig;
}

export function DistrictResult({
  district,
  candidates,
  config,
}: DistrictResultProps) {
  return (
    <CommonWrapper fullHeight={false} className="w-full md:w-auto min-w-0">
      <div className="w-full md:w-[400px] md:h-[444px] shrink-0 p-2">
        <div className="text-center">
          <Text>
            {district?.megye} {district?.oevk}
          </Text>
          <Text size="xs">{district?.telepules}</Text>
        </div>
        <div className="">
          <div className="md:max-h-[400px] md:overflow-y-auto md:pr-2">
            {candidates.map((candidate) => {
              const party = getPartyById(candidate.party, config);
              return (
                <CandidateResult
                  key={candidate.name}
                  candidate={candidate}
                  party={party}
                />
              );
            })}
          </div>
        </div>
      </div>
    </CommonWrapper>
  );
}

function CandidateResult({
  candidate,
  party,
}: {
  candidate: Candidate;
  party?: RawParty;
}) {
  return (
    <div key={candidate.name} className="flex justify-between gap-2 m-1.5">
      <div>
        <div className="flex justify-center items-center">
          <div
            className="size-[15px] shrink-0 rounded-full mr-1.5"
            style={{ backgroundColor: party?.color ?? "#8b8b8b" }}
          />
          <div>
            <Text weight="bold" size="xs">
              {candidate.name}
            </Text>
            <Text size="xs">{party?.name ?? "Független"}</Text>
          </div>
        </div>
        <div className="ml-[15px]">
          {candidate.isWinner && (
            <Badge
              label={t("endResult.electionMap.winner")}
              color="green"
              icon="check-circle-fill"
            />
          )}
        </div>
      </div>
      <div>
        <Text weight="bold" size="xs">
          {candidate.percentage} %
        </Text>
        <Text size="xs">({candidate.votes})</Text>
      </div>
    </div>
  );
}
