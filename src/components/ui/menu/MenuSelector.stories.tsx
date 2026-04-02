import type { Story } from "@ladle/react";
import { MenuSelector } from "./MenuSelector";
import FullscreenBackground from "../../../ui/Background";

export const Default: Story = () => {
  return (
    <div className="relative">
      <FullscreenBackground>
        <MenuSelector setCurrentScreen={() => {}} setActiveGameId={() => {}} />
      </FullscreenBackground>
    </div>
  );
};
