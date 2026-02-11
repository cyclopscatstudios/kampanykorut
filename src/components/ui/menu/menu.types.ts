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
  id: MenuItemId;
  text: string;
  icon?: string;
  iconSource?: IconSource;
  description?: string;
  [key: string]: any;
};
