import { t } from "i18next";
import { CampaignConfig, CampaignState } from "@/shared/types";
import { CommonWrapper } from "../../../CommonWrapper";
import { Heading } from "../../../Heading";
import { Text } from "../../../../../../../../shared/ui/Text";

interface TurnoutDetailsProps {
  state: CampaignState | null;
  config: CampaignConfig;
}

export function TurnoutDetails({ state, config }: TurnoutDetailsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <NationalTurnoutPercentage
        turnout={state?.results?.totals.partyListResults["_total"] ?? 0}
        eligibleVoters={config.voterEnvironmentConfig.eligibleVoters}
      />
      <VotesCast
        turnout={state?.results?.totals.partyListResults["_total"] ?? 0}
        eligibleVoters={config.voterEnvironmentConfig.eligibleVoters}
      />
      <PrevousTurnout config={config} state={state} />
    </div>
  );
}

function PrevousTurnout({ config, state }: TurnoutDetailsProps) {
  const previousTurnout = config.voterEnvironmentConfig.turnoutHistory?.[0];
  const nationWideTurnout = getNationWideTurnoutPercentage(
    state?.results?.totals.partyListResults["_total"] ?? 0,
    config.voterEnvironmentConfig.eligibleVoters,
  );
  const difference =
    nationWideTurnout - (previousTurnout?.turnoutPercentage ?? 0);
  const trend = difference > 0 ? "up" : difference < 0 ? "down" : "flat";

  return (
    <CommonWrapper>
      <div className="w-[250px] h-[100px] p-2 text-center">
        <Text size="sm" weight="light" color="lightBlue">
          {t("endResult.statistics.turnoutDetails.turnoutChange")} (
          {previousTurnout?.year})
        </Text>
        <span className="flex items-baseline justify-center">
          <Heading
            level={3}
            className="mr-1"
            color={trend === "up" ? "green" : trend === "down" ? "red" : "gray"}
          >
            {trend === "up" ? "+" : ""}
            {difference.toFixed(2)}%
          </Heading>
        </span>
      </div>
    </CommonWrapper>
  );
}

function VotesCast({
  turnout,
  eligibleVoters,
}: {
  turnout: number;
  eligibleVoters: number;
}) {
  const turnoutInMillions = (turnout / 1000000).toFixed(2);
  const eligibleVotersInMillions = (eligibleVoters / 1000000).toFixed(2);

  return (
    <CommonWrapper>
      <div className="w-[250px] h-[100px] p-2 text-center">
        <Text size="sm" weight="light" color="lightBlue">
          {t("endResult.statistics.turnoutDetails.votesCast")}
        </Text>
        <span className="flex items-baseline justify-center">
          <Heading level={3} className="mr-1">
            {turnoutInMillions}M /
          </Heading>
          <Heading level={3} color="gray">
            {eligibleVotersInMillions}M
          </Heading>
        </span>
      </div>
    </CommonWrapper>
  );
}

function NationalTurnoutPercentage({
  turnout,
  eligibleVoters,
}: {
  turnout: number;
  eligibleVoters: number;
}) {
  const nationWideTurnout = getNationWideTurnoutPercentage(
    turnout,
    eligibleVoters,
  );

  return (
    <CommonWrapper>
      <div className="w-[250px] h-[100px] p-2 text-center">
        <Text size="sm" weight="light" color="lightBlue">
          {t("endResult.statistics.turnoutDetails.nationalTurnout")}
        </Text>
        <span className="flex items-baseline justify-center">
          <Heading level={3} className="mr-1">
            {nationWideTurnout.toFixed(2)}%
          </Heading>
        </span>
      </div>
    </CommonWrapper>
  );
}

function getNationWideTurnoutPercentage(
  turnout: number,
  eligibleVoters: number,
): number {
  return (turnout / eligibleVoters) * 100;
}
