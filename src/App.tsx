import "./App.css";
import FullscreenBackground from "./ui/Background";
import { MenuSelector } from "./components/ui/menu/MenuSelector";
import { MapCreator } from "./components/MapCreator";

function App() {
  return (
    <FullscreenBackground>
      <MenuSelector />
      <MapCreator />
    </FullscreenBackground>
  );
}

export default App;
