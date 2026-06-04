import type { Story } from "@ladle/react";
import FullscreenBackground from "../../../ui/Background";
import { ClassicModeSelectorMenu } from "./ClassicModeSelectorMenu";

export const Default: Story = () => {
  return (
    <div className="relative">
      <FullscreenBackground path="">
        <ClassicModeSelectorMenu />
      </FullscreenBackground>
    </div>
  );
};
