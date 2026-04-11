import type { MenuState } from "@/logic/application";
import { createContext } from "react";

const defaultMenuState: MenuState = {
  screenType: "menuScreen",
  menuType: "mainMenu",
};

export const GameStateContext = createContext<MenuState>(defaultMenuState);
