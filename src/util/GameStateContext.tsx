import type { GameState } from "@/logic/application";
import { createContext } from "react";

const defaultGameState: GameState = {
  currentScreen: "MenuSelector",
  menuType: "mainMenu",
};

export const GameStateContext = createContext<GameState>(defaultGameState);
