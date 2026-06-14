import { Badge } from "../../Badge";
import { CommonWrapper } from "../../CommonWrapper";
import { Text } from "../../Text";
import { type Candidate, getPartyById } from "./electionMap.utils";
import { CampaignConfig, District, RawParty } from "@/shared/types";

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
    <CommonWrapper fullHeight={false}>
      <div className="w-[400px] h-[444px] shrink-0 p-2">
        <div className="text-center">
          <Text>
            {district?.megye} {district?.oevk}
          </Text>
          <Text size="xs">{district?.telepules}</Text>
        </div>
        <div className="">
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {candidates.map((candidate) => {
              const party = getPartyById(candidate.party, config);
              return <CandidateResult candidate={candidate} party={party} />;
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
    <div key={candidate.name} className="flex justify-between m-1.5">
      <div>
        <div className="flex justify-center items-center">
          <div
            className="size-[15px] rounded-full mr-1.5"
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
            <Badge label="Winner" color="green" icon="check-circle-fill" />
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
