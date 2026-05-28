import { CommonWrapper } from "../../../CommonWrapper";
import { Heading } from "../../../Heading";
import { Text } from "../../../Text";

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
            {percentage} %
          </Heading>
        </span>
      </div>
    </CommonWrapper>
  );
}
