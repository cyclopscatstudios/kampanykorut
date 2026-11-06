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
    <CommonWrapper className="min-w-0">
      <div className="w-full md:w-[250px] p-2 text-left md:text-center">
        <Text
          size="sm"
          weight="light"
          color="lightBlue"
          className="max-md:!text-[10px] max-md:leading-tight max-md:min-h-7"
        >
          {label}
        </Text>
        <span className="flex flex-wrap items-baseline md:justify-center">
          <Heading level={3} color="white" className="mr-1 max-md:!text-xl">
            {Math.round(percentage * 100) / 100} %
          </Heading>
        </span>
      </div>
    </CommonWrapper>
  );
}
