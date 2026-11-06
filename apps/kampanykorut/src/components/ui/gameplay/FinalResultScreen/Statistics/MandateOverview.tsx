import { Text } from "../../../../../../../../shared/ui/Text";
import { CommonWrapper } from "../../../CommonWrapper";
import { Heading } from "../../../Heading";

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
            {mandates}
          </Heading>
          <Heading color="gray" level={5} className="mr-0.5">
            /
          </Heading>
          <Heading color="gray" level={5}>
            {all}
          </Heading>
        </span>
      </div>
    </CommonWrapper>
  );
}
