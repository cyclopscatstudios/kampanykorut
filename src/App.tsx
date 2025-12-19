import "./App.css";
import FullscreenBackground from "./ui/Background";
import { MenuSelector } from "./components/ui/menu/MenuSelector";
import { useState } from "react";
import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";

export type ScreenType = "MenuSelector" | "MapCreator";

function App() {
  const [currentScreen, setCurrentScreen] =
    useState<ScreenType>("MenuSelector");

  return (
    <FullscreenBackground>
      {currentScreen === "MenuSelector" ? (
        <MenuSelector setCurrentScreen={setCurrentScreen} />
      ) : (
        <MainGameScreen />
      )}
    </FullscreenBackground>
  );
}

export default App;
