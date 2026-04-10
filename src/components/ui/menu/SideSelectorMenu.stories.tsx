import type { Story } from "@ladle/react";
import { SideSelectorMenu } from "./SideSelectorMenu";
import { noop } from "../../../dev/FunctionUtils";

export const Default: Story = () => {
  return <SideSelectorMenu onClick={noop} />;
};
