import "./App.css";
import { MapCreator } from "./components/MapCreator";
import FullscreenBackground from "./ui/Background";
import { useEffect, useState } from "react";
import { Button } from "./components/ui/Button";
import background from './assets/images/background.png';
import classNames from "classnames";
import { MenuList } from "./components/ui/MenuList";

function App() {
  return (
    <FullscreenBackground>
      <MainMenu />
      {/* <MapCreator /> */}
    </FullscreenBackground>
  );
}

export default App;

function MainMenu() {
  return (
    <div className="w-full">
      <MenuList listItems={["New Game", "Mod Maker", "Settings"]}/>
    </div>
);
}


function useTranslateLang(lang: string) {
  const [language, setLanguage] = useState('hu');
  const [tJson, setTJson] = useState();

  useEffect(() => {

  }, [])
}

