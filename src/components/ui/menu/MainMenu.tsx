import { useTranslateLang } from "../../../logic/useTranslateLang";
import { MenuItemId, MenuList, type MenuItem } from "../MenuList";
import logo from "../../../assets/logo.svg";
import { MenuLayout } from "./MenuLayout";

export function MainMenu({ onClick }: { onClick: (item: MenuItem) => void }) {
  const newGame = useTranslateLang("mainMenu.newGame");
  const modMaker = useTranslateLang("mainMenu.modMaker");
  const settings = useTranslateLang("mainMenu.settings");

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full flex justify-center pt-8">
        <div className="flex flex-col items-center z-10">
          <h1 className="font-bartle text-emerald-100/30 text-5xl tracking-widest mb-6">
            KAMPÁNYKÖRÚT
          </h1>
          <img src={logo} alt="Logo" className="w-25 h-25" />
        </div>
      </div>
      <MenuLayout>
        <MenuList
          listItems={[
            { id: MenuItemId.NewGame, text: newGame },
            { id: MenuItemId.ModMaker, text: modMaker },
            { id: MenuItemId.Settings, text: settings },
          ]}
          onClick={onClick}
        />
      </MenuLayout>
    </div>
  );
}
