import { singleton } from "tsyringe";
import { Emitter } from "./Emitter";
import type { GameConfigEngine } from "./GameConfigEngine";
import { gameModeRegistry } from "./gameModeRegistery";
import { createLogger } from "../logger";
import type { VoterEnvironment } from "../domain";
import type { DistrictGroupEngine } from "../domain/DistrictGroupEngine";
import type { StorageEngine } from "./StorageEngine";
import type { NavigationService } from "./navigation/NavigationService";

export type GameState = {
  activeCampaignId: string | null;
};

export type ScreenType = "MenuSelector" | "MapCreator";

const log = createLogger("GameStateEngine");

@singleton()
export class GameStateEngine extends Emitter<GameState> {
  private gameState: GameState = {
    activeCampaignId: null,
  };

  constructor(
    private gameConfigEngine: GameConfigEngine,
    private voterEnvironment: VoterEnvironment,
    private districtGroupEngine: DistrictGroupEngine,
    private storage: StorageEngine,
    private navigationService: NavigationService,
  ) {
    log.debug("GameStateEngine initialized");
    super();
    this.getGameState = this.getGameState.bind(this);
    this.updateGameState = this.updateGameState.bind(this);
  }

  updateGameState(gameState: Partial<GameState>) {
    log.debug("Update game state with ", gameState);
    this.gameState = { ...this.gameState, ...gameState };
    if (gameState.activeCampaignId) {
      this.gameConfigEngine.configure(
        this.getConfigByGameId(gameState.activeCampaignId),
      );
    }
    this.storage.setItem(
      "gameConfig",
      JSON.stringify(this.gameState),
      "localStorage",
    );
    this.notify(this.gameState);
  }

  getGameState(): GameState {
    return this.gameState;
  }

  clearGameState() {
    this.gameConfigEngine.configure(null);
    this.voterEnvironment.configure(null);
    this.districtGroupEngine.configure();
    this.navigationService.go("/");
  }

  private getConfigByGameId(gameId: string) {
    return gameModeRegistry[gameId].electionConfig;
  }
}
