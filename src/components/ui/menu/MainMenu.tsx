import { MenuList } from "../MenuList";
import logo from "../../../assets/logo_reworked.png";
import { MenuLayout } from "./MenuLayout";
import { type MenuItem } from "./menu.types";
import { Text } from "../Text";
import { quotes } from "../../../assets/jsons/quotes";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function MainMenu({ onClick }: { onClick: (item: MenuItem) => void }) {
  const [quote, setQuote] = useState(() => getRandomQuote());
  const {t} = useTranslation();

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
            { id: "newGame", text: t("mainMenu.newGame"), icon: "play-circle-fill" },
            {
              id: "loadGame",
              text: t("mainMenu.loadGame"),
              icon: "clipboard-data-fill",
              disabled: true,
            },
            {
              id: "settings",
              text: t("mainMenu.settings"),
              icon: "gear-fill",
            },
            {
              id: "about",
              text: t("mainMenu.about"),
              icon: "info-circle-fill",
              disabled: true,
            },
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
