import { Icon, type BootstrapIcon } from "../../../Icon";
import type { StatisticResult } from "../statistics.utils";
import { CommonWrapper } from "../../../CommonWrapper";
import { calculateVotePercentages } from "../electionMap.utils";
import type { Colors } from "../../../../../types/color";
import { ProgressBar } from "./ProgressBar";
import { Text } from "../../../Text";
import { CampaignConfig } from "@/shared/types";

export function ListOverview({
  list,
  config,
  label,
  iconName,
  getParty,
  renderValue,
}: {
  list: StatisticResult[];
  label: string;
  iconName: BootstrapIcon;
  config: CampaignConfig;
  getParty: (element: StatisticResult) => string;
  renderValue: (element: StatisticResult) => React.ReactNode;
}) {
  const iconColor = getIconColor(iconName);
  return (
    <CommonWrapper>
      <div className="m-1.5">
        <div className="flex">
          <Icon name={iconName} className="mr-1.5" color={iconColor} />
          <Text size="sm" weight="light" color="lightBlue">
            {label}
          </Text>
        </div>
        <div className="w-[350px]">
          {list.slice(0, 5).map((element, index) => {
            const partyId = getParty(element);

            const votes = calculateVotePercentages(element.district.partok);

            const percentage = votes?.[partyId]?.percentage ?? 0;

            const color =
              config.electionConfig.parties.find(
                (party) => party.id === partyId,
              )?.color ?? "";

            return (
              <ListElement
                key={index}
                index={index}
                element={element}
                percentage={percentage}
                color={color}
                value={renderValue(element)}
              />
            );
          })}
        </div>
      </div>
    </CommonWrapper>
  );
}

function getIconColor(iconName: BootstrapIcon): Colors {
  switch (iconName) {
    case "x-circle-fill":
      return "red";
    case "check-circle-fill":
      return "green";
    case "exclamation-circle-fill":
      return "yellow";
    default:
      return "gray";
  }
}

interface ListElementProps {
  index: number;
  element: StatisticResult;
  percentage: number;
  color: string;
  value: React.ReactNode;
}

function ListElement({
  index,
  element,
  percentage,
  color,
  value,
}: ListElementProps) {
  return (
    <div className="flex items-center gap-5 mb-2">
      <Text>#{index + 1}</Text>

      <div className="flex-1">
        <Text size="sm">
          {element.district.megye} {element.district.oevk}
        </Text>

        <ProgressBar percentage={percentage} color={color} />
      </div>

      {value}
    </div>
  );
}
