import { Text } from "../../../../../../../../shared/ui/Text";
import { CommonWrapper } from "../../../CommonWrapper";
import { Heading } from "../../../Heading";

export function PercentagesOverview({
  label,
  percentage,
}: {
  label: string;
  percentage: number;
}) {
  return (
    <CommonWrapper>
      <div className="w-[250px] p-2 text-center">
        <Text size="sm" weight="light" color="lightBlue">
          {label}
        </Text>
        <span className="flex items-baseline justify-center">
          <Heading level={3} className="mr-1">
            {Math.round(percentage * 100) / 100} %
          </Heading>
        </span>
      </div>
    </CommonWrapper>
  );
}
