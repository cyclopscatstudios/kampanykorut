import type { MenuItemType } from "../../../logic/application/AppStateMachine";
import type { IconSource } from "../Icon";

export enum MenuItemId {
  NewGame = "newGame",
  ModMaker = "modMaker",
  Settings = "settings",
  CampaignMode = "campaignMode",
  ClassicMode = "classicMode",
  GameLoader = "gameLoader",
  Back = "back",
}

export type MenuItem = {
  id: MenuItemType;
  text: string;
  icon?: string;
  iconSource?: IconSource;
  description?: string;
  [key: string]: any;
};
