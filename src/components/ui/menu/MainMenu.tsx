import { useTranslateLang } from "../../../logic/useTranslateLang";
import { MenuList } from "../MenuList";
import logo from "../../../../brand-assets/svg/logo-stacked-dark.svg";
import { MenuLayout } from "./MenuLayout";
import { MenuItemId } from "./menu.types";
import { Text } from "../Text";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { buildInfo } from "../../../buildInfo";

export function MainMenu() {
  const { quotes } = useLoaderData();
  const [quote, setQuote] = useState(() => getRandomQuote(quotes));
  const newGame = useTranslateLang("mainMenu.newGame");
  const loadGame = useTranslateLang("mainMenu.loadGame");
  const settings = useTranslateLang("mainMenu.settings");
  const about = useTranslateLang("mainMenu.about");

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full flex justify-center pt-8">
        <div className="flex flex-col items-center z-10">
          <img src={logo} alt="Company Logo" width="300" height="200" />
          <div
            className="cursor-pointer"
            onClick={() => setQuote(() => getRandomQuote(quotes))}
          >
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
      <div className="absolute bottom-3 left-0 right-0 px-4">
        <div className="border-t border-gray-200/20 pt-2 flex justify-center">
          <Text color="gray" size="xs">
            {buildInfo.isDev
              ? "dev"
              : `v${buildInfo.version} · ${buildInfo.gitCommit}`}
          </Text>
        </div>
      </div>
    </div>
  );
}

function getRandomQuote(quotes: Array<string>) {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
