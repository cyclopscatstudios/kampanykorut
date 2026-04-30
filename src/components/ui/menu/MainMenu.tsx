import { useTranslateLang } from "../../../logic/useTranslateLang";
import { MenuList } from "../MenuList";
import logo from "../../../assets/logo_reworked.png";
import { MenuLayout } from "./MenuLayout";
import { MenuItemId } from "./menu.types";
import { Text } from "../Text";
import { quotes } from "../../../assets/jsons/quotes";
import { useState } from "react";

export function MainMenu() {
  const [quote, setQuote] = useState(() => getRandomQuote());
  const newGame = useTranslateLang("mainMenu.newGame");
  const loadGame = useTranslateLang("mainMenu.loadGame");
  const settings = useTranslateLang("mainMenu.settings");
  const about = useTranslateLang("mainMenu.about");

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full flex justify-center pt-8">
        <div className="flex flex-col items-center z-10">
          <img src={logo} alt="Logo" className="w-15 h-15" />
          <Text weight="bold" color="lightBlue" className="text-5xl mt-5 mb-5">
            KAMPÁNYKÖRÚT
          </Text>
          <div onClick={() => setQuote(() => getRandomQuote())}>
            <Text color="lightBlue" className="text-sm">
              {quote}
            </Text>
          </div>
        </div>
      </div>
      <MenuLayout>
        <MenuList
          listItems={[
            {
              id: MenuItemId.NewGame,
              text: newGame,
              path: "new-game",
              icon: "play-circle-fill",
            },
            {
              id: MenuItemId.LoadSavedGame,
              text: loadGame,
              path: "load-game",
              icon: "clipboard-data-fill",
            },
            {
              id: MenuItemId.Settings,
              text: settings,
              path: "settings",
              icon: "gear-fill",
            },
            {
              id: MenuItemId.Back,
              text: about,
              path: "about",
              icon: "info-circle-fill",
              disabled: true,
            },
          ]}
        />
      </MenuLayout>
    </div>
  );
}

function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
