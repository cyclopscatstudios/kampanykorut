import { MapWrapper } from "../MapWrapper";
import { container } from "tsyringe";
import { StateEngine } from "@/logic/application";
import type { CampaignConfig } from "@/logic/types";
import { useState } from "react";
import type { DistrictResult } from "../../map.utils";
import { Text } from "../../Text";
import { Icon } from "../../Icon";
import type { Colors } from "../../../../types/color";
import { getBaseBackgroundColor } from "../../color.utils";
import classNames from "classnames";

export function ElectionMap({ config }: { config: CampaignConfig }) {
  const stateEngine = container.resolve(StateEngine);
  const state = stateEngine.getCampaignState();
  const [district, setDistrict] = useState<DistrictResult | null>(null);
  const votes = calculateVotePercentages(district?.partok);
  const candidates = getCandidates(district?.jeloltek, votes);

  return (
    <div className="size-full flex justify-center items-center gap-4">
      <MapWrapper
        districts={config.districts}
        fullView
        results={state?.candidateListData ?? []}
        isGameEnded
        handleDistrict={(e) => setDistrict(e)}
        width={750}
        height={444}
      />
      <div className="w-[400px] h-[444px] bg-blue-100/10 rounded-md shrink-0">
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
              return (
                <div
                  key={candidate.name}
                  className="flex justify-between m-1.5"
                >
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
                        <Badge
                          label="Winner"
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BadgeProps {
  icon: string;
  label: string;
  color: Colors;
}

function Badge({ icon, label, color }: BadgeProps) {
  const badgeBg = getBaseBackgroundColor(color);
  return (
    <div
      className={classNames("inline-flex rounded-full items-center", badgeBg)}
    >
      {icon && (
        <Icon name="check-circle-fill" color={color} className="mx-1.5" />
      )}
      <Text size="xs" className={icon ? "mr-1.5" : "mx-1.5"}>
        {label}
      </Text>
    </div>
  );
}

type VotePercentage = {
  votes?: number;
  percentage: number;
  isWinner?: boolean;
};

function calculateVotePercentages(
  votes?: Record<string, number | undefined>,
): Record<string, VotePercentage> | undefined {
  if (!votes) {
    return;
  }

  const totalVotes = Object.values(votes).reduce(
    (sum, value) => (sum ?? 0) + (value ?? 0),
    0,
  );

  const maxVotes = Math.max(...Object.values(votes).map((v) => v ?? 0));

  return Object.fromEntries(
    Object.entries(votes).map(([party, voteCount]) => [
      party,
      {
        votes: voteCount ?? 0,
        percentage: Number(
          (((voteCount ?? 0) / (totalVotes ?? 0)) * 100).toFixed(2),
        ),
        isWinner: (voteCount ?? 0) === maxVotes,
      },
    ]),
  );
}

function getCandidates(
  candidates: Record<string, string[] | undefined> | undefined,
  votePercentage: Record<string, VotePercentage> | undefined,
) {
  if (!candidates || !votePercentage) {
    return [];
  }

  return Object.entries(candidates)
    .flatMap(([party, candidateList]) =>
      (candidateList ?? []).map((candidate) => ({
        name: candidate,
        party,
        votes: votePercentage[party]?.votes ?? 0,
        percentage: votePercentage[party]?.percentage ?? 0,
        isWinner: votePercentage[party]?.isWinner ?? false,
      })),
    )
    .sort((a, b) => b.votes - a.votes);
}

function getPartyById(id: string, config: CampaignConfig) {
  const parties = config.electionConfig.parties;
  return parties.find((party) => party.id === id);
}
