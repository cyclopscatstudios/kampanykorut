import { BottomBar } from "../components/ui/gameplay/BottomBar";

export function BottomBarDev() {
  return (
    <BottomBar
      onClick={function (): void {
        throw new Error("Function not implemented.");
      }}
    />
  );
}
