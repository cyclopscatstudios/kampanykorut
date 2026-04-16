import { inject, singleton } from "tsyringe";
import type { MenuItem } from "../../components/ui/menu/menu.types";
import { MenuStateRegistry, gameMenuRegistery } from "./MenuStateRegisery";
import { Emitter } from "./Emitter";
import { StateEngine } from "./StateEngine";
import { StorageEngine } from "./StorageEngine";
import { createLogger } from "../logger";

export type MenuType = (typeof gameMenuRegistery)[number];
export type MenuItemType =
  | "mainMenu"
  | "newGame"
  | "loadGame"
  | "modMaker"
  | "settings"
  | "about"
  | "classicMode"
  | "campaignMode"
  | "gameLoader"
  | "sideSelector"
  | "back";
type ScreenType = "menuScreen" | "gameScreen";
export interface MenuState {
  screenType: ScreenType;
  menuType?: MenuType;
  gameId?: string;
}

const log = createLogger("AppStateMachine");

@singleton()
export class MenuStateMachine extends Emitter<MenuState> {
  private currentState: MenuState;
  private menuHistory: MenuType[];

  constructor(@inject(StateEngine) private stateEngine: StateEngine) {
    log.debug("MenuStateMachine initialized");
    super();
    this.menuHistory = ["mainMenu"];
    this.currentState = {
      screenType: "menuScreen",
      menuType: "mainMenu",
    };
    this.stateEngine = new StateEngine(new StorageEngine());
    this.transition = this.transition.bind(this);
  }

  getCurrentScreen() {
    return this.currentState;
  }

  transition = (to: MenuItem) => {
    if (to.id === "back") {
      this.goBack();
    }

    let newState = this.getStateByMenuType(to.id);

    if (to.id !== "back" && newState.menuType) {
      this.menuHistory.push(newState.menuType);
    }

    if (to.id === "sideSelector") {
      newState = {
        ...newState,
        ...to,
      };
    }

    if (to.id === "gameLoader") {
      log.info(`Transitioning to map creator with game id of ${to.gameId}`);
      newState = {
        ...newState,
        ...to,
      };
    }

    this.setCurrentMenuState(newState);
    this.notify(newState);
  };

  private goBack() {
    console.log(this.menuHistory);
    if (this.menuHistory.length > 1) {
      this.menuHistory = this.menuHistory.slice(0, -1);
    }
  }

  private getStateByMenuType(type: MenuItemType): MenuState {
    if (type === "sideSelector") {
      return {
        menuType: "sideSelectorMenu",
        screenType: "menuScreen",
      };
    }
    if (type === "gameLoader") {
      return {
        screenType: "gameScreen",
      };
    }
    if (type === "back") {
      const previousMenu = this.menuHistory[this.menuHistory.length - 1];
      return {
        screenType: "menuScreen",
        menuType: previousMenu,
      };
    }
    const state = MenuStateRegistry[type];
    return {
      ...state,
      menuType: state.onTransition,
    };
  }

  private setCurrentMenuState(state: MenuState) {
    if (!state.menuType) {
      this.currentState = {
        screenType: "gameScreen",
      };
    } else {
      this.currentState = {
        screenType: "menuScreen",
        menuType: state.menuType,
      };
    }
    this.stateEngine.saveSession(state, "menuSession");
  }
}
