import type { Story } from "@ladle/react";
import { GameLoaderMenu } from "./GameLoaderMenu";
import FullscreenBackground from "../../../ui/Background";

export const Default: Story = () => {
  return (
    <div className="relative">
      <FullscreenBackground>
        <GameLoaderMenu onClick={() => {}} />
      </FullscreenBackground>
    </div>
  );
};
