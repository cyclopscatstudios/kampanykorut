import { useTranslateLang } from "../../../logic/useTranslateLang";
import { MenuList } from "../MenuList";
import logo from "../../../assets/logo_reworked.png";
import { MenuLayout } from "./MenuLayout";
import { MenuItemId, type MenuItem } from "./menu.types";
import { Text } from "../Text";
import { quotes } from "../../../assets/jsons/quotes";
import { useState } from "react";

export function MainMenu({ onClick }: { onClick: (item: MenuItem) => void }) {
  const [quote, setQuote] = useState(() => getRandomQuote());
  const newGame = useTranslateLang("mainMenu.newGame");
  const modMaker = useTranslateLang("mainMenu.modMaker");
  const settings = useTranslateLang("mainMenu.settings");

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
            { id: MenuItemId.NewGame, text: newGame, icon: "play-circle-fill" },
            { id: MenuItemId.ModMaker, text: modMaker, icon: "pencil-fill" },
            { id: MenuItemId.Settings, text: settings, icon: "gear-fill" },
          ]}
          onClick={onClick}
        />
      </MenuLayout>
    </div>
  );
}

function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
