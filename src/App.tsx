import "./App.css";
import FullscreenBackground from "./ui/Background";
import { MenuList } from "./components/ui/MenuList";
import { useTranslateLang } from "./logic/useTranslateLang";
import logo from "./assets/logo.svg";
import { Button } from "./components/ui/Button";
import { eventEmitter } from "./logic/EventEmitter";

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
  const newGame = useTranslateLang("mainMenu.newGame");
  const modMaker = useTranslateLang("mainMenu.modMaker");
  const settings = useTranslateLang("mainMenu.settings");

  return (
    <div className="flex flex-col h-full items-center">
      <div className="mt-6 flex flex-col items-center">
        <h1 className="text-emerald-100/30 text-5xl tracking-widest mb-5">
          KAMPÁNYKÖRÚT
        </h1>
        <img src={logo} alt="Logo" className="w-32 h-32" />
      </div>
      <div className="flex-1 flex items-center">
        <MenuList listItems={[newGame, modMaker, settings]} />
      </div>
    </div>
  );
}
