import type { Story } from "@ladle/react";
import { ClassicModeSelectorMenu } from "./ClassicModeSelectorMenu";
import FullscreenBackground from "../../../ui/Background";

export const Default: Story = () => {
  return (
    <div className="relative">
      <FullscreenBackground path="">
        <ClassicModeSelectorMenu />
      </FullscreenBackground>
    </div>
  );
};
