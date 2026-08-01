import { CommonWrapper } from "../../../CommonWrapper";
import { Heading } from "../../../Heading";
import { Text } from "../../../../../../../../shared/ui/Text";

export function MandateOverview({
  mandates,
  all,
  label,
}: {
  mandates: number;
  all: number;
  label: string;
}) {
  return (
    <CommonWrapper>
      <div className="w-[250px] p-2 text-center">
        <Text size="sm" weight="light" color="lightBlue">
          {label}
        </Text>
        <span className="flex items-baseline justify-center">
          <Heading level={3} className="mr-1">
            {mandates}
          </Heading>
          <Heading color="lightBlue" level={5} className="mr-0.5">
            /
          </Heading>
          <Heading color="lightBlue" level={5}>
            {all}
          </Heading>
        </span>
      </div>
    </CommonWrapper>
  );
}
