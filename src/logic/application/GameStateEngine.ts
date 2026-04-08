import { singleton } from "tsyringe";
import { Emitter } from "./Emitter";
import type { GameConfigEngine } from "./GameConfigEngine";
import { gameModeRegistry } from "./gameModeRegistery";
import type { MenuType } from "./AppStateMachine";
import { createLogger } from "../logger";

export type GameState = {
  currentScreen: ScreenType;
  menuType: MenuType;
  activeGameId?: string;
};

export type ScreenType = "MenuSelector" | "MapCreator";

const log = createLogger("GameStateEngine");

@singleton()
export class GameStateEngine extends Emitter<GameState> {
  private gameState: GameState = {
    currentScreen: "MenuSelector",
    menuType: "mainMenu",
    activeGameId: undefined,
  };

  constructor(private gameConfigEngine: GameConfigEngine) {
    log.debug("GameStateEngine initialized");
    super();
    this.getGameState = this.getGameState.bind(this);
    this.updateGameState = this.updateGameState.bind(this);
  }

  updateGameState(gameState: Partial<GameState>) {
    this.gameState = { ...this.gameState, ...gameState };
    if (gameState.activeGameId) {
      this.gameConfigEngine.configure(
        gameModeRegistry[gameState.activeGameId].electionConfig,
      );
    }
    this.notify(this.gameState);
  }

  getGameState(): GameState {
    return this.gameState;
  }
}
