import "./App.css";
import FullscreenBackground from "./ui/Background";
import { MenuSelector } from "./components/ui/menu/MenuSelector";
import { useState } from "react";
import { MainGameScreen } from "./components/ui/gameplay/MainGameScreen";

export type ScreenType = "MenuSelector" | "MapCreator";

function App() {
  const [activeGameId, setActiveGameId] = useState<string | undefined>();
  const [currentScreen, setCurrentScreen] =
    useState<ScreenType>("MenuSelector");

  return (
    <FullscreenBackground>
      {currentScreen === "MenuSelector" ? (
        <MenuSelector
          setCurrentScreen={setCurrentScreen}
          setActiveGameId={setActiveGameId}
        />
      ) : (
        <MainGameScreen gameId={activeGameId ?? ""} />
      )}
    </FullscreenBackground>
  );
}

export default App;
